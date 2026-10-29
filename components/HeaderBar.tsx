import React from 'react';
import { Volume2, VolumeX, Waves, Sparkles, Heart, Compass, CheckCircle2 } from 'lucide-react';

interface HeaderBarProps {
  discoveredCount: number;
  totalSpecimens: number;
  chestUnlocked: boolean;
  candlesBlown: boolean;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
  audioMuted: boolean;
  onToggleMute: () => void;
  onOpenLetter: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  discoveredCount,
  totalSpecimens,
  chestUnlocked,
  candlesBlown,
  ambientPlaying,
  onToggleAmbient,
  audioMuted,
  onToggleMute,
  onOpenLetter,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2.5 sm:p-4 flex items-center justify-between gap-2" dir="rtl">
      {/* Brand & Expedition Title */}
      <div className="pointer-events-auto bg-slate-900/85 border border-sky-500/25 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
          <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              آزمایشگاه اعماق دریا
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 font-mono">
              <Sparkles className="w-2.5 h-2.5" />
              <span>برای مرسدس</span>
            </span>
          </div>
          <h1 className="text-xs sm:text-sm font-extrabold text-white">
            اکسپدیشن تولد مرسدس
          </h1>
        </div>
      </div>

      {/* Right Controls: Ambient Music, Mute, Letter */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {/* Progress Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-xl backdrop-blur-md text-xs font-mono text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>کشف: {discoveredCount}/{totalSpecimens}</span>
          {chestUnlocked && <span className="text-amber-400">✦ صندوقچه</span>}
          {candlesBlown && <span className="text-pink-400">✦ شمع</span>}
        </div>

        {/* Ambient Oceanic Sound */}
        <button
          onClick={onToggleAmbient}
          className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all text-xs font-medium cursor-pointer backdrop-blur-md ${
            ambientPlaying
              ? 'bg-sky-500/25 text-sky-300 border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title={ambientPlaying ? 'توقف موسیقی اقیانوس' : 'پخش موسیقی ملایم اقیانوس'}
        >
          <Waves className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">موسیقی دریا</span>
        </button>

        {/* Mute */}
        <button
          onClick={onToggleMute}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 backdrop-blur-md transition-colors cursor-pointer"
          title={audioMuted ? 'صدای افکت‌ها فعال' : 'بی‌صدا کردن افکت‌ها'}
        >
          {audioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Birthday Letter Button */}
        <button
          onClick={onOpenLetter}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
          <span>نامه تولد</span>
        </button>
      </div>
    </header>
  );
};
