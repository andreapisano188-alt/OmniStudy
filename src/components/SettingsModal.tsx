import React, { useState } from 'react';
import { 
  X, Key, Sparkles, Sigma, ExternalLink, ShieldCheck, 
  Check, AlertCircle, Save
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiApiKey?: string;
  wolframAppId?: string;
  onSaveKeys: (geminiKey: string, wolframId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiApiKey = '',
  wolframAppId = '',
  onSaveKeys,
}) => {
  const [geminiKey, setGeminiKey] = useState(geminiApiKey);
  const [wolframId, setWolframId] = useState(wolframAppId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(geminiKey.trim(), wolframId.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-notion-card-dark rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-notion-border-light dark:border-notion-border-dark relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Impostazioni AI & Calcolo</h3>
            <p className="text-xs text-gray-400">Configura le chiavi per Google Gemini e Wolfram|Alpha</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold flex items-center space-x-1.5 text-blue-600 dark:text-blue-400">
                <Sparkles size={14} />
                <span>Google Gemini API Key (Consigliato)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-gray-400 hover:text-blue-500 underline flex items-center space-x-0.5"
              >
                <span>Ottieni gratis</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Incolla qui la tua API Key (es: AIzaSy...)"
              className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs font-mono focus:outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Sblocca risposte istantanee, spiegazioni personalizzate e generazione automatica di Flashcards e Quiz da qualsiasi nota.
            </p>
          </div>

          {/* Wolfram Alpha App ID */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold flex items-center space-x-1.5 text-orange-600 dark:text-orange-400">
                <Sigma size={14} />
                <span>Wolfram|Alpha App ID (Opzionale)</span>
              </label>
              <a
                href="https://developer.wolframalpha.com/portal/myapps"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-gray-400 hover:text-orange-500 underline flex items-center space-x-0.5"
              >
                <span>Wolfram Portal</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={wolframId}
              onChange={(e) => setWolframId(e.target.value)}
              placeholder="Incolla il tuo App ID Wolfram (es: 3X9...)"
              className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs font-mono focus:outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Il motore matematico integrato risolve già derivate ed equazioni; l'App ID aggiunge accesso completo a tutto il database di Wolfram.
            </p>
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center space-x-2 text-[11px] text-gray-400">
            <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
            <span>Tutte le chiavi API vengono salvate esclusivamente sul tuo dispositivo in modo privato.</span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md flex items-center space-x-1.5 transition-colors"
            >
              {savedSuccess ? <Check size={14} className="text-emerald-300" /> : <Save size={14} />}
              <span>{savedSuccess ? 'Salvato!' : 'Salva Impostazioni'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
