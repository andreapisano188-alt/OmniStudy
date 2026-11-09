import React, { useState } from 'react';
import { 
  Award, CheckCircle2, XCircle, RotateCcw, 
  Sparkles, HelpCircle, ArrowRight, Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Page, Subject, QuizQuestion } from '../types';
import { generateQuizWithGemini } from '../services/geminiService';

interface QuizViewProps {
  pages: Page[];
  subjects: Subject[];
  geminiApiKey?: string;
  onOpenGemini: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  pages,
  subjects,
  geminiApiKey,
  onOpenGemini,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const handleGenerate = async () => {
    if (!selectedPage) return;
    setIsGenerating(true);
    setSelectedAnswers({});
    setIsCompleted(false);

    try {
      const q = await generateQuizWithGemini(selectedPage, geminiApiKey);
      setQuestions(q);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (selectedAnswers[questionIndex] !== undefined) return; // Already answered

    const newAnswers = { ...selectedAnswers, [questionIndex]: optionIndex };
    setSelectedAnswers(newAnswers);

    // If all questions are answered, check if completed
    if (Object.keys(newAnswers).length === questions.length) {
      setIsCompleted(true);
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const correctCount = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctIndex
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto pb-36 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-notion-border-light dark:border-notion-border-dark">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Simulatore Quiz d'Esame</h2>
            <p className="text-xs text-gray-400">Verifica la tua preparazione con test a risposta multipla generati da Gemini</p>
          </div>
        </div>

        {/* Note selector */}
        {pages.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="bg-black/5 dark:bg-white/5 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none max-w-[160px] sm:max-w-[220px] truncate"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
            >
              <Sparkles size={13} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Genero...' : 'Nuovo Quiz'}</span>
            </button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-notion-card-dark rounded-3xl border border-notion-border-light dark:border-notion-border-dark p-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-3xl">
            🧪
          </div>
          <h3 className="text-lg font-bold mb-2">Nessun quiz attivo</h3>
          <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
            Scegli una materia o nota e clicca su <b>Genera Quiz</b> per creare una simulazione d'esame in tempo reale con l'AI.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            {isGenerating ? 'Generazione in corso...' : '⚡ Genera Quiz Ora'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress / Score banner */}
          <div className="bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
            <span>
              Risposte: {Object.keys(selectedAnswers).length} di {questions.length}
            </span>
            {isCompleted && (
              <span className="text-emerald-500 font-bold text-sm">
                Punteggio finale: {correctCount}/{questions.length} (
                {Math.round((correctCount / questions.length) * 100)}%)
              </span>
            )}
          </div>

          {/* Question cards */}
          {questions.map((q, qIdx) => {
            const hasAnswered = selectedAnswers[qIdx] !== undefined;
            const chosen = selectedAnswers[qIdx];

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-3xl p-6 shadow-xs"
              >
                <div className="flex items-start space-x-2.5 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold leading-snug">
                    {q.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-3">
                  {q.options.map((opt, oIdx) => {
                    let btnStyle = 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300';
                    if (hasAnswered) {
                      if (oIdx === q.correctIndex) {
                        btnStyle = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-2 border-emerald-500 font-bold';
                      } else if (oIdx === chosen) {
                        btnStyle = 'bg-red-500/20 text-red-600 dark:text-red-300 border-2 border-red-500 font-medium';
                      } else {
                        btnStyle = 'opacity-50 bg-black/5 dark:bg-white/5';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                        className={`w-full text-left p-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs opacity-60">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {hasAnswered && oIdx === q.correctIndex && (
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 ml-2" />
                        )}
                        {hasAnswered && oIdx === chosen && oIdx !== q.correctIndex && (
                          <XCircle size={16} className="text-red-500 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {hasAnswered && (
                  <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold">Spiegazione: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Reset / Repeat button */}
          {isCompleted && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition-colors"
              >
                <RotateCcw size={14} />
                <span>Genera Altre Domande</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
