import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Bell, Coffee, Target } from 'lucide-react';
import { Subject } from '../types';

interface PomodoroViewProps {
  subjects: Subject[];
  onPomodoroCompleted: (subjectId: string, minutes: number) => void;
}

type Mode = 'study' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<Mode, number> = {
  study: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({ subjects, onPomodoroCompleted }) => {
  const [mode, setMode] = useState<Mode>('study');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.study);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const timerRef = useRef<any>(null);

  // Play gentle web audio chime
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio chime not supported');
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            if (mode === 'study') {
              setCompletedSessions((s) => s + 1);
              onPomodoroCompleted(selectedSubjectId, 25);
              setMode('shortBreak');
              return MODE_TIMES.shortBreak;
            } else {
              setMode('study');
              return MODE_TIMES.study;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, selectedSubjectId]);

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-xl mx-auto flex flex-col items-center justify-start sm:justify-center min-h-full pb-36 w-full">
      {/* Mode Switcher */}
      <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl mb-6 space-x-1 w-full max-w-sm justify-between">
        <button
          onClick={() => switchMode('study')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'study' ? 'bg-white dark:bg-notion-card-dark text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Target size={13} />
          <span>Studio</span>
        </button>

        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak' ? 'bg-white dark:bg-notion-card-dark text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Coffee size={13} />
          <span>Pausa (5m)</span>
        </button>

        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak' ? 'bg-white dark:bg-notion-card-dark text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Bell size={13} />
          <span>Lunga (15m)</span>
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex flex-col items-center justify-center rounded-full bg-white dark:bg-notion-card-dark border-4 border-notion-border-light dark:border-notion-border-dark shadow-xl mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            className={`transition-all duration-1000 ${
              mode === 'study' ? 'stroke-blue-500' : mode === 'shortBreak' ? 'stroke-emerald-500' : 'stroke-purple-500'
            }`}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="z-10 text-center">
          <span className="text-4xl sm:text-6xl font-mono font-extrabold tracking-tighter">
            {formatTime(timeLeft)}
          </span>
          <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">
            {mode === 'study' ? 'Tempo Focus' : 'Pausa Relax'}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 active:bg-black/10 text-gray-500 transition-colors"
          title="Ricomincia"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center space-x-2 px-6 sm:px-8 py-3 rounded-2xl font-bold text-white text-sm sm:text-base shadow-lg active:scale-95 transition-all ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'Pausa' : 'Avvia Studio'}</span>
        </button>

        <button
          onClick={() => {
            if (mode === 'study') switchMode('shortBreak');
            else switchMode('study');
          }}
          className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 active:bg-black/10 text-gray-500 transition-colors"
          title="Salta fase"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Subject Attribution Selector */}
      <div className="w-full max-w-xs bg-black/5 dark:bg-white/5 p-2.5 rounded-2xl flex items-center justify-between text-xs mb-4">
        <span className="text-gray-400 font-semibold">Materia:</span>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="bg-white dark:bg-notion-card-dark rounded-xl px-2.5 py-1 font-medium border border-notion-border-light dark:border-notion-border-dark focus:outline-none max-w-[170px] truncate"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Daily Stats Pill */}
      <div className="flex items-center space-x-4 text-xs text-gray-500 font-medium">
        <div className="flex items-center space-x-1">
          <Flame size={14} className="text-red-500" />
          <span><b>{completedSessions}</b> completati</span>
        </div>
        <div>
          <span>Tempo: <b>{completedSessions * 25} min</b></span>
        </div>
      </div>
    </div>
  );
};
