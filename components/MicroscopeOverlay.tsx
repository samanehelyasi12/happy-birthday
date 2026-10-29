import React from 'react';
import { SpecimenData } from '../types';
import { soundEngine } from '../utils/audio';
import { Eye, CheckCircle2, Sparkles, X, ZoomIn, Sliders, Info } from 'lucide-react';

interface MicroscopeOverlayProps {
  specimen: SpecimenData;
  magnification: '100x' | '400x' | '1000x';
  onChangeMagnification: (mag: '100x' | '400x' | '1000x') => void;
  isDiscovered: boolean;
  onDiscover: () => void;
  onClose: () => void;
}

export const MicroscopeOverlay: React.FC<MicroscopeOverlayProps> = ({
  specimen,
  magnification,
  onChangeMagnification,
  isDiscovered,
  onDiscover,
  onClose,
}) => {
  const [filterMode, setFilterMode] = React.useState<'brightfield' | 'fluorescence' | 'darkfield'>('fluorescence');

  const handleZoom = (z: '100x' | '400x' | '1000x') => {
    soundEngine.playBubble();
    onChangeMagnification(z);
  };

  const handleLogClick = () => {
    if (!isDiscovered) {
      onDiscover();
      soundEngine.playChime(1.5);
    }
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto pointer-events-auto bg-slate-900/85 border border-sky-500/30 rounded-2xl px-4 py-2.5 text-slate-100 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-sky-400 font-bold">
                نمای میکروسکوپ آزمایشگاه
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-950/90 border border-sky-500/40 text-sky-300 font-mono">
                {magnification}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {specimen.commonName}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* Center Microscope Reticle Graticule (Magnified Microbe Visible Here) */}
      <div className="relative mx-auto pointer-events-none flex items-center justify-center my-auto">
        <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-84 md:h-84 rounded-full border-2 border-sky-400/40 shadow-[0_0_80px_rgba(56,189,248,0.2)] flex items-center justify-center relative overflow-hidden">
          {/* Circular Reticle Graticule */}
          <div className="absolute inset-0 rounded-full border border-sky-300/15 pointer-events-none" />
          <div className="absolute w-full h-[1px] bg-sky-400/20" />
          <div className="absolute h-full w-[1px] bg-sky-400/20" />
          <div className="w-20 h-20 rounded-full border border-sky-400/30" />
          <div className="w-44 h-44 rounded-full border border-dashed border-sky-400/25" />

          {/* Subtly tinted lens glass */}
          <div
            className={`absolute inset-0 transition-colors duration-500 rounded-full pointer-events-none ${
              filterMode === 'fluorescence'
                ? 'bg-purple-950/15 mix-blend-screen'
                : filterMode === 'darkfield'
                ? 'bg-sky-950/30 mix-blend-multiply'
                : 'bg-amber-100/5'
            }`}
          />

          <div className="absolute bottom-3 text-[9px] font-mono text-sky-300/80 tracking-widest uppercase">
            میکرو ارگانیسم زیر لنز اپتیکال • {magnification}
          </div>
        </div>
      </div>

      {/* Bottom Floating Control & Dedication Card (Decluttered & Mobile Friendly) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto bg-slate-900/90 border border-slate-700/60 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>بزرگ‌نمایی:</span>
          </div>
          <div className="flex gap-1.5">
            {(['100x', '400x', '1000x'] as const).map((z) => (
              <button
                key={z}
                onClick={() => handleZoom(z)}
                className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  magnification === z
                    ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {z === '100x' ? '۱۰۰×' : z === '400x' ? '۴۰۰×' : '۱۰۰۰×'}
              </button>
            ))}
          </div>
        </div>

        {/* Dedication to مرسدس */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-pink-950/30 border border-purple-500/30 mb-3">
          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>یادداشت تقدیمی به مرسدس:</span>
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            {specimen.birthdayDedication}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLogClick}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs tracking-wide transition-all cursor-pointer shadow-lg ${
            isDiscovered
              ? 'bg-emerald-600/90 text-white border border-emerald-400/40 shadow-emerald-900/30'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-900/40'
          }`}
        >
          {isDiscovered ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>این نمونه در دفترچه اکتشافات مرسدس ثبت شد</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ثبت در دفترچه اکتشافات مرسدس</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
