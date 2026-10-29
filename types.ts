export type SceneViewMode = 'lab' | 'microscope' | 'specimens' | 'chest' | 'cake';

export type SpecimenId = 'tardigrade' | 'seahorse' | 'jellyfish' | 'fish';

export interface SpecimenData {
  id: SpecimenId;
  commonName: string;
  scientificName: string;
  category: string;
  habitat: string;
  magnification: string;
  fieldNotes: string;
  birthdayDedication: string;
  funFact: string;
  color: string;
  glowColor: string;
}

export interface ExpeditionState {
  discoveredSpecimens: Record<SpecimenId, boolean>;
  chestUnlocked: boolean;
  candlesBlown: boolean;
  cakeCelebrated: boolean;
  letterOpen: boolean;
  activeSpecimen: SpecimenId;
  viewMode: SceneViewMode;
  magnification: '100x' | '400x' | '1000x';
  audioMuted: boolean;
  ambientPlaying: boolean;
  dockCollapsed: boolean;
}
