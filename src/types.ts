export type BlockType = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'paragraph' 
  | 'todo' 
  | 'toggle' 
  | 'callout' 
  | 'math' 
  | 'code' 
  | 'quote' 
  | 'divider';

export type CalloutType = 'info' | 'tip' | 'warning' | 'formula';

export interface Block {
  id: string;
  type: BlockType;
  content: string; // Text content, question for toggle, or formula
  extra?: string;   // Answer for toggle, language for code, callout description, etc.
  checked?: boolean; // For todo items
  calloutType?: CalloutType; // For callout
}

export interface Page {
  id: string;
  subjectId: string;
  title: string;
  icon: string; // Emoji
  cover?: string; // Gradient or image CSS
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  status: 'da_studiare' | 'in_corso' | 'ripassato' | 'pronto';
  isFavorite?: boolean;
  tags: string[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // Emoji
  color: string; // Tailwind color class or hex
}

export interface Flashcard {
  id: string;
  pageId?: string;
  subjectId: string;
  front: string; // Domanda / Concetto
  back: string;  // Risposta / Spiegazione
  interval: number; // Giorni al prossimo ripasso
  easeFactor: number; // Default 2.5
  repetition: number;
  nextReviewDate: number; // Timestamp
  lastReviewedDate?: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  targetGrade?: string; // Es. "30L", "A+"
  progress: number; // 0 - 100
  topics: { id: string; title: string; completed: boolean }[];
}

export interface StudySession {
  date: string; // YYYY-MM-DD
  minutes: number;
  pomodoros: number;
  cardsReviewed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AppState {
  subjects: Subject[];
  pages: Page[];
  flashcards: Flashcard[];
  exams: Exam[];
  studySessions: StudySession[];
  activePageId: string | null;
  activeView: 'editor' | 'flashcards' | 'pomodoro' | 'exams' | 'gemini' | 'wolfram' | 'quiz' | 'settings';
  theme: 'dark' | 'light';
  geminiApiKey?: string;
  wolframAppId?: string;
}
