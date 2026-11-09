import React, { useState, useEffect } from 'react';
import { 
  Subject, Page, Flashcard, Exam, StudySession, AppState, Block 
} from './types';
import { 
  initialSubjects, initialPages, initialFlashcards, initialExams 
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PageEditor } from './components/PageEditor';
import { FlashcardsView } from './components/FlashcardsView';
import { PomodoroView } from './components/PomodoroView';
import { ExamsView } from './components/ExamsView';
import { GeminiTutorView } from './components/GeminiTutorView';
import { WolframView } from './components/WolframView';
import { QuizView } from './components/QuizView';
import { SearchModal } from './components/SearchModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { BookOpen, Brain, Clock, Target, Plus, Sparkles, Sigma } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'omnistudy_v1_state';

export const App: React.FC = () => {
  // Load state from local storage or initial sample data
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          activeView: parsed.activeView || 'editor',
          theme: parsed.theme || 'dark',
          geminiApiKey: parsed.geminiApiKey || localStorage.getItem('gemini_api_key') || '',
          wolframAppId: parsed.wolframAppId || localStorage.getItem('wolfram_app_id') || '',
        };
      }
    } catch (e) {
      console.error('Error loading state from localStorage', e);
    }
    return {
      subjects: initialSubjects,
      pages: initialPages,
      flashcards: initialFlashcards,
      exams: initialExams,
      studySessions: [],
      activePageId: initialPages[0]?.id || null,
      activeView: 'editor',
      theme: 'dark',
      geminiApiKey: localStorage.getItem('gemini_api_key') || '',
      wolframAppId: localStorage.getItem('wolfram_app_id') || '',
    };
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studyFlashcardPageId, setStudyFlashcardPageId] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      if (state.geminiApiKey) localStorage.setItem('gemini_api_key', state.geminiApiKey);
      if (state.wolframAppId) localStorage.setItem('wolfram_app_id', state.wolframAppId);
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [state]);

  // Sync dark class on html tag
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Active page and subject
  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const activeSubject = activePage ? state.subjects.find((s) => s.id === activePage.subjectId) : undefined;

  // Handlers
  const handleSelectPage = (id: string) => {
    setState((prev) => ({
      ...prev,
      activePageId: id,
      activeView: 'editor',
    }));
  };

  const handleUpdatePage = (updatedPage: Page) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === updatedPage.id ? updatedPage : p)),
    }));
  };

  const handleDeletePage = (pageId: string) => {
    setState((prev) => {
      const remainingPages = prev.pages.filter((p) => p.id !== pageId);
      return {
        ...prev,
        pages: remainingPages,
        activePageId: remainingPages[0]?.id || null,
      };
    });
  };

  const handleAddPage = (subjectId: string) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      subjectId,
      title: 'Nuovo Appunto',
      icon: '📝',
      cover: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'da_studiare',
      tags: [],
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'h1',
          content: 'Concetti Chiave',
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'paragraph',
          content: 'Inizia a prendere appunti qui. Usa i toggle per le domande di Active Recall!',
        },
        {
          id: `b-${Date.now()}-3`,
          type: 'toggle',
          content: 'Domanda di Active Recall (clicca per la risposta)',
          extra: 'Risposta spiegata dettagliatamente.',
        }
      ],
    };

    setState((prev) => ({
      ...prev,
      pages: [newPage, ...prev.pages],
      activePageId: newPage.id,
      activeView: 'editor',
    }));
  };

  const handleAddSubject = () => {
    const name = prompt('Nome del nuovo corso / materia:');
    if (!name || !name.trim()) return;

    const icons = ['📘', '📙', '📗', '📕', '🔬', '💡', '🎨', '💼'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      icon: randomIcon,
      color: '#3b82f6',
    };

    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));

    handleAddPage(newSubject.id);
  };

  const handleUpdateFlashcard = (updatedCard: Flashcard) => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    }));
  };

  const handleAddFlashcard = (subjectId: string, front: string, back: string, pageId?: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      subjectId,
      pageId,
      front,
      back,
      interval: 1,
      easeFactor: 2.5,
      repetition: 0,
      nextReviewDate: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      flashcards: [newCard, ...prev.flashcards],
    }));
  };

  const handleAddMultipleFlashcards = (cards: { front: string; back: string }[], subjectId: string, pageId?: string) => {
    const newCards: Flashcard[] = cards.map((c, i) => ({
      id: `card-${Date.now()}-${i}`,
      subjectId,
      pageId,
      front: c.front,
      back: c.back,
      interval: 1,
      easeFactor: 2.5,
      repetition: 0,
      nextReviewDate: Date.now(),
    }));

    setState((prev) => ({
      ...prev,
      flashcards: [...newCards, ...prev.flashcards],
    }));
  };

  // Insert content into the active study note (from Gemini or Wolfram)
  const handleInsertIntoActivePage = (content: string, type: 'callout' | 'paragraph') => {
    if (!activePage) return;

    const newBlock: Block = {
      id: `b-${Date.now()}`,
      type: type,
      content: type === 'callout' ? 'Spiegazione del Tutor Gemini' : content,
      extra: type === 'callout' ? content : undefined,
      calloutType: 'tip'
    };

    const updatedBlocks = [...activePage.blocks, newBlock];
    handleUpdatePage({ ...activePage, blocks: updatedBlocks, updatedAt: Date.now() });
  };

  const handleInsertMathIntoActivePage = (latex: string, explanation?: string) => {
    if (!activePage) return;

    const mathBlock: Block = {
      id: `b-${Date.now()}-math`,
      type: 'math',
      content: latex,
    };

    let updatedBlocks = [...activePage.blocks, mathBlock];

    if (explanation) {
      const calloutBlock: Block = {
        id: `b-${Date.now()}-desc`,
        type: 'callout',
        calloutType: 'formula',
        content: 'Risoluzione Wolfram|Alpha',
        extra: explanation
      };
      updatedBlocks.push(calloutBlock);
    }

    handleUpdatePage({ ...activePage, blocks: updatedBlocks, updatedAt: Date.now() });
  };

  const handlePomodoroCompleted = (subjectId: string, minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState((prev) => {
      const existingSession = prev.studySessions.find((s) => s.date === today);
      if (existingSession) {
        return {
          ...prev,
          studySessions: prev.studySessions.map((s) =>
            s.date === today
              ? { ...s, minutes: s.minutes + minutes, pomodoros: s.pomodoros + 1 }
              : s
          ),
        };
      } else {
        return {
          ...prev,
          studySessions: [
            ...prev.studySessions,
            { date: today, minutes, pomodoros: 1, cardsReviewed: 0 },
          ],
        };
      }
    });
  };

  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleStartStudyFlashcards = (pageId?: string) => {
    setStudyFlashcardPageId(pageId || null);
    setState((prev) => ({ ...prev, activeView: 'flashcards' }));
  };

  const handleSaveApiKeys = (geminiKey: string, wolframId: string) => {
    setState((prev) => ({
      ...prev,
      geminiApiKey: geminiKey,
      wolframAppId: wolframId,
    }));
  };

  const handleResetToDefault = () => {
    setState({
      subjects: initialSubjects,
      pages: initialPages,
      flashcards: initialFlashcards,
      exams: initialExams,
      studySessions: [],
      activePageId: initialPages[0]?.id || null,
      activeView: 'editor',
      theme: 'dark',
      geminiApiKey: state.geminiApiKey,
      wolframAppId: state.wolframAppId,
    });
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-notion-bg-light dark:bg-notion-bg-dark text-notion-text-light dark:text-notion-text-dark select-none fixed inset-0">
      {/* Sidebar */}
      <Sidebar
        subjects={state.subjects}
        pages={state.pages}
        activePageId={state.activePageId}
        activeView={state.activeView}
        theme={state.theme}
        onSelectPage={handleSelectPage}
        onSelectView={(v) => setState((prev) => ({ ...prev, activeView: v }))}
        onAddPage={handleAddPage}
        onAddSubject={handleAddSubject}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeView={state.activeView}
          activePage={activePage}
          activeSubject={activeSubject}
          theme={state.theme}
          onToggleTheme={handleToggleTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenGemini={() => setState((prev) => ({ ...prev, activeView: 'gemini' }))}
          onOpenWolfram={() => setState((prev) => ({ ...prev, activeView: 'wolfram' }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {state.activeView === 'editor' && activePage && (
            <PageEditor
              page={activePage}
              subject={activeSubject}
              onUpdatePage={handleUpdatePage}
              onDeletePage={handleDeletePage}
              onStudyFlashcards={handleStartStudyFlashcards}
              onAddFlashcard={handleAddFlashcard}
              onOpenGeminiWithPage={(p) => setState((prev) => ({ ...prev, activePageId: p.id, activeView: 'gemini' }))}
              onOpenWolfram={() => setState((prev) => ({ ...prev, activeView: 'wolfram' }))}
            />
          )}

          {state.activeView === 'gemini' && (
            <GeminiTutorView
              pages={state.pages}
              subjects={state.subjects}
              activePage={activePage}
              geminiApiKey={state.geminiApiKey}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onAddFlashcards={handleAddMultipleFlashcards}
              onInsertIntoPage={handleInsertIntoActivePage}
            />
          )}

          {state.activeView === 'wolfram' && (
            <WolframView
              activePage={activePage}
              wolframAppId={state.wolframAppId}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onInsertMathIntoPage={handleInsertMathIntoActivePage}
            />
          )}

          {state.activeView === 'quiz' && (
            <QuizView
              pages={state.pages}
              subjects={state.subjects}
              geminiApiKey={state.geminiApiKey}
              onOpenGemini={() => setState((prev) => ({ ...prev, activeView: 'gemini' }))}
            />
          )}

          {state.activeView === 'flashcards' && (
            <FlashcardsView
              flashcards={state.flashcards}
              subjects={state.subjects}
              initialPageId={studyFlashcardPageId}
              onUpdateFlashcard={handleUpdateFlashcard}
              onAddFlashcard={handleAddFlashcard}
              onBackToNotes={() => setState((prev) => ({ ...prev, activeView: 'editor' }))}
            />
          )}

          {state.activeView === 'pomodoro' && (
            <PomodoroView
              subjects={state.subjects}
              onPomodoroCompleted={handlePomodoroCompleted}
            />
          )}

          {state.activeView === 'exams' && (
            <ExamsView
              exams={state.exams}
              subjects={state.subjects}
              onUpdateExam={(updated) =>
                setState((prev) => ({
                  ...prev,
                  exams: prev.exams.map((e) => (e.id === updated.id ? updated : e)),
                }))
              }
              onAddExam={(newExam) =>
                setState((prev) => ({
                  ...prev,
                  exams: [newExam, ...prev.exams],
                }))
              }
              onDeleteExam={(id) =>
                setState((prev) => ({
                  ...prev,
                  exams: prev.exams.filter((e) => e.id !== id),
                }))
              }
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (With Gemini & Wolfram Quick Access) */}
        <nav className="md:hidden flex-shrink-0 border-t border-notion-border-light dark:border-notion-border-dark bg-white/95 dark:bg-notion-card-dark/95 backdrop-blur-md flex items-center justify-around px-1 z-30 pb-safe pt-1 min-h-[3.75rem]">
          <button
            onClick={() => setState((prev) => ({ ...prev, activeView: 'editor' }))}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              state.activeView === 'editor' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-400'
            }`}
          >
            <BookOpen size={17} />
            <span className="text-[9px] mt-0.5 tracking-tight">Appunti</span>
          </button>

          <button
            onClick={() => {
              setStudyFlashcardPageId(null);
              setState((prev) => ({ ...prev, activeView: 'flashcards' }));
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              state.activeView === 'flashcards' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-400'
            }`}
          >
            <Brain size={17} />
            <span className="text-[9px] mt-0.5 tracking-tight">Flashcard</span>
          </button>

          {/* Gemini AI Center Tab */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setState((prev) => ({ ...prev, activeView: 'gemini' }))}
              aria-label="Gemini AI Tutor"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform -mt-3.5 border-2 border-white dark:border-notion-bg-dark"
              title="Gemini AI Tutor"
            >
              <Sparkles size={20} />
            </button>
          </div>

          {/* Wolfram Math Solver Tab */}
          <button
            onClick={() => setState((prev) => ({ ...prev, activeView: 'wolfram' }))}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              state.activeView === 'wolfram' ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-gray-400'
            }`}
          >
            <Sigma size={17} />
            <span className="text-[9px] mt-0.5 tracking-tight">Wolfram</span>
          </button>

          <button
            onClick={() => setState((prev) => ({ ...prev, activeView: 'quiz' }))}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              state.activeView === 'quiz' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'
            }`}
          >
            <Target size={17} />
            <span className="text-[9px] mt-0.5 tracking-tight">Quiz</span>
          </button>
        </nav>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pages={state.pages}
        flashcards={state.flashcards}
        onSelectPage={handleSelectPage}
        onSelectFlashcard={(card) => {
          if (card.pageId) handleSelectPage(card.pageId);
          else {
            setStudyFlashcardPageId(null);
            setState((prev) => ({ ...prev, activeView: 'flashcards' }));
          }
        }}
      />

      {/* Settings Modal (Gemini & Wolfram Keys) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiApiKey={state.geminiApiKey}
        wolframAppId={state.wolframAppId}
        onSaveKeys={handleSaveApiKeys}
      />

      {/* Export / Import Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        appState={state}
        onImportState={(imported) => {
          setState((prev) => ({
            ...prev,
            ...imported,
          }));
        }}
        onResetToDefault={handleResetToDefault}
      />
    </div>
  );
};
