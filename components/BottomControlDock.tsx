import React from 'react';
import { SceneViewMode, SpecimenId } from '../types';
import { SPECIMENS } from '../data/specimens';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Microscope,
  Cake,
  Gift,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';

interface BottomControlDockProps {
  viewMode: SceneViewMode;
  onSetViewMode: (mode: SceneViewMode) => void;
  activeSpecimen: SpecimenId;
  onSelectSpecimen: (id: SpecimenId) => void;
  discoveredSpecimens: Record<SpecimenId, boolean>;
  chestUnlocked: boolean;
  onToggleChest: () => void;
  candlesBlown: boolean;
  onBlowCandles: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMicroscope: () => void;
  onOpenLetter: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  viewMode,
  onSetViewMode,
  activeSpecimen,
  onSelectSpecimen,
  discoveredSpecimens,
  chestUnlocked,
  onToggleChest,
  candlesBlown,
  onBlowCandles,
  isCollapsed,
  onToggleCollapse,
  onOpenMicroscope,
  onOpenLetter,
}) => {
  const specimenKeys = Object.keys(SPECIMENS) as SpecimenId[];

  return (
    <div
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95vw] max-w-[880px] transition-transform duration-300 ease-out pointer-events-none ${
        isCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
      }`}
      dir="rtl"
    >
      {/* Collapse Toggle Tab Button */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={onToggleCollapse}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 text-[11px] font-medium border-t border-x border-sky-500/30 shadow-lg backdrop-blur-md transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>نمایش ابزارها و کنترل‌ها</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>نمای سینمایی (مخفی کردن منو)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Control Dock */}
      <div className="pointer-events-auto bg-slate-900/92 border border-sky-500/30 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md text-slate-100">
        <div className="flex flex-col gap-2.5">
          {/* View Camera Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold">
              <Eye className="w-3.5 h-3.5" />
              <span>زاویه دید دوربین:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {[
                { id: 'lab', label: 'نمای آزمایشگاه', icon: Eye },
                { id: 'microscope', label: 'میکروسکوپ', icon: Microscope },
                { id: 'specimens', label: 'محفظه‌ها', icon: Sparkles },
                { id: 'chest', label: 'صندوقچه گنج', icon: Gift },
                { id: 'cake', label: 'کیک تولد', icon: Cake },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = viewMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSetViewMode(item.id as SceneViewMode)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specimen Organism Selector Pills & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Organism Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {specimenKeys.map((key) => {
                const s = SPECIMENS[key];
                const isSelected = activeSpecimen === key;
                const isFound = discoveredSpecimens[key];

                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelectSpecimen(key);
                      if (viewMode !== 'microscope' && viewMode !== 'specimens') {
                        onSetViewMode('specimens');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isFound ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                    )}
                    <span>{s.commonName}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Interactive Actions */}
            <div className="flex items-center gap-1.5 shrink-0 justify-end">
              <button
                onClick={onOpenMicroscope}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Microscope className="w-3 h-3 text-sky-300" />
                <span>بررسی زیر میکروسکوپ</span>
              </button>

              <button
                onClick={onToggleChest}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  chestUnlocked
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                }`}
              >
                {chestUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{chestUnlocked ? 'صندوق بازه' : 'صندوقچه'}</span>
              </button>

              <button
                onClick={onBlowCandles}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  candlesBlown
                    ? 'bg-pink-500/20 text-pink-200 border-pink-400/40'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold border-pink-400 shadow-md'
                }`}
              >
                <Cake className="w-3 h-3" />
                <span>{candlesBlown ? 'آرزو شد' : 'شمع‌ها'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
