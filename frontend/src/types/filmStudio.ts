// Types for Agentic Film Studio

export type NavigationTab =
  | 'dashboard'
  | 'new_project'
  | 'projects'
  | 'director_mode'
  | 'script'
  | 'storyboard'
  | 'generate'
  | 'characters'
  | 'assets'
  | 'audio'
  | 'timeline'
  | 'quality'
  | 'render';

export type ProductionStrategy = 'VIDEO' | 'IMAGE_MOTION' | 'REUSE' | 'EXTEND' | 'TRANSITION';

export interface Shot {
  id: string;
  shotNumber: string; // e.g. "1.1", "1.2"
  sceneNumber: number;
  type: string; // "Wide Shot", "Close Up", "Insert Shot", "Medium Shot", "Dutch Angle"
  timeRange: string; // "00:00 – 00:04"
  duration: number; // in seconds
  cameraDirective: string;
  actionDescription: string;
  dialogueSpeaker?: string;
  dialogueText?: string;
  audioCue?: string;
  status: 'ready' | 'generating' | 'pending' | 'failed';
  strategy: ProductionStrategy;
  strategyReason: string;
  recommendedModel: string;
  estimatedCost: number; // in ₹
  thumbnailUrl: string;
  thumbnailGradient: string;
  continuityScore: number; // percentage (e.g. 96)
  motionIntensity: 'low' | 'medium' | 'high';
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  timeRange: string;
  duration: number; // in seconds
  slugline: string; // e.g. "INT. HOSTEL ROOM – NIGHT"
  description: string;
  shots: Shot[];
  status: 'ready' | 'generating' | 'pending';
}

export interface Character {
  id: string;
  name: string;
  age: number;
  role: string; // "Main Character", "Antagonist", "Contact"
  appearance: string;
  wardrobe: string;
  voiceProfile: string;
  referenceImage: string;
  referenceSeed: string;
  consistencyScore: number; // percentage (e.g. 95)
  shotsCount: number;
  usedInScenes: number[];
}

export interface Location {
  id: string;
  name: string;
  type: string; // "Interior", "Exterior"
  lighting: string;
  description: string;
  shotsCount: number;
  referenceImage: string;
}

export interface FilmBible {
  characters: Character[];
  locations: Location[];
  props: string[];
  visualStyle: {
    name: string;
    description: string;
    lighting: string;
    colorPalette: string[];
    cameraStyle: string;
  };
}

export interface ProductionIntelligence {
  totalBudget: number; // ₹500
  estimatedCost: number; // ₹412
  remainingBudget: number; // ₹88
  breakdown: {
    videoGen: number;
    imageGen: number;
    voice: number;
    music: number;
    sfx: number;
    retryBuffer: number;
  };
  optimizationAvailable: boolean;
  optimizedCost: number; // ₹351
  potentialSavings: number; // ₹61
  optimizationSuggestion: string;
}

export interface GenerationJob {
  id: string;
  shotId: string;
  shotNumber: string;
  sceneTitle: string;
  model: string;
  progress: number;
  status: 'queued' | 'generating' | 'completed' | 'failed' | 'paused';
  estimatedSecondsRemaining: number;
  previewUrl?: string;
  errorMessage?: string;
}

export interface QualityCheckItem {
  shotId: string;
  shotNumber: string;
  characterMatch: boolean;
  wardrobeMatch: boolean;
  locationMatch: boolean;
  lightingMatch: boolean;
  notes: string;
  recommendation: string;
  isProblematic: boolean;
}

export interface ProjectActivity {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
  type: 'director' | 'script' | 'quality' | 'voice' | 'render';
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'character' | 'location' | 'prop' | 'image' | 'video' | 'voice' | 'music' | 'sfx';
  thumbnailUrl: string;
  usedInShotsCount: number;
  consistencyScore?: number;
  format: string;
}

export interface Project {
  id: string;
  title: string;
  logline: string;
  genre: string;
  duration: string; // "2 min"
  durationSeconds: number;
  progress: number; // percentage
  status: 'Planning' | 'Script' | 'Characters' | 'Storyboard' | 'Generating' | 'Audio' | 'Editing' | 'Rendering' | 'Complete';
  lastEdited: string;
  aspectRatio: string;
  budget: number;
  scenes: Scene[];
  bible: FilmBible;
  productionIntelligence: ProductionIntelligence;
  generationJobs: GenerationJob[];
  qualityScore: number;
  continuityScore: number;
}
