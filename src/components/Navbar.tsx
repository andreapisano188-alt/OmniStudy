import React from 'react';
import { Menu, Search, Sun, Moon, Sparkles, Sigma, Settings } from 'lucide-react';
import { Page, Subject } from '../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  activeView: 'editor' | 'flashcards' | 'pomodoro' | 'exams' | 'gemini' | 'wolfram' | 'quiz' | 'settings';
  activePage?: Page;
  activeSubject?: Subject;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenGemini: () => void;
  onOpenWolfram: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  activeView,
  activePage,
  activeSubject,
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenGemini,
  onOpenWolfram,
  onOpenSettings,
}) => {
  return (
    <header className="h-12 min-h-[3rem] border-b border-notion-border-light dark:border-notion-border-dark flex items-center justify-between px-3 md:px-6 bg-white/90 dark:bg-notion-bg-dark/90 backdrop-blur-md sticky top-0 z-30 select-none app-drag">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Apri menu"
          className="md:hidden p-2 -ml-1 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 rounded-xl text-gray-600 dark:text-gray-300 transition-colors flex-shrink-0 app-no-drag"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs with truncation safety */}
        <div className="flex items-center space-x-1.5 text-xs md:text-sm font-semibold min-w-0 truncate">
          {activeView === 'editor' ? (
            <>
              {activeSubject && (
                <>
                  <span className="text-gray-400 hidden sm:inline truncate max-w-[120px]">{activeSubject.name}</span>
                  <span className="text-gray-400 hidden sm:inline">/</span>
                </>
              )}
              <span className="flex items-center space-x-1.5 min-w-0 truncate">
                <span className="flex-shrink-0">{activePage?.icon || '📝'}</span>
                <span className="truncate font-bold">{activePage?.title || 'Senza Titolo'}</span>
              </span>
            </>
          ) : activeView === 'gemini' ? (
            <span className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold truncate">
              <Sparkles size={14} className="flex-shrink-0" />
              <span className="truncate">Gemini AI Tutor</span>
            </span>
          ) : activeView === 'wolfram' ? (
            <span className="flex items-center space-x-1.5 text-orange-600 dark:text-orange-400 font-bold truncate">
              <Sigma size={14} className="flex-shrink-0" />
              <span className="truncate">Wolfram|Alpha & Calcolo</span>
            </span>
          ) : activeView === 'quiz' ? (
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
              <span className="flex-shrink-0">🧪</span>
              <span className="truncate">Simulatore Quiz</span>
            </span>
          ) : activeView === 'flashcards' ? (
            <span className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold truncate">
              <span className="flex-shrink-0">🧠</span>
              <span className="truncate">Flashcards & SRS</span>
            </span>
          ) : activeView === 'pomodoro' ? (
            <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold truncate">
              <span className="flex-shrink-0">⏱️</span>
              <span className="truncate">Timer Focus</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
              <span className="flex-shrink-0">🎯</span>
              <span className="truncate">Tracker Esami</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center space-x-1 flex-shrink-0 app-no-drag">
        {/* Gemini Quick Button */}
        <button
          onClick={onOpenGemini}
          className="p-1.5 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-colors flex items-center space-x-1 text-xs font-bold"
          title="Chiedi a Gemini AI"
        >
          <Sparkles size={16} />
          <span className="hidden lg:inline">Gemini</span>
        </button>

        {/* Wolfram Quick Button */}
        <button
          onClick={onOpenWolfram}
          className="p-1.5 hover:bg-orange-500/10 text-orange-500 rounded-xl transition-colors flex items-center space-x-1 text-xs font-bold"
          title="Wolfram Alpha & Calcolo"
        >
          <Sigma size={16} />
          <span className="hidden lg:inline">Wolfram</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 rounded-xl text-gray-500 transition-colors flex-shrink-0"
          title="Cerca (Cmd+K)"
        >
          <Search size={16} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 rounded-xl text-gray-500 transition-colors flex-shrink-0"
          title="Impostazioni"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 rounded-xl text-gray-500 transition-colors flex-shrink-0"
          title="Cambia tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
