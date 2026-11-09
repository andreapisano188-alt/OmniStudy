import React, { useState } from 'react';
import { 
  BookOpen, Brain, Clock, Target, Search, Plus, 
  ChevronDown, ChevronRight, Star, Moon, Sun, Download, 
  FolderPlus, FileText, CheckCircle, MoreHorizontal, Trash2,
  Sparkles, Sigma, Award, Settings
} from 'lucide-react';
import { Page, Subject } from '../types';

interface SidebarProps {
  subjects: Subject[];
  pages: Page[];
  activePageId: string | null;
  activeView: 'editor' | 'flashcards' | 'pomodoro' | 'exams' | 'gemini' | 'wolfram' | 'quiz' | 'settings';
  theme: 'dark' | 'light';
  onSelectPage: (id: string) => void;
  onSelectView: (view: 'editor' | 'flashcards' | 'pomodoro' | 'exams' | 'gemini' | 'wolfram' | 'quiz' | 'settings') => void;
  onAddPage: (subjectId: string) => void;
  onAddSubject: () => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  subjects,
  pages,
  activePageId,
  activeView,
  theme,
  onSelectPage,
  onSelectView,
  onAddPage,
  onAddSubject,
  onToggleTheme,
  onOpenSearch,
  onOpenExport,
  onOpenSettings,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [collapsedSubjects, setCollapsedSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = (subId: string) => {
    setCollapsedSubjects((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const favoritePages = pages.filter((p) => p.isFavorite);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 md:w-72 bg-notion-sidebar-light dark:bg-notion-sidebar-dark border-r border-notion-border-light dark:border-notion-border-dark flex flex-col transition-transform duration-300 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* macOS Traffic Lights Spacer & Drag Area (Desktop Only) */}
        <div className="hidden md:block h-9 flex-shrink-0 app-drag w-full" />

        {/* Workspace Brand / Header */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-notion-border-light dark:border-notion-border-dark">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl p-1 bg-white dark:bg-notion-card-dark rounded-xl shadow-xs">📚</span>
            <div>
              <h1 className="text-sm font-bold tracking-tight">OmniStudy</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Notion for Students</p>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-3">
          <button
            onClick={() => {
              onOpenSearch();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs text-notion-text-mutedLight dark:text-notion-text-mutedDark transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <Search size={14} className="group-hover:text-blue-500 transition-colors" />
              <span>Cerca appunti...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Main Navigation Views */}
        <div className="px-3 space-y-0.5 mb-3">
          <button
            onClick={() => {
              onSelectView('flashcards');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'flashcards'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Brain size={16} className="text-purple-500" />
              <span>Flashcards & SRS</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold">
              {pages.reduce((acc, p) => acc + p.blocks.filter((b) => b.type === 'toggle').length, 0)}
            </span>
          </button>

          {/* Gemini AI Tutor Button */}
          <button
            onClick={() => {
              onSelectView('gemini');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'gemini'
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Sparkles size={16} className="text-blue-500" />
            <span className="font-bold">Gemini AI Tutor</span>
          </button>

          {/* Wolfram Alpha Solver Button */}
          <button
            onClick={() => {
              onSelectView('wolfram');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'wolfram'
                ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Sigma size={16} className="text-orange-500" />
            <span>Wolfram & Calcolo</span>
          </button>

          {/* Quiz Simulator Button */}
          <button
            onClick={() => {
              onSelectView('quiz');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'quiz'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Award size={16} className="text-emerald-500" />
            <span>Simulatore Quiz</span>
          </button>

          <button
            onClick={() => {
              onSelectView('pomodoro');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'pomodoro'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Clock size={16} className="text-amber-500" />
            <span>Timer Pomodoro</span>
          </button>

          <button
            onClick={() => {
              onSelectView('exams');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'exams'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Target size={16} className="text-emerald-500" />
            <span>Esami & Traguardi</span>
          </button>
        </div>

        {/* Scrollable Subjects and Pages Tree */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {/* Favorites */}
          {favoritePages.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1 flex items-center space-x-1">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                <span>Preferiti</span>
              </div>
              <div className="space-y-0.5">
                {favoritePages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      activePageId === page.id && activeView === 'editor'
                        ? 'bg-black/10 dark:bg-white/10 font-bold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{page.icon}</span>
                    <span className="truncate">{page.title || 'Senza Titolo'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Materie & Corsi
              </span>
              <button
                onClick={onAddSubject}
                className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                title="Aggiungi Materia"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            <div className="space-y-1">
              {subjects.map((sub) => {
                const isCollapsed = collapsedSubjects[sub.id];
                const subPages = pages.filter((p) => p.subjectId === sub.id);

                return (
                  <div key={sub.id} className="space-y-0.5">
                    {/* Subject Header */}
                    <div className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer transition-colors">
                      <div
                        onClick={() => toggleSubject(sub.id)}
                        className="flex items-center space-x-1.5 flex-1 min-w-0"
                      >
                        <span className="text-gray-400">
                          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        </span>
                        <span>{sub.icon}</span>
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddPage(sub.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-blue-500 transition-opacity"
                        title="Nuova pagina in questa materia"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subject Pages */}
                    {!isCollapsed && (
                      <div className="pl-6 space-y-0.5">
                        {subPages.length === 0 ? (
                          <div className="text-[11px] text-gray-400 py-1 pl-2">
                            Nessun appunto. Clicca + per iniziare.
                          </div>
                        ) : (
                          subPages.map((page) => (
                            <button
                              key={page.id}
                              onClick={() => {
                                onSelectPage(page.id);
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                activePageId === page.id && activeView === 'editor'
                                  ? 'bg-black/10 dark:bg-white/10 font-bold'
                                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <span>{page.icon}</span>
                              <span className="truncate">{page.title || 'Senza Titolo'}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Settings & Backup */}
        <div className="p-3 border-t border-notion-border-light dark:border-notion-border-dark flex items-center space-x-1.5">
          <button
            onClick={() => {
              onOpenExport();
              onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors truncate"
          >
            <Download size={13} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">Backup</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
            title="Impostazioni Gemini & Wolfram"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
            title="Cambia tema"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </aside>
    </>
  );
};
