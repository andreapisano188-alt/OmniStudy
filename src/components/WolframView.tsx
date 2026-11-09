import React, { useState } from 'react';
import { 
  Sigma, Calculator, ArrowRight, ExternalLink, Plus, 
  Sparkles, BookOpen, Layers, Check, Copy, Flame
} from 'lucide-react';
import { Page, Subject } from '../types';
import { solveMathOrQuery, CalculationResult, PHYSICAL_CONSTANTS } from '../services/wolframService';
import { MathRenderer } from './MathRenderer';

interface WolframViewProps {
  activePage?: Page;
  wolframAppId?: string;
  onOpenSettings: () => void;
  onInsertMathIntoPage: (latex: string, explanation?: string) => void;
}

export const WolframView: React.FC<WolframViewProps> = ({
  activePage,
  wolframAppId,
  onOpenSettings,
  onInsertMathIntoPage,
}) => {
  const [query, setQuery] = useState('d/dx sin(x)');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  const PRESET_QUERIES = [
    { label: 'd/dx sin(x)', desc: 'Derivata goniometrica' },
    { label: 'int 1/x dx', desc: 'Integrale logaritmico' },
    { label: 'x^2 - 5x + 6 = 0', desc: 'Equazione 2° grado' },
    { label: 'd/dx x^3', desc: 'Regola di potenza' },
    { label: 'int cos(x) dx', desc: 'Integrale del coseno' },
  ];

  const handleCalculate = async (customQ?: string) => {
    const q = customQ || query.trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await solveMathOrQuery(q, wolframAppId);
      setResult(res);
      if (customQ) setQuery(customQ);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLatex = (latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto pb-36 w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-notion-border-light dark:border-notion-border-dark">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Sigma size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>Wolfram|Alpha & Calcolo Matematico</span>
            </h2>
            <p className="text-xs text-gray-400">Risolutore di derivate, integrali, equazioni e costanti scientifiche</p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs px-3 py-1.5 rounded-xl border border-notion-border-light dark:border-notion-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 font-semibold"
        >
          {wolframAppId ? 'Wolfram AppID Collegato' : 'Collega Wolfram AppID'}
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Esempi:</span>
        {PRESET_QUERIES.map((p) => (
          <button
            key={p.label}
            onClick={() => handleCalculate(p.label)}
            className="px-2.5 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs font-mono transition-colors flex-shrink-0"
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Query Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCalculate();
        }}
        className="flex items-center space-x-2 bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark p-2 rounded-2xl shadow-lg mb-6"
      >
        <div className="pl-2 text-orange-500">
          <Calculator size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Es: d/dx sin(x), int 1/x dx, solve x^2 - 4 = 0..."
          className="flex-1 bg-transparent border-none text-sm md:text-base font-mono focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1"
        >
          <span>Calcola</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Result Card */}
      {result && (
        <div className="bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-3xl p-6 shadow-sm mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-full">
              Risultato Computazionale
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyLatex(result.latex)}
                className="text-xs text-gray-500 hover:text-blue-500 flex items-center space-x-1 transition-colors px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                {copiedLatex ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedLatex ? 'Copiato' : 'Copia LaTeX'}</span>
              </button>

              {activePage && (
                <button
                  onClick={() => {
                    onInsertMathIntoPage(result.latex, result.solution);
                    alert(`Formula inserita nella pagina "${activePage.title}"!`);
                  }}
                  className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-3 py-1 rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <Plus size={13} />
                  <span>Inserisci nella Nota</span>
                </button>
              )}
            </div>
          </div>

          {/* Rendered Math formula */}
          <div className="py-2">
            <MathRenderer math={result.latex} block={true} />
          </div>

          <p className="text-sm font-medium mt-3 text-gray-700 dark:text-gray-300">
            {result.solution}
          </p>

          {/* Step-by-step solutions */}
          {result.steps && result.steps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-notion-border-light dark:border-notion-border-dark">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Passaggi Risolutivi:
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                {result.steps.map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External link to Wolfram Alpha */}
          <div className="mt-5 pt-3 border-t border-notion-border-light dark:border-notion-border-dark flex justify-end">
            <a
              href={result.wolframUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1 font-bold"
            >
              <span>Visualizza grafici completi su Wolfram|Alpha</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Scientific & Physical Constants Cheat Sheet */}
      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-2">
          <Flame size={15} className="text-amber-500" />
          <span>Tavola Costanti Fisiche & Scientifiche</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PHYSICAL_CONSTANTS.map((c) => (
            <div
              key={c.name}
              className="bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl p-3.5 flex items-center justify-between text-xs group hover:border-orange-500/40 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</p>
                <p className="font-mono text-orange-600 dark:text-orange-400 text-[11px] mt-0.5">{c.value}</p>
              </div>
              <button
                onClick={() => {
                  if (activePage) {
                    onInsertMathIntoPage(c.latex, c.name);
                    alert(`Costante inserita in "${activePage.title}"!`);
                  } else {
                    handleCopyLatex(c.latex);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-orange-500 transition-opacity"
                title="Inserisci nella nota"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
