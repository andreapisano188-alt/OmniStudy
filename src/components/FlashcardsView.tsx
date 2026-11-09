import React, { useState } from 'react';
import { 
  RotateCw, Plus, CheckCircle2, Award, Zap, 
  Layers, ArrowLeft, Brain, Sparkles, Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, Subject } from '../types';
import { MathRenderer } from './MathRenderer';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  subjects: Subject[];
  initialPageId?: string | null;
  onUpdateFlashcard: (updatedCard: Flashcard) => void;
  onAddFlashcard: (subjectId: string, front: string, back: string) => void;
  onBackToNotes: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  subjects,
  initialPageId,
  onUpdateFlashcard,
  onAddFlashcard,
  onBackToNotes,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubId, setNewSubId] = useState(subjects[0]?.id || '');

  // Filter cards by subject or page
  const filteredCards = flashcards.filter((c) => {
    if (initialPageId) return c.pageId === initialPageId;
    if (selectedSubjectId === 'all') return true;
    return c.subjectId === selectedSubjectId;
  });

  const currentCard = filteredCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Spaced repetition logic (SM-2 inspired)
  const handleScore = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    let newInterval = currentCard.interval;
    let newEase = currentCard.easeFactor;
    let newRepetition = currentCard.repetition;

    if (quality === 'again') {
      newInterval = 1;
      newRepetition = 0;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (quality === 'hard') {
      newInterval = Math.max(1, Math.round(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (quality === 'good') {
      newRepetition += 1;
      newInterval = newRepetition === 1 ? 1 : newRepetition === 2 ? 3 : Math.round(newInterval * newEase);
    } else if (quality === 'easy') {
      newRepetition += 1;
      newEase += 0.15;
      newInterval = newRepetition === 1 ? 3 : Math.round(newInterval * newEase * 1.3);
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      interval: newInterval,
      easeFactor: newEase,
      repetition: newRepetition,
      nextReviewDate: Date.now() + newInterval * 86400000,
      lastReviewedDate: Date.now(),
    };

    onUpdateFlashcard(updatedCard);

    // Advance to next card or complete session
    setIsFlipped(false);
    if (currentIndex + 1 < filteredCards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    onAddFlashcard(newSubId, newFront.trim(), newBack.trim());
    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 max-w-3xl mx-auto flex flex-col items-center justify-start min-h-full pb-36 w-full">
      {/* Top Header - Responsive */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 pb-2 border-b border-notion-border-light dark:border-notion-border-dark">
        <button
          onClick={onBackToNotes}
          className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 active:bg-black/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={13} />
          <span>Note</span>
        </button>

        <div className="flex items-center space-x-1.5 min-w-0">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
            }}
            className="bg-black/5 dark:bg-white/5 rounded-xl px-2 py-1 text-xs font-medium focus:outline-none max-w-[130px] sm:max-w-[200px] truncate"
          >
            <option value="all">📚 Tutte ({flashcards.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          {/* Add Flashcard Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-600 active:bg-blue-700 text-white transition-colors shadow-xs flex-shrink-0"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Nuova Carta</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3 text-2xl">
            🧠
          </div>
          <h3 className="text-lg font-bold mb-1">Nessuna flashcard in questa categoria</h3>
          <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
            Aggiungi flashcards dalle tue pagine o creane una nuova adesso.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            + Crea Nuova Flashcard
          </button>
        </div>
      ) : sessionCompleted ? (
        /* Celebration Finished Screen */
        <div className="text-center py-12 px-5 bg-white dark:bg-notion-card-dark rounded-3xl border border-notion-border-light dark:border-notion-border-dark p-6 shadow-xl max-w-sm w-full my-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={32} className="animate-bounce" />
          </div>
          <h2 className="text-xl font-extrabold mb-1">Mazzo Completato! 🎉</h2>
          <p className="text-xs text-gray-400 mb-5">
            Hai memorizzato tutte le <b>{filteredCards.length}</b> carte del mazzo!
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setSessionCompleted(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              <RotateCw size={13} />
              <span>Ripassa Ancora</span>
            </button>
            <button
              onClick={onBackToNotes}
              className="px-3 py-2 bg-black/5 dark:bg-white/10 active:bg-black/10 rounded-xl text-xs font-semibold transition-colors"
            >
              Torna agli Appunti
            </button>
          </div>
        </div>
      ) : (
        /* Flashcard Study Card */
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Progress bar */}
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mb-1.5 font-medium">
            <span>Carta {currentIndex + 1} di {filteredCards.length}</span>
            <span className="flex items-center space-x-1">
              <Zap size={12} className="text-amber-500" />
              <span>Intervallo: {currentCard.interval}g</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full h-64 sm:h-80 rounded-3xl cursor-pointer perspective-1000 select-none group"
          >
            <div
              className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                    Domanda
                  </span>
                  <span className="text-[11px] text-gray-400">Tocca per girare</span>
                </div>

                <div className="my-auto text-center overflow-y-auto max-h-36 py-1">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-snug">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex justify-center items-center text-[11px] text-gray-400">
                  <RotateCw size={12} className="mr-1" />
                  <span>Tocca per rivelare</span>
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-500/30 rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                    Risposta
                  </span>
                  <span className="text-[11px] text-blue-500 font-bold">Active Recall</span>
                </div>

                <div className="my-auto text-center overflow-y-auto max-h-36 py-1">
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-[11px] text-gray-400">
                  Valuta la memorizzazione qui sotto
                </div>
              </div>
            </div>
          </div>

          {/* SRS Grading Buttons (2x2 on mobile for perfect tap targets) */}
          <div className="w-full mt-4">
            {isFlipped ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleScore('again')}
                  className="py-2.5 px-2 bg-red-500/10 active:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl text-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
                >
                  <span className="text-sm font-extrabold">1 min</span>
                  <span className="text-[11px]">Di nuovo</span>
                </button>
                <button
                  onClick={() => handleScore('hard')}
                  className="py-2.5 px-2 bg-amber-500/10 active:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-2xl text-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
                >
                  <span className="text-sm font-extrabold">1 giorno</span>
                  <span className="text-[11px]">Difficile</span>
                </button>
                <button
                  onClick={() => handleScore('good')}
                  className="py-2.5 px-2 bg-emerald-500/10 active:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl text-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
                >
                  <span className="text-sm font-extrabold">3 giorni</span>
                  <span className="text-[11px]">Buono</span>
                </button>
                <button
                  onClick={() => handleScore('easy')}
                  className="py-2.5 px-2 bg-blue-500/10 active:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl text-xs flex flex-col items-center justify-center space-y-0.5 transition-all"
                >
                  <span className="text-sm font-extrabold">7 giorni</span>
                  <span className="text-[11px]">Facile</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleFlip}
                className="w-full py-3 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md transition-colors"
              >
                Rivela Risposta
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Flashcard */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-notion-card-dark rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-notion-border-light dark:border-notion-border-dark">
            <h3 className="text-base font-bold mb-3">Nuova Flashcard</h3>
            <form onSubmit={handleCreateNew} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">Materia</label>
                <select
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">Domanda (Fronte)</label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Es: Formula per..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">Risposta (Retro)</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Spiegazione dettagliata..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 active:bg-blue-700 text-white shadow"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
