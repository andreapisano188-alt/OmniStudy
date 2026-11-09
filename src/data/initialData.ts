import { Subject, Page, Flashcard, Exam } from '../types';

export const initialSubjects: Subject[] = [
  { id: 'sub-1', name: 'Analisi Matematica & Fisica', icon: '📐', color: '#3b82f6' },
  { id: 'sub-2', name: 'Algoritmi & Informatica', icon: '💻', color: '#10b981' },
  { id: 'sub-3', name: 'Biologia Molecolare', icon: '🧬', color: '#ec4899' },
  { id: 'sub-4', name: 'Economia & Gestione', icon: '📊', color: '#f59e0b' },
];

export const initialPages: Page[] = [
  {
    id: 'page-1',
    subjectId: 'sub-1',
    title: 'Derivate e Limiti Notevoli',
    icon: '⚡',
    cover: 'linear-gradient(135deg, #2563eb 0%, #1e1b4b 100%)',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    status: 'in_corso',
    isFavorite: true,
    tags: ['Analisi 1', 'Formule', 'Active Recall'],
    blocks: [
      {
        id: 'b-1',
        type: 'callout',
        calloutType: 'formula',
        content: 'Definizione fondamentale di Derivata',
        extra: 'La derivata misura il tasso di variazione istantaneo di una funzione rispetto alla sua variabile indipendente.'
      },
      {
        id: 'b-2',
        type: 'math',
        content: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
      },
      {
        id: 'b-3',
        type: 'h2',
        content: '🧠 Active Recall: Test Rapido Limiti'
      },
      {
        id: 'b-4',
        type: 'toggle',
        content: 'Quanto vale il limite notevole lim (x->0) sin(x)/x ?',
        extra: 'Vale esattamente 1. È fondamentale per calcolare le derivate delle funzioni goniometriche.'
      },
      {
        id: 'b-5',
        type: 'toggle',
        content: 'Qual è la derivata di ln(x) e qual è il suo dominio?',
        extra: 'La derivata di ln(x) è 1/x, definita per ogni x > 0.'
      },
      {
        id: 'b-6',
        type: 'h2',
        content: '📋 Checklist Argomenti da Completare'
      },
      {
        id: 'b-7',
        type: 'todo',
        content: 'Dimostrare il Teorema di Lagrange (del Valor Medio)',
        checked: true
      },
      {
        id: 'b-8',
        type: 'todo',
        content: 'Risolvere 10 integrali per sostituzione',
        checked: false
      },
      {
        id: 'b-9',
        type: 'todo',
        content: 'Ripassare lo sviluppo di Taylor fino al 3° ordine',
        checked: false
      }
    ]
  },
  {
    id: 'page-2',
    subjectId: 'sub-2',
    title: 'Ricerca Binaria e Complessità O(log n)',
    icon: '⚡',
    cover: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
    status: 'pronto',
    isFavorite: true,
    tags: ['Algoritmi', 'Python', 'Big-O'],
    blocks: [
      {
        id: 'b-21',
        type: 'callout',
        calloutType: 'tip',
        content: 'Regola d\'oro della Binary Search',
        extra: 'La ricerca binaria richiede SEMPRE che l\'array sia già ordinato. Se non lo è, il costo di ordinamento O(n log n) annulla il vantaggio.'
      },
      {
        id: 'b-22',
        type: 'h2',
        content: 'Implementazione in Python'
      },
      {
        id: 'b-23',
        type: 'code',
        extra: 'python',
        content: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1`
      },
      {
        id: 'b-24',
        type: 'toggle',
        content: 'Perché la complessità è O(log n)?',
        extra: 'Perché ad ogni iterazione lo spazio di ricerca viene dimezzato (n/2, n/4, ..., 1). Il numero massimo di passi è log2(n).'
      }
    ]
  },
  {
    id: 'page-3',
    subjectId: 'sub-3',
    title: 'Sintesi Proteica: Trascrizione e Traduzione',
    icon: '🧬',
    cover: 'linear-gradient(135deg, #db2777 0%, #831843 100%)',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    status: 'in_corso',
    tags: ['Biologia', 'Medicina'],
    blocks: [
      {
        id: 'b-31',
        type: 'callout',
        calloutType: 'info',
        content: 'Dogma Centrale della Biologia',
        extra: 'DNA -> Trascrizione -> mRNA -> Traduzione -> Proteina funzionale.'
      },
      {
        id: 'b-32',
        type: 'toggle',
        content: 'Cosa fa l\'enzima RNA Polimerasi?',
        extra: 'Legge il filamento stampo di DNA in direzione 3\' -> 5\' e sintetizza una molecola di mRNA complementare in direzione 5\' -> 3\'.'
      },
      {
        id: 'b-33',
        type: 'toggle',
        content: 'Qual è il codone di inizio universale e cosa codifica?',
        extra: 'Il codone di inizio è AUG e codifica per l\'amminoacido Metionina (Met).'
      }
    ]
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'card-1',
    subjectId: 'sub-1',
    pageId: 'page-1',
    front: 'lim (x->0) sin(x)/x = ?',
    back: '1 (Uno). Limite fondamentale per la trigonometria.',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReviewDate: Date.now(),
  },
  {
    id: 'card-2',
    subjectId: 'sub-1',
    pageId: 'page-1',
    front: 'Qual è la derivata di f(x) = e^(2x)?',
    back: "f'(x) = 2 * e^(2x) per la regola della catena (chain rule).",
    interval: 3,
    easeFactor: 2.5,
    repetition: 1,
    nextReviewDate: Date.now(),
  },
  {
    id: 'card-3',
    subjectId: 'sub-2',
    pageId: 'page-2',
    front: 'Qual è la complessità temporale di Binary Search?',
    back: 'O(log n) nel caso medio e peggiore, O(1) nel caso migliore.',
    interval: 4,
    easeFactor: 2.6,
    repetition: 2,
    nextReviewDate: Date.now(),
  },
  {
    id: 'card-4',
    subjectId: 'sub-3',
    pageId: 'page-3',
    front: 'Qual è il codone di start (inizio) nella sintesi proteica?',
    back: 'AUG (codifica per la Metionina).',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReviewDate: Date.now(),
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exam-1',
    subjectId: 'sub-1',
    title: 'Esame di Analisi Matematica 1',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // tra 14 giorni
    targetGrade: '30L',
    progress: 65,
    topics: [
      { id: 't-1', title: 'Studio di Funzione e Derivate', completed: true },
      { id: 't-2', title: 'Limiti e Teoremi di Continuità', completed: true },
      { id: 't-3', title: 'Integrali definiti e indefiniti', completed: false },
      { id: 't-4', title: 'Serie numeriche e convergenza', completed: false }
    ]
  },
  {
    id: 'exam-2',
    subjectId: 'sub-2',
    title: 'Esame di Algoritmi e Strutture Dati',
    date: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0], // tra 25 giorni
    targetGrade: '30',
    progress: 80,
    topics: [
      { id: 't-21', title: 'Complessità asintotica Big-O', completed: true },
      { id: 't-22', title: 'Alberi Binari di Ricerca (BST)', completed: true },
      { id: 't-23', title: 'Grafi: BFS, DFS e Dijkstra', completed: true },
      { id: 't-24', title: 'Programmazione Dinamica', completed: false }
    ]
  }
];
