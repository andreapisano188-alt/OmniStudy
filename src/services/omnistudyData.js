import { useFirestoreData } from '../hooks/useFirestoreData';

// 1. Materie di studio
export function useSubjects() {
  return useFirestoreData('omnistudy_subjects');
}

// 2. Task e impegni
export function useTasks() {
  return useFirestoreData('omnistudy_tasks');
}

// 3. Appunti e documentazione
export function useNotes() {
  return useFirestoreData('omnistudy_notes');
}

// 4. Sessioni di studio e storico del timer
export function useStudySessions() {
  return useFirestoreData('omnistudy_sessions');
}
