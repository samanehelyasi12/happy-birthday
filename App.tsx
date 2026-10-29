/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SceneViewMode, SpecimenId, ExpeditionState } from './types';
import { SPECIMENS } from './data/specimens';
import { soundEngine } from './utils/audio';
import { MarineLabCanvas } from './components/MarineLabCanvas';
import { HeaderBar } from './components/HeaderBar';
import { BottomControlDock } from './components/BottomControlDock';
import { MicroscopeOverlay } from './components/MicroscopeOverlay';
import { BirthdayCakeOverlay } from './components/BirthdayCakeOverlay';
import { TreasureChestOverlay } from './components/TreasureChestOverlay';
import { BirthdayLetterModal } from './components/BirthdayLetterModal';
import { ResearchLogDrawer } from './components/ResearchLogDrawer';

export default function App() {
  const [logOpen, setLogOpen] = useState(false);
  const [expedition, setExpedition] = useState<ExpeditionState>({
    discoveredSpecimens: {
      tardigrade: true,
      seahorse: false,
      jellyfish: false,
      fish: false,
    },
    chestUnlocked: false,
    candlesBlown: false,
    cakeCelebrated: false,
    letterOpen: false,
    activeSpecimen: 'tardigrade',
    viewMode: 'lab',
    magnification: '400x',
    audioMuted: false,
    ambientPlaying: false,
    dockCollapsed: false,
  });

  const handleSelectSpecimen = (id: SpecimenId) => {
    setExpedition((prev) => ({
      ...prev,
      activeSpecimen: id,
    }));
  };

  const handleDiscoverSpecimen = (id: SpecimenId) => {
    setExpedition((prev) => ({
      ...prev,
      discoveredSpecimens: {
        ...prev.discoveredSpecimens,
        [id]: true,
      },
    }));
  };

  const handleSetViewMode = (mode: SceneViewMode) => {
    soundEngine.playBubble();
    setExpedition((prev) => ({
      ...prev,
      viewMode: mode,
    }));
  };

  const handleChangeMagnification = (mag: '100x' | '400x' | '1000x') => {
    setExpedition((prev) => ({
      ...prev,
      magnification: mag,
    }));
  };

  const handleToggleChest = () => {
    setExpedition((prev) => {
      const nextUnlocked = !prev.chestUnlocked;
      if (nextUnlocked) {
        soundEngine.playChestUnlock();
      } else {
        soundEngine.playBubble();
      }
      return {
        ...prev,
        chestUnlocked: nextUnlocked,
        viewMode: 'chest',
      };
    });
  };

  const handleBlowCandles = () => {
    setExpedition((prev) => ({
      ...prev,
      candlesBlown: true,
      cakeCelebrated: true,
      viewMode: 'cake',
    }));
  };

  const handleRelightCandles = () => {
    setExpedition((prev) => ({
      ...prev,
      candlesBlown: false,
    }));
  };

  const handleToggleCandle = () => {
    setExpedition((prev) => {
      if (prev.viewMode !== 'cake') {
        return { ...prev, viewMode: 'cake' };
      }
      return {
        ...prev,
        candlesBlown: !prev.candlesBlown,
      };
    });
  };

  const handleToggleAmbient = () => {
    const isPlaying = soundEngine.toggleAmbient();
    setExpedition((prev) => ({
      ...prev,
      ambientPlaying: isPlaying,
    }));
  };

  const handleToggleMute = () => {
    const nextMute = !expedition.audioMuted;
    soundEngine.setMute(nextMute);
    setExpedition((prev) => ({
      ...prev,
      audioMuted: nextMute,
    }));
  };

  const handleReplayExpedition = () => {
    setLogOpen(false);
    setExpedition({
      discoveredSpecimens: {
        tardigrade: true,
        seahorse: false,
        jellyfish: false,
        fish: false,
      },
      chestUnlocked: false,
      candlesBlown: false,
      cakeCelebrated: false,
      letterOpen: false,
      activeSpecimen: 'tardigrade',
      viewMode: 'lab',
      magnification: '400x',
      audioMuted: expedition.audioMuted,
      ambientPlaying: expedition.ambientPlaying,
      dockCollapsed: false,
    });
  };

  const currentSpecimenData = SPECIMENS[expedition.activeSpecimen];
  const discoveredCount = Object.values(expedition.discoveredSpecimens).filter(Boolean).length;
  const totalSpecimens = Object.keys(SPECIMENS).length;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#071120] select-none text-slate-100 font-sans" dir="rtl">
      {/* 3D WebGL Canvas Viewport */}
      <MarineLabCanvas
        viewMode={expedition.viewMode}
        activeSpecimen={expedition.activeSpecimen}
        magnification={expedition.magnification}
        onSelectSpecimen={handleSelectSpecimen}
        chestUnlocked={expedition.chestUnlocked}
        onToggleChest={handleToggleChest}
        candlesBlown={expedition.candlesBlown}
        onToggleCandle={handleToggleCandle}
      />

      {/* Top Header Bar */}
      <HeaderBar
        discoveredCount={discoveredCount}
        totalSpecimens={totalSpecimens}
        chestUnlocked={expedition.chestUnlocked}
        candlesBlown={expedition.candlesBlown}
        ambientPlaying={expedition.ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
        audioMuted={expedition.audioMuted}
        onToggleMute={handleToggleMute}
        onOpenLetter={() => setExpedition((prev) => ({ ...prev, letterOpen: true }))}
        onOpenLog={() => setLogOpen(true)}
      />

      {/* View-Specific Overlays */}
      {expedition.viewMode === 'microscope' && (
        <MicroscopeOverlay
          specimen={currentSpecimenData}
          magnification={expedition.magnification}
          onChangeMagnification={handleChangeMagnification}
          isDiscovered={expedition.discoveredSpecimens[expedition.activeSpecimen]}
          onDiscover={() => handleDiscoverSpecimen(expedition.activeSpecimen)}
          onClose={() => handleSetViewMode('lab')}
        />
      )}

      {expedition.viewMode === 'cake' && (
        <BirthdayCakeOverlay
          candlesBlown={expedition.candlesBlown}
          onBlowCandles={handleBlowCandles}
          onRelightCandles={handleRelightCandles}
          onOpenLetter={() => setExpedition((prev) => ({ ...prev, letterOpen: true }))}
          onClose={() => handleSetViewMode('lab')}
        />
      )}

      {expedition.viewMode === 'chest' && (
        <TreasureChestOverlay
          chestUnlocked={expedition.chestUnlocked}
          onToggleChest={handleToggleChest}
          onGoToCake={() => handleSetViewMode('cake')}
          onClose={() => handleSetViewMode('lab')}
        />
      )}

      {/* Collapsible Bottom Control Dock */}
      <BottomControlDock
        viewMode={expedition.viewMode}
        onSetViewMode={handleSetViewMode}
        activeSpecimen={expedition.activeSpecimen}
        onSelectSpecimen={handleSelectSpecimen}
        discoveredSpecimens={expedition.discoveredSpecimens}
        chestUnlocked={expedition.chestUnlocked}
        onToggleChest={handleToggleChest}
        candlesBlown={expedition.candlesBlown}
        onBlowCandles={handleBlowCandles}
        isCollapsed={expedition.dockCollapsed}
        onToggleCollapse={() =>
          setExpedition((prev) => ({ ...prev, dockCollapsed: !prev.dockCollapsed }))
        }
        onOpenMicroscope={() => handleSetViewMode('microscope')}
        onOpenLetter={() => setExpedition((prev) => ({ ...prev, letterOpen: true }))}
      />

      {/* Marine Field Log Drawer */}
      <ResearchLogDrawer
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        discoveredSpecimens={expedition.discoveredSpecimens}
        onSelectSpecimen={handleSelectSpecimen}
        onGoToMicroscope={() => handleSetViewMode('microscope')}
        onGoToChest={() => handleSetViewMode('chest')}
        onGoToCake={() => handleSetViewMode('cake')}
      />

      {/* Birthday Letter & Honorary Certificate Modal */}
      {expedition.letterOpen && (
        <BirthdayLetterModal
          onClose={() => setExpedition((prev) => ({ ...prev, letterOpen: false }))}
          onReplay={handleReplayExpedition}
        />
      )}
    </main>
  );
}
