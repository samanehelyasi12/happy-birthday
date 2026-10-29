import React from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { Sparkles, Flame, Wind, Cake, Heart, X } from 'lucide-react';

interface BirthdayCakeOverlayProps {
  candlesBlown: boolean;
  onBlowCandles: () => void;
  onRelightCandles: () => void;
  onOpenLetter: () => void;
  onClose: () => void;
}

export const BirthdayCakeOverlay: React.FC<BirthdayCakeOverlayProps> = ({
  candlesBlown,
  onBlowCandles,
  onRelightCandles,
  onOpenLetter,
  onClose,
}) => {
  const triggerConfetti = () => {
    const colors = ['#38bdf8', '#c084fc', '#f472b6', '#facc15', '#ffffff', '#2dd4bf'];

    // Wave 1: Immediate celebratory blast upon blowing
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors,
    });

    // Wave 2: Left and right side fireworks
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.6 },
        colors,
      });
    }, 400);

    // Wave 3: Mid-song golden & pastel burst ("Happy Birthday dear Mercedes")
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#facc15', '#ffd700', '#f472b6', '#ffffff'],
      });
    }, 7000);

    // Wave 4: Grand finale celebration at the song climax
    setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 100,
        origin: { y: 0.45 },
        colors,
      });
    }, 13000);
  };

  const handleBlow = () => {
    soundEngine.playCandleBlow();
    triggerConfetti();
    onBlowCandles();
  };

  const handleRelight = () => {
    soundEngine.playChime(1.1);
    onRelightCandles();
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pointer-events-auto bg-slate-900/85 border border-pink-500/30 rounded-2xl px-3.5 py-2 text-slate-100 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shrink-0">
            <Cake className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-pink-400 font-bold block leading-tight">
              جشن تولد در اعماق دریا
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
              کیک اقیانوسی مرسدس
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>خروج</span>
        </button>
      </div>

      {/* Bottom Floating Interactive Action Card (Ultra-compact so cake & candles remain 100% visible) */}
      <div className="mb-safe w-full max-w-md mx-auto pointer-events-auto bg-slate-900/90 border border-purple-500/30 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md text-center">
        {!candlesBlown ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>۴ شمع روشن هستند</span>
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                مرسدس، آرزو کن و فوت کن!
              </span>
            </div>

            <button
              onClick={handleBlow}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Wind className="w-4 h-4 text-cyan-200" />
              <span>فوت کردن شمع‌های تولد</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>تولدت مبارک مرسدس! آرزویت ثبت شد ✨</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onOpenLetter}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-pink-200" />
                <span>مشاهده نامه تولد</span>
              </button>

              <button
                onClick={handleRelight}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>روشن کردن مجدد</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
