import React, { useState, useEffect } from 'react';
import { Search, FileText, Brain, X, ArrowRight } from 'lucide-react';
import { Page, Flashcard } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  flashcards: Flashcard[];
  onSelectPage: (id: string) => void;
  onSelectFlashcard: (card: Flashcard) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  pages,
  flashcards,
  onSelectPage,
  onSelectFlashcard,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle modal
        if (isOpen) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingPages = pages.filter((p) => {
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.blocks.some((b) => b.content.toLowerCase().includes(q) || (b.extra && b.extra.toLowerCase().includes(q)))
    );
  });

  const matchingCards = flashcards.filter((c) => {
    if (!q) return false;
    return c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-notion-card-dark rounded-2xl max-w-xl w-full shadow-2xl border border-notion-border-light dark:border-notion-border-dark overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-notion-border-light dark:border-notion-border-dark">
          <Search size={18} className="text-gray-400 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca appunti, formule, toggle, flashcards... (Cmd+K)"
            autoFocus
            className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 mr-2">
              <X size={16} />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/5 dark:bg-white/10 text-gray-500 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4">
          {/* Pages */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
              Pagine & Appunti ({matchingPages.length})
            </div>
            <div className="space-y-0.5">
              {matchingPages.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">Nessuna pagina trovata</div>
              ) : (
                matchingPages.slice(0, 6).map((page) => (
                  <div
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs group transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{page.icon}</span>
                      <span className="font-semibold">{page.title || 'Senza Titolo'}</span>
                      {page.tags.length > 0 && (
                        <span className="text-gray-400 text-[10px]">#{page.tags[0]}</span>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Flashcards (if query exists) */}
          {q && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                Flashcards ({matchingCards.length})
              </div>
              <div className="space-y-0.5">
                {matchingCards.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">Nessuna flashcard corrispondente</div>
                ) : (
                  matchingCards.slice(0, 4).map((card) => (
                    <div
                      key={card.id}
                      onClick={() => {
                        onSelectFlashcard(card);
                        onClose();
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs group transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Brain size={14} className="text-purple-500 flex-shrink-0" />
                        <span className="font-medium truncate">{card.front}</span>
                      </div>
                      <ArrowRight size={13} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
