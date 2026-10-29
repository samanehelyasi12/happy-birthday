import React from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { Key, Lock, Unlock, Cake, Compass, X, Award, Anchor, Globe, Sparkles } from 'lucide-react';

interface TreasureChestOverlayProps {
  chestUnlocked: boolean;
  onToggleChest: () => void;
  onGoToCake: () => void;
  onClose: () => void;
}

export const TreasureChestOverlay: React.FC<TreasureChestOverlayProps> = ({
  chestUnlocked,
  onToggleChest,
  onGoToCake,
  onClose,
}) => {
  const handleUnlock = () => {
    soundEngine.playChestUnlock();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { x: 0.75, y: 0.6 },
      colors: ['#facc15', '#fef08a', '#38bdf8', '#ffffff', '#c084fc'],
    });
    onToggleChest();
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto pointer-events-auto bg-slate-900/90 border border-amber-500/40 rounded-2xl px-3.5 py-2 text-slate-100 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/30 shrink-0">
            <Compass className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 font-bold block leading-tight">
              گنجینه اسرار اعماق دریا
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
              صندوقچه رویاها و آینده درخشان مرسدس
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* Bottom Floating Interactive Action Card */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto bg-slate-900/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md text-right">
        {!chestUnlocked ? (
          <div className="text-center">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>قفل باستانی صندوقچه بسته است</span>
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                صندوقچه آینده مرسدس
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              داخل این صندوقچه، نشانه‌هایی از مسیر شگفت‌انگیز و آینده پر از افتخار مرسدس در دنیای علم و اقیانوس‌ها نهفته است.
            </p>

            <button
              onClick={handleUnlock}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Key className="w-4 h-4 text-slate-950" />
              <span>باز کردن قفل صندوقچه گنجینه آینده</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>گنجینه آینده نمایان شد!</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                چشم‌انداز آینده مرسدس
              </span>
            </div>

            {/* Mercedes's Future Milestones inside Chest */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-sky-400/25 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Anchor className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-sky-200 block">زیردریایی اکتشافی</span>
                  <span className="text-slate-300 text-[10px] leading-tight block">فرماندهی کاوش در ژرفای ۱۱,۰۰۰ متری اقیانوس</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/80 border border-amber-400/25 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-amber-200 block">دکترای زیست‌شناسی</span>
                  <span className="text-slate-300 text-[10px] leading-tight block">لوح زرین افتخار و رهبری پژوهش‌های بزرگ دریا</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/80 border border-emerald-400/25 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-200 block">طرح جهانی نجات دریا</span>
                  <span className="text-slate-300 text-[10px] leading-tight block">احیای صخره‌های مرجانی با مدیریت مرسدس</span>
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-indigo-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>مرسدس عزیز، آینده به زیبایی اقیانوس‌ها برای تو منتظر است.</span>
              </span>
              <span className="text-[10px] font-bold text-pink-300 shrink-0 mr-2">
                از طرف حامی ✨
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onGoToCake}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer transform active:scale-95"
              >
                <Cake className="w-4 h-4 text-pink-200" />
                <span>رفتن به سمت کیک تولد مرسدس</span>
              </button>

              <button
                onClick={onToggleChest}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
              >
                <span>بستن درب</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
