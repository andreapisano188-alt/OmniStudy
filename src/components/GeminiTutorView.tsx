import React, { useState } from 'react';
import { 
  Sparkles, Send, Brain, Lightbulb, FileText, 
  HelpCircle, Copy, Check, Plus, Key, ArrowRight, BookOpen
} from 'lucide-react';
import { Page, Subject, ChatMessage } from '../types';
import { callGemini, generateFlashcardsWithGemini } from '../services/geminiService';

interface GeminiTutorViewProps {
  pages: Page[];
  subjects: Subject[];
  activePage?: Page;
  geminiApiKey?: string;
  onOpenSettings: () => void;
  onAddFlashcards: (cards: { front: string; back: string }[], subjectId: string, pageId?: string) => void;
  onInsertIntoPage: (content: string, type: 'callout' | 'paragraph') => void;
}

export const GeminiTutorView: React.FC<GeminiTutorViewProps> = ({
  pages,
  subjects,
  activePage,
  geminiApiKey,
  onOpenSettings,
  onAddFlashcards,
  onInsertIntoPage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      role: 'model',
      text: `Ciao! Sono il tuo **Tutor AI Gemini** per lo studio. 🎓\n\nPosso aiutarti a:\n- 🧠 **Generare Flashcards** automatiche dai tuoi appunti per la ripetizione spaziata.\n- 💡 **Spiegare concetti complessi** in modo semplice (Metodo Feynman).\n- 📝 **Creare riassunti e mappe concettuali** dei tuoi corsi.\n- ❓ **Interrogarti** con domande tipiche d'esame.\n\nScegli un'azione rapida qui sotto o fammi qualsiasi domanda!`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>(activePage?.id || pages[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedPage = pages.find(p => p.id === selectedPageId) || activePage;
  const selectedSubject = selectedPage ? subjects.find(s => s.id === selectedPage.subjectId) : undefined;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      let context = '';
      if (selectedPage) {
        context = `[CONTESTO STUDIO: Materia "${selectedSubject?.name || 'Generale'}", Appunti su "${selectedPage.title}":\n` + 
                  selectedPage.blocks.map(b => `${b.content} ${b.extra || ''}`).join('\n') + `]\n\n`;
      }

      const promptWithContext = context + textToSend;
      const responseText = await callGemini(
        promptWithContext, 
        geminiApiKey,
        "Sei un tutor accademico chiaro, empatico e preciso. Usa formattazione Markdown con punti elenco ed evidenziazioni per rendere lo studio piacevole e memorabile."
      );

      const modelMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'model',
        text: `⚠️ **Errore di connessione:** ${err.message || 'Non è stato possibile contattare Gemini.'}\n\nControlla la tua API Key nelle impostazioni.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcardsQuick = async () => {
    if (!selectedPage) return;
    setIsLoading(true);
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      text: `✨ Genera Flashcards ad alto rendimento per "${selectedPage.title}"`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const cards = await generateFlashcardsWithGemini(selectedPage, geminiApiKey);
      onAddFlashcards(cards, selectedPage.subjectId, selectedPage.id);

      const modelMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'model',
        text: `🎉 **Ho generato e aggiunto ${cards.length} nuove Flashcard al tuo mazzo di ripasso!**\n\n` +
              cards.map((c, i) => `**Carta ${i+1}:**\n- ❓ *Fronte:* ${c.front}\n- 💡 *Retro:* ${c.back}`).join('\n\n') +
              `\n\nPuoi iniziare a ripassarle subito nella sezione **Flashcards & SRS**!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: `m-${Date.now() + 1}`,
        role: 'model',
        text: `Si è verificato un errore nella generazione delle flashcard: ${e.message}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full max-w-4xl mx-auto w-full p-3 sm:p-6 pb-24 md:pb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-notion-border-light dark:border-notion-border-dark flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center space-x-1.5">
              <span>Gemini AI Tutor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">2.0 Flash</span>
            </h2>
            <p className="text-[11px] text-gray-400">Il tuo assistente personale per studio e memorizzazione</p>
          </div>
        </div>

        {/* Note context selector & API Key warning */}
        <div className="flex items-center space-x-2">
          {pages.length > 0 && (
            <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl text-xs">
              <BookOpen size={13} className="text-gray-400 flex-shrink-0" />
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none max-w-[130px] sm:max-w-[180px] truncate"
              >
                {pages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-xl border text-xs flex items-center space-x-1 transition-colors ${
              geminiApiKey 
                ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' 
                : 'border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
            }`}
            title="Configura API Key Gemini"
          >
            <Key size={13} />
            <span className="hidden sm:inline font-bold">{geminiApiKey ? 'API Attiva' : 'Collega API Key'}</span>
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 flex-shrink-0 scrollbar-none text-xs">
        <button
          onClick={handleGenerateFlashcardsQuick}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap transition-colors shadow-xs"
        >
          <Brain size={13} />
          <span>Genera Flashcards dalla Nota</span>
        </button>

        <button
          onClick={() => handleSend("Spiegami questo argomento con il Metodo Feynman (come se avessi 10 anni, con esempi pratici ed analogie)")}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap transition-colors"
        >
          <Lightbulb size={13} />
          <span>Spiega con Metodo Feynman</span>
        </button>

        <button
          onClick={() => handleSend("Riassumi i concetti chiave di questi appunti in 5 punti elenco da ricordare per l'esame")}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap transition-colors"
        >
          <FileText size={13} />
          <span>Riassunto in 5 Punti</span>
        </button>

        <button
          onClick={() => handleSend("Fammi una domanda tipica da esame su questo argomento e attendi la mia risposta per valutarla")}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap transition-colors"
        >
          <HelpCircle size={13} />
          <span>Interrogami sull'Argomento</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.role === 'model' && (
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-blue-500 flex items-center space-x-1 transition-colors"
                      title="Copia testo"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? 'Copiato' : 'Copia'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onInsertIntoPage(msg.text, 'callout');
                        alert('Spiegazione inserita come Callout nella nota corrente!');
                      }}
                      className="hover:text-purple-500 flex items-center space-x-1 transition-colors"
                      title="Inserisci nella nota aperta"
                    >
                      <Plus size={12} />
                      <span>Inserisci nella Nota</span>
                    </button>
                  </div>

                  <span className="text-[10px] opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center space-x-2 text-xs text-gray-400">
              <Sparkles size={14} className="animate-spin text-blue-500" />
              <span>Gemini sta elaborando la risposta per te...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="pt-2 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 bg-white dark:bg-notion-card-dark border border-notion-border-light dark:border-notion-border-dark p-2 rounded-2xl shadow-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Chiedi a Gemini su "${selectedPage?.title || 'i tuoi studi'}"...`}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none text-xs sm:text-sm px-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-blue-600 active:bg-blue-700 text-white shadow'
                : 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
