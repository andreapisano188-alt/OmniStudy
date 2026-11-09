import React from 'react';
import { 
  Heading1, Heading2, Heading3, Type, CheckSquare, 
  ChevronRight, Lightbulb, Sigma, Code, Quote, Minus
} from 'lucide-react';
import { BlockType } from '../types';

interface SlashCommandMenuProps {
  onSelect: (type: BlockType) => void;
  onClose?: () => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ onSelect }) => {
  const options: { type: BlockType; label: string; desc: string; icon: React.ReactNode }[] = [
    { type: 'paragraph', label: 'Testo', desc: 'Inizia a scrivere testo semplice', icon: <Type size={16} /> },
    { type: 'toggle', label: 'Active Recall (Toggle)', desc: 'Domanda visibile, risposta nascosta fino al clic', icon: <ChevronRight size={16} className="text-blue-500" /> },
    { type: 'todo', label: 'Checklist To-do', desc: 'Traccia attività e argomenti studiati', icon: <CheckSquare size={16} className="text-emerald-500" /> },
    { type: 'h1', label: 'Titolo 1', desc: 'Intestazione principale di grande dimensione', icon: <Heading1 size={16} /> },
    { type: 'h2', label: 'Titolo 2', desc: 'Sottotitolo per sezioni', icon: <Heading2 size={16} /> },
    { type: 'h3', label: 'Titolo 3', desc: 'Sotto-sezione o paragrafo specifico', icon: <Heading3 size={16} /> },
    { type: 'callout', label: 'Callout Evidenziato', desc: 'Riquadro per formule chiave o suggerimenti', icon: <Lightbulb size={16} className="text-amber-500" /> },
    { type: 'math', label: 'Formula LaTeX', desc: 'Equazioni matematiche e fisiche con KaTeX', icon: <Sigma size={16} className="text-purple-500" /> },
    { type: 'code', label: 'Snippet di Codice', desc: 'Blocco codice con copia rapida', icon: <Code size={16} className="text-emerald-400" /> },
    { type: 'quote', label: 'Citazione / Teorema', desc: 'Testo in corsivo con linea laterale', icon: <Quote size={16} /> },
    { type: 'divider', label: 'Divisore', desc: 'Linea orizzontale separatrice', icon: <Minus size={16} /> },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl shadow-lg my-3">
      {options.map((opt) => (
        <button
          key={opt.type}
          onClick={() => onSelect(opt.type)}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-notion-text-light dark:text-notion-text-dark"
          title={opt.desc}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
