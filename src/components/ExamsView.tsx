import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Circle, Clock, Award, Trash2 } from 'lucide-react';
import { Exam, Subject } from '../types';

interface ExamsViewProps {
  exams: Exam[];
  subjects: Subject[];
  onUpdateExam: (updatedExam: Exam) => void;
  onAddExam: (newExam: Exam) => void;
  onDeleteExam: (id: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  subjects,
  onUpdateExam,
  onAddExam,
  onDeleteExam,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [targetGrade, setTargetGrade] = useState('30');
  const [topicsText, setTopicsText] = useState('');

  const getDaysLeft = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleToggleTopic = (exam: Exam, topicId: string) => {
    const updatedTopics = exam.topics.map((t) =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTopics.filter((t) => t.completed).length;
    const newProgress = updatedTopics.length > 0 ? Math.round((completedCount / updatedTopics.length) * 100) : 0;

    onUpdateExam({
      ...exam,
      topics: updatedTopics,
      progress: newProgress,
    });
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const parsedTopics = topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t, idx) => ({ id: `t-${Date.now()}-${idx}`, title: t, completed: false }));

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      date,
      subjectId,
      targetGrade: targetGrade.trim() || undefined,
      progress: 0,
      topics: parsedTopics.length > 0 ? parsedTopics : [{ id: 't-default', title: 'Studio completo del programma', completed: false }],
    };

    onAddExam(newExam);
    setTitle('');
    setDate('');
    setTopicsText('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto pb-36 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">🎯 Esami & Traguardi</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitora le scadenze degli appelli d'esame e la preparazione.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex-shrink-0"
        >
          <Plus size={13} />
          <span>Nuovo Esame</span>
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-notion-card-dark rounded-3xl border border-notion-border-light dark:border-notion-border-dark p-6">
          <p className="text-gray-400 mb-4 text-xs">Nessun esame in programma. Aggiungi il tuo primo appello!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow"
          >
            + Aggiungi Esame
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const daysLeft = getDaysLeft(exam.date);
            const sub = subjects.find((s) => s.id === exam.subjectId);

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-notion-card-dark rounded-3xl border border-notion-border-light dark:border-notion-border-dark p-5 shadow-xs relative"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1 mr-2">
                    {sub && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1" style={{ backgroundColor: `${sub.color}15`, color: sub.color }}>
                        {sub.icon} {sub.name}
                      </span>
                    )}
                    <h3 className="text-base font-bold truncate">{exam.title}</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Vuoi eliminare questo esame?')) onDeleteExam(exam.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Days Left & Target Grade Badges */}
                <div className="flex items-center space-x-2 mb-3 text-xs">
                  <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-xl font-bold text-[11px] ${
                    daysLeft <= 3 ? 'bg-red-500/10 text-red-600' : daysLeft <= 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    <Clock size={12} />
                    <span>
                      {daysLeft < 0 ? 'Superato' : daysLeft === 0 ? 'Oggi!' : `${daysLeft}g rimasti`}
                    </span>
                  </div>

                  {exam.targetGrade && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-xl bg-purple-500/10 text-purple-600 font-bold text-[11px]">
                      <Award size={12} />
                      <span>Obiettivo: {exam.targetGrade}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1">
                    <span>Avanzamento Programma</span>
                    <span>{exam.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${exam.progress}%` }}
                    />
                  </div>
                </div>

                {/* Topics Syllabus */}
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {exam.topics.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTopic(exam, t.id)}
                      className="flex items-center space-x-2 text-xs p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 cursor-pointer transition-colors"
                    >
                      {t.completed ? (
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle size={15} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`truncate ${t.completed ? 'line-through text-gray-400' : 'font-medium'}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-notion-card-dark rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-notion-border-light dark:border-notion-border-dark">
            <h3 className="text-base font-bold mb-3">Nuovo Esame</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">Nome Esame</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es: Diritto Privato o Fisica"
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">Materia</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-gray-400">Data Appello</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-gray-400">Voto Obiettivo</label>
                  <input
                    type="text"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    placeholder="Es: 30L"
                    className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-gray-400">
                  Argomenti (uno per riga)
                </label>
                <textarea
                  value={topicsText}
                  onChange={(e) => setTopicsText(e.target.value)}
                  placeholder="Capitolo 1: Introduzione&#10;Capitolo 2: Teoremi"
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-notion-border-light dark:border-notion-border-dark text-xs focus:outline-none"
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
                  Crea Esame
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
