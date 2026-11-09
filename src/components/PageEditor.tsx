import React, { useState } from 'react';
import { 
  Star, Plus, Brain, Download, Trash2, Tag, 
  Smile, Image as ImageIcon, Sparkles, Sigma, Mic, MicOff, Lightbulb
} from 'lucide-react';
import { Page, Block, BlockType, Subject } from '../types';
import { BlockItem } from './BlockItem';
import { SlashCommandMenu } from './SlashCommandMenu';

interface PageEditorProps {
  page: Page;
  subject?: Subject;
  onUpdatePage: (updatedPage: Page) => void;
  onDeletePage: (id: string) => void;
  onStudyFlashcards: (pageId: string) => void;
  onAddFlashcard: (subjectId: string, front: string, back: string, pageId?: string) => void;
  onOpenGeminiWithPage?: (page: Page) => void;
  onOpenWolfram?: () => void;
}

const EMOJI_PRESETS = ['📚', '⚡', '💡', '📐', '💻', '🧬', '🔬', '📝', '🎯', '🧠', '📊', '⚖️', '🌍', '🚀', '🎨'];

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #1e1b4b 100%)',
  'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
  'linear-gradient(135deg, #db2777 0%, #831843 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #312e81 100%)',
  'linear-gradient(135deg, #475569 0%, #0f172a 100%)',
];

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  subject,
  onUpdatePage,
  onDeletePage,
  onStudyFlashcards,
  onAddFlashcard,
  onOpenGeminiWithPage,
  onOpenWolfram,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleUpdateBlock = (updatedBlock: Block) => {
    const updatedBlocks = page.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = page.blocks.filter((b) => b.id !== blockId);
    onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= page.blocks.length) return;
    const newBlocks = [...page.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    onUpdatePage({ ...page, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleAddBlock = (type: BlockType, content = '') => {
    const newBlock: Block = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content,
      extra: type === 'toggle' ? '' : undefined,
      checked: type === 'todo' ? false : undefined,
      calloutType: type === 'callout' ? 'info' : undefined,
    };
    onUpdatePage({
      ...page,
      blocks: [...page.blocks, newBlock],
      updatedAt: Date.now()
    });
    setShowSlashMenu(false);
  };

  // Voice Dictation (Speech-to-Text)
  const toggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La dettatura vocale non è supportata da questo browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleAddBlock('paragraph', transcript);
        }
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# ${page.icon} ${page.title}\n\nMateria: ${subject?.name || 'Generale'}\nData: ${new Date(page.updatedAt).toLocaleDateString()}\n\n`;
    page.blocks.forEach((b) => {
      if (b.type === 'h1') md += `# ${b.content}\n\n`;
      else if (b.type === 'h2') md += `## ${b.content}\n\n`;
      else if (b.type === 'h3') md += `### ${b.content}\n\n`;
      else if (b.type === 'paragraph') md += `${b.content}\n\n`;
      else if (b.type === 'todo') md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
      else if (b.type === 'toggle') md += `> **${b.content}**\n> ${b.extra || ''}\n\n`;
      else if (b.type === 'callout') md += `> [!NOTE]\n> **${b.content}**\n> ${b.extra || ''}\n\n`;
      else if (b.type === 'math') md += `$$\n${b.content}\n$$\n\n`;
      else if (b.type === 'code') md += `\`\`\`${b.extra || ''}\n${b.content}\n\`\`\`\n\n`;
      else if (b.type === 'quote') md += `> ${b.content}\n\n`;
      else if (b.type === 'divider') md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      if (!page.tags.includes(newTagInput.trim())) {
        onUpdatePage({
          ...page,
          tags: [...page.tags, newTagInput.trim()]
        });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdatePage({
      ...page,
      tags: page.tags.filter((t) => t !== tagToRemove)
    });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-40 w-full min-w-0">
      {/* Cover Banner */}
      <div 
        className="w-full h-28 md:h-44 relative transition-all duration-300"
        style={{ background: page.cover || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
      >
        <button
          onClick={() => setShowCoverPicker(!showCoverPicker)}
          className="absolute right-3 top-3 px-2.5 py-1 text-[11px] bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-sm flex items-center space-x-1.5 transition-colors z-10"
        >
          <ImageIcon size={12} />
          <span>Copertina</span>
        </button>

        {showCoverPicker && (
          <div className="absolute right-3 top-11 p-2 bg-white dark:bg-notion-card-dark rounded-xl shadow-xl border border-notion-border-light dark:border-notion-border-dark flex space-x-2 z-20">
            {COVER_GRADIENTS.map((grad, i) => (
              <div
                key={i}
                onClick={() => {
                  onUpdatePage({ ...page, cover: grad });
                  setShowCoverPicker(false);
                }}
                className="w-7 h-7 rounded-lg cursor-pointer hover:scale-110 transition-transform shadow"
                style={{ background: grad }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Page Content Container */}
      <div className="max-w-3xl mx-auto px-4 md:px-10 -mt-8 relative w-full min-w-0">
        {/* Emoji Icon Button */}
        <div className="relative inline-block mb-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-4xl md:text-5xl p-1 bg-white dark:bg-notion-bg-dark rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-transform"
            title="Cambia icona"
          >
            {page.icon || '📝'}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-14 p-2.5 bg-white dark:bg-notion-card-dark rounded-2xl shadow-2xl border border-notion-border-light dark:border-notion-border-dark flex flex-wrap gap-1.5 w-60 z-30">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdatePage({ ...page, icon: emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI & Scientific Tool Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-3 text-xs scrollbar-none">
          {onOpenGeminiWithPage && (
            <button
              onClick={() => onOpenGeminiWithPage(page)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 flex-shrink-0 transition-colors"
            >
              <Sparkles size={13} className="text-blue-500" />
              <span>Chiedi a Gemini</span>
            </button>
          )}

          {onOpenWolfram && (
            <button
              onClick={onOpenWolfram}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/20 flex-shrink-0 transition-colors"
            >
              <Sigma size={13} className="text-orange-500" />
              <span>Wolfram Solver</span>
            </button>
          )}

          <button
            onClick={toggleVoiceDictation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold border flex-shrink-0 transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse border-red-600' 
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gray-600 dark:text-gray-300 border-notion-border-light dark:border-notion-border-dark'
            }`}
            title="Dettatura vocale in italiano"
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            <span>{isRecording ? 'Ascolto...' : 'Dettatura'}</span>
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          value={page.title}
          onChange={(e) => onUpdatePage({ ...page, title: e.target.value, updatedAt: Date.now() })}
          placeholder="Senza Titolo..."
          className="w-full text-2xl md:text-4xl font-extrabold bg-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 mb-3 tracking-tight"
        />

        {/* Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-4 border-b border-notion-border-light dark:border-notion-border-dark text-xs">
          {/* Badges & Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {subject && (
              <span 
                className="px-2.5 py-1 rounded-full font-bold flex items-center space-x-1"
                style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
              >
                <span>{subject.icon}</span>
                <span>{subject.name}</span>
              </span>
            )}

            <select
              value={page.status}
              onChange={(e) => onUpdatePage({ ...page, status: e.target.value as any })}
              className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-full border-none font-medium cursor-pointer focus:outline-none text-[11px]"
            >
              <option value="da_studiare">⏳ Da studiare</option>
              <option value="in_corso">📖 In corso</option>
              <option value="ripassato">🧠 Ripassato</option>
              <option value="pronto">✅ Pronto</option>
            </select>

            <button
              onClick={() => onUpdatePage({ ...page, isFavorite: !page.isFavorite })}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition-colors text-[11px] ${
                page.isFavorite ? 'text-amber-500 bg-amber-500/10 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-500'
              }`}
            >
              <Star size={12} className={page.isFavorite ? 'fill-amber-500' : ''} />
              <span>{page.isFavorite ? 'Preferito' : 'Preferiti'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => onStudyFlashcards(page.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors text-xs shadow-xs"
            >
              <Brain size={12} />
              <span>Ripassa Mazzo</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              title="Esporta Markdown"
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-500 transition-colors"
            >
              <Download size={14} />
            </button>

            <button
              onClick={() => {
                if (confirm('Vuoi davvero eliminare questa pagina?')) onDeletePage(page.id);
              }}
              title="Elimina pagina"
              className="p-1.5 hover:text-red-500 rounded-full text-gray-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <Tag size={12} className="text-gray-400 mr-1" />
          {page.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              className="px-2 py-0.5 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-xs cursor-pointer transition-colors"
              title="Clicca per rimuovere tag"
            >
              #{tag} &times;
            </span>
          ))}
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ Tag (invio)..."
            className="text-xs bg-transparent border-none focus:outline-none placeholder-gray-400 w-28"
          />
        </div>

        {/* Blocks List */}
        <div className="space-y-1 w-full min-w-0">
          {page.blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onMoveUp={index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
              onMoveDown={index < page.blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
              onConvertToFlashcard={(front, back) => {
                onAddFlashcard(page.subjectId, front, back, page.id);
                alert('Flashcard creata e aggiunta al mazzo di ripasso!');
              }}
            />
          ))}
        </div>

        {/* Add Block Toolbar */}
        <div className="mt-6 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowSlashMenu(!showSlashMenu)}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-notion-text-mutedLight dark:text-notion-text-mutedDark"
          >
            <Plus size={14} />
            <span>Aggiungi Blocco o Active Recall...</span>
          </button>

          {showSlashMenu && (
            <SlashCommandMenu
              onSelect={(type) => handleAddBlock(type)}
              onClose={() => setShowSlashMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
