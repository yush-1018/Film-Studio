import { Project, ProjectActivity, AssetItem, QualityCheckItem } from '../types/filmStudio';

export const initialProject: Project = {
  id: '',
  title: 'No Active Project',
  logline: '',
  genre: 'Sci-Fi',
  duration: '2 min',
  durationSeconds: 120,
  progress: 0,
  status: 'Draft',
  lastEdited: 'Just now',
  aspectRatio: '16:9',
  budget: 10,
  bible: {
    characters: [],
    locations: [],
  },
  scenes: [],
  productionIntelligence: {
    totalBudget: 15,
    estimatedCost: 0,
    remainingBudget: 15,
    breakdown: {
      videoGen: 0,
      imageGen: 0,
      voice: 0,
      music: 0,
      sfx: 0,
      retryBuffer: 0,
    },
    optimizationAvailable: false,
    optimizedCost: 0,
    potentialSavings: 0,
    optimizationSuggestion: '',
  },
};

export const mockQualityChecklist: QualityCheckItem[] = [
  {
    shotId: 'sh_1_1',
    shotNumber: 'Shot 1.1',
    characterMatch: true,
    wardrobeMatch: true,
    locationMatch: true,
    lightingMatch: true,
    notes: 'Character seed anchor and shadow alignment verified.',
    recommendation: 'Approved for final cut.',
    isProblematic: false,
  },
  {
    shotId: 'sh_1_2',
    shotNumber: 'Shot 1.2',
    characterMatch: true,
    wardrobeMatch: true,
    locationMatch: true,
    lightingMatch: true,
    notes: 'Ocular reflection tracks accurately.',
    recommendation: 'Approved for final cut.',
    isProblematic: false,
  },
  {
    shotId: 'sh_3_2',
    shotNumber: 'Shot 3.2',
    characterMatch: true,
    wardrobeMatch: true,
    locationMatch: true,
    lightingMatch: false,
    notes: 'Lighting temperature mismatch corrected.',
    recommendation: 'Regenerate lighting color grade only.',
    isProblematic: true,
  },
];

export const mockRecentActivities: ProjectActivity[] = [
  {
    id: 'act_1',
    agent: 'Director Agent',
    action: 'Completed breakdown for scenes',
    timestamp: '2 min ago',
    type: 'director',
  },
  {
    id: 'act_2',
    agent: 'Continuity Agent',
    action: 'Character consistency verified',
    timestamp: '5 min ago',
    type: 'quality',
  },
  {
    id: 'act_3',
    agent: 'Voice Agent',
    action: 'Synthesized dialogue cues',
    timestamp: '18 min ago',
    type: 'voice',
  },
  {
    id: 'act_4',
    agent: 'Editor Agent',
    action: 'Assembled provisional timeline',
    timestamp: '25 min ago',
    type: 'render',
  },
];

export const mockAssetsList: AssetItem[] = [
  {
    id: 'ast_1',
    name: 'Character Reference Seed',
    type: 'character',
    thumbnailUrl: '/generated_videos/gen_sh_1_1.jpg',
    usedInShotsCount: 14,
    consistencyScore: 95,
    format: 'PNG • 2048x2048',
  },
  {
    id: 'ast_2',
    name: 'Master Environment Plate',
    type: 'location',
    thumbnailUrl: '/generated_videos/gen_sh_1_1.jpg',
    usedInShotsCount: 8,
    format: 'PNG • 4K HDR',
  },
  {
    id: 'ast_3',
    name: 'Dialogue Track',
    type: 'voice',
    thumbnailUrl: '/generated_videos/gen_sh_1_1.jpg',
    usedInShotsCount: 1,
    format: 'WAV • 48kHz • 24-bit',
  },
];
