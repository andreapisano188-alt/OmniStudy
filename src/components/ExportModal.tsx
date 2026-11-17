import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, Upload, RotateCcw, X, ShieldCheck, FileJson, 
  Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, Key, Layers
} from 'lucide-react';
import { AppState } from '../types';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  parseFirebaseConfig, 
  getSyncRoomId, 
  setSyncRoomId,
  subscribeToSyncStatus,
  initializeFirebaseSync,
  disconnectSync,
  pushStateToCloud,
  SyncStatus,
  FirebaseClientConfig
} from '../services/firebaseSyncService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onImportState: (imported: Partial<AppState>) => void;
  onResetToDefault: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  appState,
  onImportState,
  onResetToDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [statusDetails, setStatusDetails] = useState<string>('');
  const [savedConfig, setSavedConfig] = useState<FirebaseClientConfig | null>(null);
  const [roomId, setRoomIdState] = useState<string>('');
  const [manualJsonText, setManualJsonText] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const localFileInputRef = useRef<HTMLInputElement>(null);
  const firebaseJsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSavedFirebaseConfig();
      setSavedConfig(cfg);
      setRoomIdState(getSyncRoomId());
      const unsubscribe = subscribeToSyncStatus((st, det) => {
        setSyncStatus(st);
        if (det) setStatusDetails(det);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleApplyFirebaseConfig = (parsed: FirebaseClientConfig) => {
    saveFirebaseConfig(parsed);
    setSavedConfig(parsed);
    const activeRoom = roomId.trim() || 'omnistudy_main_vault';
    setSyncRoomId(activeRoom);

    const ok = initializeFirebaseSync(parsed, activeRoom, (remoteState) => {
      onImportState(remoteState);
    });

    if (ok) {
      showFeedback('success', `Configurazione applicata! Connessione a Firebase (${parsed.projectId}) avviata.`);
      // Invia anche i dati attuali al cloud
      setTimeout(() => {
        pushStateToCloud(appState);
      }, 1000);
    } else {
      showFeedback('error', 'Errore durante la connessione a Firebase.');
    }
  };

  const handleFirebaseFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseFirebaseConfig(text);
        if (!parsed) {
          showFeedback('error', 'Il file JSON non è valido. Assicurati che sia google-services.json o firebase-config.json.');
          return;
        }
        handleApplyFirebaseConfig(parsed);
      } catch (err: any) {
        showFeedback('error', 'Errore lettura file JSON: ' + (err?.message || 'File corrotto'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualJsonSubmit = () => {
    if (!manualJsonText.trim()) return;
    try {
      const parsed = parseFirebaseConfig(manualJsonText.trim());
      if (!parsed) {
        showFeedback('error', 'Formato JSON non valido per Firebase.');
        return;
      }
      handleApplyFirebaseConfig(parsed);
      setShowManualInput(false);
      setManualJsonText('');
    } catch (err: any) {
      showFeedback('error', 'JSON non valido: ' + err.message);
    }
  };

  const handleDisconnectFirebase = () => {
    if (confirm('Vuoi disconnettere la sincronizzazione cloud? I tuoi dati rimarranno comunque salvati sul dispositivo.')) {
      disconnectSync();
      saveFirebaseConfig(null);
      setSavedConfig(null);
      showFeedback('success', 'Sincronizzazione cloud disconnessa.');
    }
  };

  const handleForceSyncNow = () => {
    pushStateToCloud(appState);
    showFeedback('success', 'Sincronizzazione con il cloud inviata!');
  };

  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: appState.subjects,
      pages: appState.pages,
      flashcards: appState.flashcards,
      exams: appState.exams,
      studySessions: appState.studySessions,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnistudy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.pages && json.subjects) {
          onImportState(json);
          alert('Backup ripristinato con successo! I tuoi appunti sono aggiornati.');
          onClose();
        } else {
          alert('File di backup non valido.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-notion-card-dark rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-notion-border-light dark:border-notion-border-dark relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Cloud size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Sincronizzazione & Backup</h3>
            <p className="text-xs text-gray-400">
              Mantieni aggiornati note e flashcard su tutti i tuoi dispositivi
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 mb-5">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-notion-bg-dark text-blue-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Cloud size={14} />
            <span>Cloud Sync (Automatico)</span>
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'local'
                ? 'bg-white dark:bg-notion-bg-dark text-blue-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileJson size={14} />
            <span>Backup Locale (.json)</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
          >
            {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: CLOUD SYNC */}
        {activeTab === 'cloud' && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Stato Sincronizzazione:</span>
                <span className="flex items-center space-x-1.5 text-xs font-bold">
                  {syncStatus === 'connected' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-500">Sincronizzato in Tempo Reale</span>
                    </>
                  )}
                  {syncStatus === 'syncing' && (
                    <>
                      <RefreshCw size={13} className="text-blue-500 animate-spin" />
                      <span className="text-blue-500">Invio modifiche al Cloud...</span>
                    </>
                  )}
                  {syncStatus === 'connecting' && (
                    <>
                      <RefreshCw size={13} className="text-amber-500 animate-spin" />
                      <span className="text-amber-500">Connessione a Firebase...</span>
                    </>
                  )}
                  {syncStatus === 'offline' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-amber-500">Offline (salvato localmente)</span>
                    </>
                  )}
                  {syncStatus === 'disconnected' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                      <span className="text-gray-400">Non configurato</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-red-500">Errore: {statusDetails || 'Connessione fallita'}</span>
                    </>
                  )}
                </span>
              </div>

              {savedConfig && (
                <div className="pt-2 text-[11px] text-gray-400 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span>Progetto: <strong className="text-gray-700 dark:text-gray-200">{savedConfig.projectId}</strong></span>
                  <span>Stanza / Vault: <strong className="text-gray-700 dark:text-gray-200">{roomId || 'Default'}</strong></span>
                </div>
              )}
            </div>

            {/* If connected: Show control buttons */}
            {savedConfig ? (
              <div className="space-y-2">
                <button
                  onClick={handleForceSyncNow}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99]"
                >
                  <RefreshCw size={14} />
                  <span>Forza Sincronizzazione Adesso</span>
                </button>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-gray-500">Codice Stanza Sincronizzazione (Vault ID)</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomIdState(e.target.value)}
                      placeholder="es: omnistudy_main_vault"
                      className="flex-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const newRoom = roomId.trim() || 'omnistudy_main_vault';
                        setSyncRoomId(newRoom);
                        if (savedConfig) {
                          initializeFirebaseSync(savedConfig, newRoom, onImportState);
                          showFeedback('success', 'Stanza aggiornata: ' + newRoom);
                        }
                      }}
                      className="px-3 py-2 bg-black/10 dark:bg-white/10 hover:bg-black/15 text-xs font-bold rounded-xl transition-colors"
                    >
                      Aggiorna
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Tutti i dispositivi che usano lo stesso Codice Stanza condivideranno le stesse note.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDisconnectFirebase}
                    className="w-full py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Disconnetti Sincronizzazione Cloud
                  </button>
                </div>
              </div>
            ) : (
              /* If not connected: Show Setup UI */
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Per sincronizzare l'app in tempo reale su <strong>tutti i dispositivi</strong> (Android, Mac, iPhone e Web), aggiungi il tuo file <strong>google-services.json</strong> di Firebase o il file di configurazione web:
                </p>

                {/* Stanza ID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">1. Scegli il tuo Codice Stanza / Vault (opzionale)</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomIdState(e.target.value)}
                    placeholder="omnistudy_main_vault (o un tuo codice segreto)"
                    className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400">
                    Usa questo stesso codice su tutti i tuoi dispositivi per collegarli insieme.
                  </p>
                </div>

                {/* File picker button */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-gray-500">2. Seleziona il file JSON di Firebase</label>
                  <button
                    onClick={() => firebaseJsonInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 p-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-[0.99]"
                  >
                    <Upload size={16} />
                    <span>Carica file google-services.json / firebase-config.json</span>
                  </button>
                  <input
                    ref={firebaseJsonInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFirebaseFileSelected}
                    className="hidden"
                  />
                </div>

                {/* Manual paste toggle */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-xs text-blue-500 hover:underline flex items-center space-x-1"
                  >
                    <span>{showManualInput ? 'Nascondi inserimento manuale' : 'Oppure incolla il codice JSON manualmente'}</span>
                  </button>

                  {showManualInput && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={manualJsonText}
                        onChange={(e) => setManualJsonText(e.target.value)}
                        placeholder='Incolla qui il contenuto del file google-services.json o {"apiKey": "...", "projectId": "...", ...}'
                        rows={5}
                        className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-[11px] font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleManualJsonSubmit}
                        disabled={!manualJsonText.trim()}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Salva e Avvia Sincronizzazione
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOCAL BACKUP */}
        {activeTab === 'local' && (
          <div className="space-y-3">
            {/* Export Button */}
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <Download size={18} className="text-blue-500" />
                <div>
                  <h4 className="text-sm font-bold">Esporta Backup (.json)</h4>
                  <p className="text-xs text-gray-400">Salva tutte le materie, appunti e flashcard</p>
                </div>
              </div>
            </button>

            {/* Import Button */}
            <button
              onClick={() => localFileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <Upload size={18} className="text-emerald-500" />
                <div>
                  <h4 className="text-sm font-bold">Importa Backup (.json)</h4>
                  <p className="text-xs text-gray-400">Carica un backup salvato in precedenza</p>
                </div>
              </div>
            </button>
            <input
              ref={localFileInputRef}
              type="file"
              accept=".json"
              onChange={handleLocalFileChange}
              className="hidden"
            />

            {/* Reset to Default */}
            <button
              onClick={() => {
                if (confirm('Vuoi ripristinare i dati di esempio iniziali? I tuoi dati attuali verranno sostituiti.')) {
                  onResetToDefault();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-colors text-left group text-red-500"
            >
              <div className="flex items-center space-x-3">
                <RotateCcw size={18} />
                <div>
                  <h4 className="text-sm font-bold">Ripristina Note Esempio</h4>
                  <p className="text-xs text-red-400/80">Ricarica le note guida (Analisi, Algoritmi, Biologia)</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-notion-border-light dark:border-notion-border-dark flex items-center space-x-2 text-[11px] text-gray-400">
          <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
          <span>I tuoi dati sono protetti e crittografati in transito. Funziona anche offline.</span>
        </div>
      </div>
    </div>
  );
};
