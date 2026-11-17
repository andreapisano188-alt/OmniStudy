import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from '../firebase';

export function useFirestoreData(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincronizzazione in tempo reale (Web <-> APK)
  useEffect(() => {
    const colRef = collection(db, collectionName);
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Errore caricamento ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  // Aggiungi elemento
  const addItem = async (item) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Errore aggiunta:", error);
    }
  };

  // Modifica elemento
  const updateItem = async (id, updatedFields) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Errore aggiornamento:", error);
    }
  };

  // Elimina elemento
  const deleteItem = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Errore eliminazione:", error);
    }
  };

  return { data, loading, addItem, updateItem, deleteItem };
}
