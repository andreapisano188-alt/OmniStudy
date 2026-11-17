import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { AppState } from '../types';
import defaultBundledConfig from '../config/firebase-config.json';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error' | 'offline';

const CONFIG_STORAGE_KEY = 'omnistudy_firebase_config';
const ROOM_ID_STORAGE_KEY = 'omnistudy_sync_room_id';
const DEFAULT_ROOM_ID = 'omnistudy_main_vault';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let unsubscribeSnapshot: Unsubscribe | null = null;
let isApplyingRemoteChange = false;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let currentStatus: SyncStatus = 'disconnected';
let statusListeners: ((status: SyncStatus, details?: string) => void)[] = [];

/**
 * Normalizza qualsiasi JSON: sia formato Web (apiKey, projectId...)
 * sia formato nativo Android google-services.json
 */
export function parseFirebaseConfig(raw: string | object): FirebaseClientConfig | null {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Caso 1: google-services.json di Android
    if (data.project_info && Array.isArray(data.client)) {
      const client = data.client[0];
      const apiKey = client?.api_key?.[0]?.current_key;
      const projectId = data.project_info.project_id;
      const appId = client?.client_info?.mobilesdk_app_id;
      const projectNumber = data.project_info.project_number;
      const storageBucket = data.project_info.storage_bucket;

      if (!apiKey || !projectId || !appId) {
        throw new Error('google-services.json non contiene i campi minimi (apiKey, projectId, appId)');
      }

      return {
        apiKey,
        projectId,
        appId,
        authDomain: `${projectId}.firebaseapp.com`,
        storageBucket: storageBucket || `${projectId}.appspot.com`,
        messagingSenderId: projectNumber,
      };
    }

    // Caso 2: firebase-config.json standard Web
    if (data.apiKey && data.projectId && data.appId) {
      return {
        apiKey: data.apiKey,
        projectId: data.projectId,
        appId: data.appId,
        authDomain: data.authDomain || `${data.projectId}.firebaseapp.com`,
        storageBucket: data.storageBucket || `${data.projectId}.appspot.com`,
        messagingSenderId: data.messagingSenderId,
      };
    }

    return null;
  } catch (err) {
    console.error('Errore nel parsing della configurazione Firebase:', err);
    return null;
  }
}

export function getSavedFirebaseConfig(): FirebaseClientConfig | null {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Errore lettura config Firebase da localStorage', e);
  }
  
  // Controlla se è stato compilato con un file config integrato
  if (defaultBundledConfig && typeof defaultBundledConfig === 'object' && Object.keys(defaultBundledConfig).length > 0) {
    const parsed = parseFirebaseConfig(defaultBundledConfig);
    if (parsed) return parsed;
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseClientConfig | null) {
  if (!config) {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    disconnectSync();
  } else {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function getSyncRoomId(): string {
  return localStorage.getItem(ROOM_ID_STORAGE_KEY) || DEFAULT_ROOM_ID;
}

export function setSyncRoomId(roomId: string) {
  localStorage.setItem(ROOM_ID_STORAGE_KEY, roomId.trim() || DEFAULT_ROOM_ID);
}

export function subscribeToSyncStatus(listener: (status: SyncStatus, details?: string) => void): () => void {
  statusListeners.push(listener);
  listener(currentStatus);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== listener);
  };
}

function updateStatus(newStatus: SyncStatus, details?: string) {
  currentStatus = newStatus;
  statusListeners.forEach((l) => l(newStatus, details));
}

/**
 * Inizializza la connessione Firebase e il listener Firestore
 */
export function initializeFirebaseSync(
  config: FirebaseClientConfig,
  roomId: string,
  onRemoteStateReceived: (remoteData: Partial<AppState>) => void
): boolean {
  try {
    disconnectSync();
    updateStatus('connecting');

    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    dbInstance = getFirestore(appInstance);
    const docRef = doc(dbInstance, 'omnistudy_sync', roomId || DEFAULT_ROOM_ID);

    // Ascolto in tempo reale (Realtime listener)
    unsubscribeSnapshot = onSnapshot(
      docRef,
      (snapshot) => {
        if (!navigator.onLine) {
          updateStatus('offline');
        } else {
          updateStatus('connected');
        }

        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData && remoteData.payload) {
            // Se la modifica è stata generata da un altro dispositivo
            isApplyingRemoteChange = true;
            try {
              onRemoteStateReceived(remoteData.payload);
            } finally {
              setTimeout(() => {
                isApplyingRemoteChange = false;
              }, 500);
            }
          }
        }
      },
      (error) => {
        console.error('Errore listener Firestore:', error);
        updateStatus('error', error.message);
      }
    );

    return true;
  } catch (err: any) {
    console.error('Errore inizializzazione Firebase Sync:', err);
    updateStatus('error', err?.message || 'Inizializzazione fallita');
    return false;
  }
}

/**
 * Disconnette il listener Firebase
 */
export function disconnectSync() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
    pendingTimeout = null;
  }
  dbInstance = null;
  appInstance = null;
  updateStatus('disconnected');
}

/**
 * Invia le modifiche locali al Cloud con debounce
 */
export function pushStateToCloud(state: AppState) {
  if (isApplyingRemoteChange || !dbInstance) return;

  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
  }

  pendingTimeout = setTimeout(async () => {
    if (!dbInstance) return;
    try {
      updateStatus('syncing');
      const roomId = getSyncRoomId();
      const docRef = doc(dbInstance, 'omnistudy_sync', roomId);

      const payload = {
        subjects: state.subjects,
        pages: state.pages,
        flashcards: state.flashcards,
        exams: state.exams,
        studySessions: state.studySessions,
        updatedAt: Date.now(),
      };

      await setDoc(docRef, { payload, lastModifiedBy: 'device_' + (navigator.userAgent.slice(0, 30)) }, { merge: true });
      updateStatus('connected');
    } catch (err: any) {
      console.error('Errore sincronizzazione verso Firestore:', err);
      updateStatus('error', err?.message || 'Salvataggio cloud fallito');
    }
  }, 1200);
}
