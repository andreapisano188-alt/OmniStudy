import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, X, ShieldCheck, FileJson } from 'lucide-react';
import { AppState } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onImportState: (imported: Partial<AppState>) => void;
  onResetToDefault: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  appState,
  onImportState,
  onResetToDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: appState.subjects,
      pages: appState.pages,
      flashcards: appState.flashcards,
      exams: appState.exams,
      studySessions: appState.studySessions,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnistudy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.pages && json.subjects) {
          onImportState(json);
          alert('Backup ripristinato con successo! I tuoi appunti sono aggiornati.');
          onClose();
        } else {
          alert('File di backup non valido.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-notion-card-dark rounded-3xl max-w-md w-full p-6 shadow-2xl border border-notion-border-light dark:border-notion-border-dark relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileJson size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Sincronizzazione & Backup</h3>
            <p className="text-xs text-gray-400">
              Trasferisci note e flashcard tra Mac e Android facilmente
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Export Button */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <Download size={18} className="text-blue-500" />
              <div>
                <h4 className="text-sm font-bold">Esporta Backup (.json)</h4>
                <p className="text-xs text-gray-400">Salva tutte le materie, appunti e flashcard</p>
              </div>
            </div>
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <Upload size={18} className="text-emerald-500" />
              <div>
                <h4 className="text-sm font-bold">Importa Backup (.json)</h4>
                <p className="text-xs text-gray-400">Carica appunti dal Mac o da un altro dispositivo</p>
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Reset to Default */}
          <button
            onClick={() => {
              if (confirm('Vuoi ripristinare i dati di esempio iniziali? I tuoi dati attuali verranno sostituiti.')) {
                onResetToDefault();
                onClose();
              }
            }}
            className="w-full flex items-center justify-between p-3.5 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-colors text-left group text-red-500"
          >
            <div className="flex items-center space-x-3">
              <RotateCcw size={18} />
              <div>
                <h4 className="text-sm font-bold">Ripristina Note Esempio</h4>
                <p className="text-xs text-red-400/80">Ricarica le note guida (Analisi, Algoritmi, Biologia)</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-notion-border-light dark:border-notion-border-dark flex items-center space-x-2 text-[11px] text-gray-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>I tuoi dati sono archiviati al 100% in locale e protetti sul tuo dispositivo.</span>
        </div>
      </div>
    </div>
  );
};
