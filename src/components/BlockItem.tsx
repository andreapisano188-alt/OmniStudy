import React, { useState } from 'react';
import { 
  CheckSquare, Square, ChevronRight, ChevronDown, Trash2, 
  HelpCircle, Lightbulb, AlertTriangle, Sigma, Copy, Check, ArrowUp, ArrowDown, MoreHorizontal
} from 'lucide-react';
import { Block, CalloutType } from '../types';
import { MathRenderer } from './MathRenderer';

interface BlockItemProps {
  block: Block;
  onUpdate: (updatedBlock: Block) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvertToFlashcard?: (front: string, back: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvertToFlashcard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingMath, setIsEditingMath] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(block.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative py-1 px-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full">
      <div className="flex items-start w-full">
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* H1 */}
          {block.type === 'h1' && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder="Intestazione 1..."
              className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 mt-2 mb-1"
            />
          )}

          {/* H2 */}
          {block.type === 'h2' && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder="Intestazione 2..."
              className="w-full text-lg md:text-xl font-semibold bg-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 mt-1.5 mb-1"
            />
          )}

          {/* H3 */}
          {block.type === 'h3' && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder="Intestazione 3..."
              className="w-full text-base md:text-lg font-medium bg-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 mt-1 mb-0.5"
            />
          )}

          {/* Paragraph */}
          {block.type === 'paragraph' && (
            <textarea
              value={block.content}
              onChange={(e) => {
                onUpdate({ ...block, content: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Scrivi qualcosa o aggiungi blocchi..."
              rows={1}
              className="w-full resize-none bg-transparent border-none focus:outline-none leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 text-sm md:text-base py-0.5"
              style={{ minHeight: '1.5rem' }}
            />
          )}

          {/* Todo */}
          {block.type === 'todo' && (
            <div className="flex items-start space-x-2 py-0.5">
              <button
                onClick={() => onUpdate({ ...block, checked: !block.checked })}
                className="text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5"
              >
                {block.checked ? (
                  <CheckSquare size={18} className="fill-blue-500/20 text-blue-500" />
                ) : (
                  <Square size={18} className="text-gray-400" />
                )}
              </button>
              <input
                type="text"
                value={block.content}
                onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                placeholder="Attività da fare..."
                className={`flex-1 min-w-0 bg-transparent border-none focus:outline-none text-sm md:text-base ${
                  block.checked ? 'line-through text-gray-400 dark:text-gray-500' : ''
                }`}
              />
            </div>
          )}

          {/* Toggle (Active Recall) */}
          {block.type === 'toggle' && (
            <div className="border border-blue-500/20 dark:border-blue-500/30 rounded-xl p-2.5 my-1 bg-blue-50/40 dark:bg-blue-950/20 w-full">
              <div className="flex items-center space-x-1.5 w-full">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  title={isOpen ? "Nascondi risposta" : "Mostra risposta"}
                >
                  {isOpen ? <ChevronDown size={18} className="text-blue-500" /> : <ChevronRight size={18} className="text-blue-500" />}
                </button>
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                  placeholder="Domanda di Active Recall..."
                  className="flex-1 min-w-0 font-medium bg-transparent border-none focus:outline-none text-blue-900 dark:text-blue-200 text-sm md:text-base"
                />
                {onConvertToFlashcard && block.content && block.extra && (
                  <button
                    onClick={() => onConvertToFlashcard(block.content, block.extra || '')}
                    title="Crea Flashcard per Spaced Repetition"
                    className="text-[10px] px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    + Flashcard
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="mt-2 pl-6 pt-2 border-t border-blue-500/10 dark:border-blue-500/20">
                  <textarea
                    value={block.extra || ''}
                    onChange={(e) => onUpdate({ ...block, extra: e.target.value })}
                    placeholder="Scrivi qui la risposta o la spiegazione dettagliata..."
                    rows={2}
                    className="w-full resize-none bg-transparent border-none focus:outline-none text-xs md:text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Callout */}
          {block.type === 'callout' && (
            <div className={`flex items-start space-x-3 p-3 my-1 rounded-xl border w-full ${
              block.calloutType === 'tip' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' :
              block.calloutType === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 text-amber-900 dark:text-amber-200' :
              block.calloutType === 'formula' ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500/30 text-purple-900 dark:text-purple-200' :
              'bg-blue-50 dark:bg-blue-950/20 border-blue-500/30 text-blue-900 dark:text-blue-200'
            }`}>
              <div className="mt-0.5 flex-shrink-0">
                {block.calloutType === 'tip' && <Lightbulb size={18} className="text-emerald-500" />}
                {block.calloutType === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
                {block.calloutType === 'formula' && <Sigma size={18} className="text-purple-500" />}
                {(!block.calloutType || block.calloutType === 'info') && <HelpCircle size={18} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                  placeholder="Titolo callout..."
                  className="w-full font-semibold bg-transparent border-none focus:outline-none mb-1 text-inherit text-sm md:text-base"
                />
                <textarea
                  value={block.extra || ''}
                  onChange={(e) => onUpdate({ ...block, extra: e.target.value })}
                  placeholder="Dettagli e spiegazioni..."
                  rows={1}
                  className="w-full resize-none bg-transparent border-none focus:outline-none text-xs md:text-sm opacity-90 text-inherit"
                />
              </div>
            </div>
          )}

          {/* Math Block (LaTeX) */}
          {block.type === 'math' && (
            <div className="my-1.5 p-2.5 border border-purple-500/20 dark:border-purple-500/30 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 w-full overflow-hidden">
              <div className="flex justify-between items-center mb-1 text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                <span>Formula LaTeX</span>
                <button 
                  onClick={() => setIsEditingMath(!isEditingMath)}
                  className="hover:underline font-bold"
                >
                  {isEditingMath ? "Mostra Render" : "Modifica"}
                </button>
              </div>
              {isEditingMath ? (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                  placeholder="Es: \\int_0^1 x^2 dx = \\frac{1}{3}"
                  className="w-full font-mono text-xs md:text-sm p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-gray-300 dark:border-gray-700"
                />
              ) : (
                <div onClick={() => setIsEditingMath(true)} className="cursor-pointer overflow-x-auto">
                  <MathRenderer math={block.content || 'E = mc^2'} />
                </div>
              )}
            </div>
          )}

          {/* Code Block */}
          {block.type === 'code' && (
            <div className="relative my-1.5 rounded-xl bg-gray-900 text-gray-100 overflow-hidden text-xs md:text-sm w-full">
              <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[11px] text-gray-400 font-mono">
                <input
                  type="text"
                  value={block.extra || 'code'}
                  onChange={(e) => onUpdate({ ...block, extra: e.target.value })}
                  placeholder="linguaggio"
                  className="bg-transparent border-none focus:outline-none w-24 uppercase"
                />
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copiato' : 'Copia'}</span>
                </button>
              </div>
              <textarea
                value={block.content}
                onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                placeholder="// Incolla codice..."
                rows={3}
                className="w-full p-3 font-mono bg-transparent border-none focus:outline-none resize-y text-green-300 leading-normal"
              />
            </div>
          )}

          {/* Quote Block */}
          {block.type === 'quote' && (
            <div className="border-l-4 border-gray-400 dark:border-gray-600 pl-3 py-1 my-1 italic text-gray-700 dark:text-gray-300 w-full">
              <textarea
                value={block.content}
                onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                placeholder="Citazione o definizione..."
                rows={1}
                className="w-full resize-none bg-transparent border-none focus:outline-none text-sm md:text-base"
              />
            </div>
          )}

          {/* Divider */}
          {block.type === 'divider' && (
            <hr className="my-3 border-t border-gray-200 dark:border-gray-800 w-full" />
          )}
        </div>

        {/* Clean Options Trigger (Notion-style: subtle on hover or tap) */}
        <div className="relative flex-shrink-0 ml-1">
          <button
            onClick={() => setShowActions(!showActions)}
            aria-label="Opzioni blocco"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-40 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={15} />
          </button>

          {/* Discrete popup menu for the block */}
          {showActions && (
            <div className="absolute right-0 top-7 z-30 bg-white dark:bg-notion-card-dark rounded-xl shadow-xl border border-notion-border-light dark:border-notion-border-dark py-1 px-1 flex flex-col space-y-0.5 min-w-[120px]">
              {onMoveUp && (
                <button
                  onClick={() => {
                    onMoveUp();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-left text-gray-600 dark:text-gray-300"
                >
                  <ArrowUp size={13} />
                  <span>Sposta su</span>
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={() => {
                    onMoveDown();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-left text-gray-600 dark:text-gray-300"
                >
                  <ArrowDown size={13} />
                  <span>Sposta giù</span>
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(block.id);
                  setShowActions(false);
                }}
                className="flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-red-500/10 text-left text-red-500 font-medium"
              >
                <Trash2 size={13} />
                <span>Elimina</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
