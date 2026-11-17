import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgfmxwYaN00JF7Cf0pkTQgiVdz5M89qB0",
  authDomain: "omnistudy-6baae.firebaseapp.com",
  projectId: "omnistudy-6baae",
  storageBucket: "omnistudy-6baae.firebasestorage.app",
  messagingSenderId: "12403121500",
  appId: "1:12403121500:web:946e796c92ec29f902f599",
  measurementId: "G-8TFQ4SHF13"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza Firestore con supporto offline per l'APK
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
