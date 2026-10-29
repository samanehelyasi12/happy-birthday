import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { Heart, Sparkles, Award, RotateCcw, X, Printer, Compass } from 'lucide-react';

interface BirthdayLetterModalProps {
  onClose: () => void;
  onReplay: () => void;
}

export const BirthdayLetterModal: React.FC<BirthdayLetterModalProps> = ({
  onClose,
  onReplay,
}) => {
  const [tab, setTab] = useState<'letter' | 'certificate'>('letter');

  const handleReplayClick = () => {
    soundEngine.playBubble();
    onReplay();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCelebrate = () => {
    soundEngine.playChime(1.3);
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#c084fc', '#f472b6', '#facc15', '#2dd4bf'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-sky-400/40 rounded-3xl shadow-[0_0_80px_rgba(56,189,248,0.25)] text-slate-100 overflow-hidden my-auto">
        {/* Top Decorative Border */}
        <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-widest text-sky-400 font-bold">
                پیام اختصاصی اکسپدیشن اعماق دریا
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                تولدت مبارک مرسدس عزیز
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCelebrate}
              className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 transition-colors cursor-pointer"
              title="پخش فشفشه"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 flex gap-4 border-b border-slate-800/80">
          <button
            onClick={() => setTab('letter')}
            className={`pb-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              tab === 'letter'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            نامه تبریک تولد
          </button>
          <button
            onClick={() => setTab('certificate')}
            className={`pb-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'certificate'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>لوح افتخار کاشف اعماق</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
          {tab === 'letter' ? (
            <div className="space-y-4 text-slate-200 text-sm leading-relaxed font-sans">
              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/25 text-sky-200 text-xs font-mono">
                ✦ ایستگاه پژوهشی اعماق اقیانوس &nbsp;|&nbsp; ✦ گیرنده: مرسدس
              </div>

              <p className="text-base font-bold text-sky-300">
                مرسدس عزیز و دوست‌داشتنی،
              </p>

              <p>
                از ریزترین و مقاوم‌ترین خرس آبی در عمیق‌ترین درازگودال‌های جهان، تا دیاتوم بلورینی که نور اقیانوس را به هندسه‌ای جادویی تبدیل می‌کند، و عروس دریایی درخشانی که تاریکی اعماق را روشن می‌سازد؛ همه زیبایی‌های بی‌پایان دریا امروز تولد تو را جشن می‌گیرند.
              </p>

              <p>
                کنجکاوی بی‌پایان، اراده محکم، و قلب پر از مهربانی‌ات، حضور تو را در زندگی اطرافیانت مثل نوری آرامش‌بخش و الهام‌بخش می‌کند. درست شبیه به شگفتی‌های ناشناخته و مسحورکننده اقیانوس، تو دنیایی از شگفتی، خنده و اصالت با خودت داری.
              </p>

              <p>
                امیدوارم سال جدید زندگی‌ات پر از اکتشافات شگفت‌انگیز، روزهای آرام مثل آب‌های نیلگون ساحل، و لحظاتی سرشار از لبخندهای از ته دل باشد. همیشه بدرخش و از مسیر رویاهایت با شجاعت عبور کن.
              </p>

              <div className="pt-4 border-t border-slate-800 text-left">
                <p className="text-sm font-serif italic text-purple-300">
                  با تمام آرزوهای قشنگ و صمیمانه،
                </p>
                <p className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300 mt-1">
                  از طرف حامی
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 border-2 border-amber-400/50 shadow-inner text-center relative overflow-hidden">
              <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
                انستیتو پژوهش‌های اقیانوس‌شناسی
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1 mb-2">
                لوح افتخار کاشف برتر اعماق دریا
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                این نشان افتخار با افتخار و صمیمیت تقدیم می‌شود به:
              </p>
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-pink-300 to-amber-300 mb-3">
                مرسدس
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                به پاس کنجکاوی درخشان، استقامت ستودنی و نگاه پر از شور و اشتیاق به زیبایی‌های خلقت در روز فرخنده زادروزش.
              </p>
              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400 px-4">
                <div>
                  <div className="text-slate-200 font-bold">مهردار رسمی اعماق</div>
                  <div>تأیید شده ۱۰۰٪</div>
                </div>
                <div className="text-left">
                  <div className="text-slate-200 font-bold">از طرف حامی</div>
                  <div className="text-pink-300 font-semibold">همیشه و همه‌جا ✨</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleReplayClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تکرار اکسپدیشن</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ یادگاری</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              بازگشت به آزمایشگاه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
