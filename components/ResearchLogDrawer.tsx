import React from 'react';
import { SpecimenId } from '../types';
import { SPECIMENS } from '../data/specimens';
import { soundEngine } from '../utils/audio';
import { BookOpen, CheckCircle2, Sparkles, X, Microscope, Gift, Cake } from 'lucide-react';

interface ResearchLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredSpecimens: Record<SpecimenId, boolean>;
  onSelectSpecimen: (id: SpecimenId) => void;
  onGoToMicroscope: () => void;
  onGoToChest: () => void;
  onGoToCake: () => void;
}

export const ResearchLogDrawer: React.FC<ResearchLogDrawerProps> = ({
  isOpen,
  onClose,
  discoveredSpecimens,
  onSelectSpecimen,
  onGoToMicroscope,
  onGoToChest,
  onGoToCake,
}) => {
  if (!isOpen) return null;

  const specimenKeys = Object.keys(SPECIMENS) as SpecimenId[];
  const discoveredCount = specimenKeys.filter((k) => discoveredSpecimens[k]).length;
  const isAllCollected = discoveredCount === specimenKeys.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400 font-semibold">
                Official Expedition Dossier
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Mercedes's Marine Field Log
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="بستن دفترچه"
            title="بستن"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
            <span>Expedition Discovery Progress</span>
            <span className="text-sky-400 font-bold">{discoveredCount} / {specimenKeys.length} Collected</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 transition-all duration-500 rounded-full"
              style={{ width: `${(discoveredCount / specimenKeys.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Specimen Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {specimenKeys.map((key) => {
            const item = SPECIMENS[key];
            const isFound = discoveredSpecimens[key];

            return (
              <div
                key={key}
                onClick={() => {
                  onSelectSpecimen(key);
                  soundEngine.playBubble();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isFound
                    ? 'bg-slate-800/70 border-sky-500/30 hover:border-sky-400'
                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <h3 className="text-sm font-bold text-white">{item.commonName}</h3>
                  </div>
                  {isFound ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Logged
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Unexamined</span>
                  )}
                </div>

                <p className="text-xs italic text-slate-400 font-serif mb-1">
                  {item.scientificName} • {item.magnification}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {item.birthdayDedication}
                </p>
              </div>
            );
          })}
        </div>

        {/* Next Expedition Milestones */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => {
              onClose();
              onGoToMicroscope();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Examine in Microscope</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToChest();
            }}
            className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Sunken Chest</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToCake();
            }}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Birthday Cake</span>
          </button>
        </div>
      </div>
    </div>
  );
};
