import { z } from 'zod';

// =============================================================================
// React ↔ Node/Express Contracts
// =============================================================================

export const AspectRatioEnum = z.enum(['16:9', '9:16', '1:1', '2.39:1', '4:3']);
export type AspectRatio = z.infer<typeof AspectRatioEnum>;

export const ProjectStyleEnum = z.enum([
  'cinematic_35mm',
  'cyberpunk_noir',
  'anime_4k',
  'documentary_realism',
  'vintage_polaroid',
]);
export type ProjectStyle = z.infer<typeof ProjectStyleEnum>;

export const GenerationStageEnum = z.enum([
  'understanding',
  'screenplay',
  'storyboard',
  'visuals',
  'continuity',
  'voice',
  'sound',
  'editing',
  'completed',
  'failed',
]);
export type GenerationStage = z.infer<typeof GenerationStageEnum>;

export const ProjectInputSchema = z.object({
  type: z.enum(['script', 'story', 'audio']).default('story'),
  content: z.string().min(5).max(10000), // raw user text — preserved verbatim, never overwritten
  audioUrl: z.string().optional(),
  transcript: z.string().optional(), // editable STT output
});
export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const ProjectPreferencesSchema = z.object({
  durationSeconds: z.number().int().min(60, "Duration must be at least 60 seconds (1 minute)").max(300, "Duration cannot exceed 300 seconds (5 minutes)").default(120),
  aspectRatio: AspectRatioEnum.default('16:9'),
  visualStyle: z.string().default('cinematic_35mm'),
  language: z.string().default('en'),
  voice: z.object({
    enabled: z.boolean().default(true),
    gender: z.enum(['male', 'female', 'neutral']).default('neutral'),
    tone: z.string().default('cinematic narrator'),
  }).default({ enabled: true, gender: 'neutral', tone: 'cinematic narrator' }),
  music: z.object({
    enabled: z.boolean().default(true),
    mood: z.string().optional(),
  }).default({ enabled: true }),
  subtitles: z.boolean().default(false),
});
export type ProjectPreferences = z.infer<typeof ProjectPreferencesSchema>;

export const CharacterProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string(),
  description: z.string(),
  voiceArchetype: z.string().optional(),
  visualReferenceSeeds: z.array(z.string()).default([]),
  faceEmbeddingId: z.string().optional(),
});
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

export const LocationProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  settingType: z.string(), // interior / exterior
  atmosphere: z.string(),
  lightingSignature: z.string(),
});
export type LocationProfile = z.infer<typeof LocationProfileSchema>;

export const ShotSchema = z.object({
  id: z.string().optional(),
  sceneId: z.string().optional(),
  shotNumber: z.number().int().positive(),
  durationSeconds: z.number().positive().default(4.0),
  purpose: z.string().optional(),
  description: z.string().optional(),
  actionDescription: z.string(),
  visualPrompt: z.string().optional(),
  cameraDirective: z.string(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  characters: z.array(z.string()).default([]),
  location: z.string().optional(),
  dialogueSpeaker: z.string().optional(),
  dialogueText: z.string().optional(),
  audioCue: z.string().optional(),
  keyframeImageUrl: z.string().optional(),
  renderedVideoUrl: z.string().optional(),
  status: z.enum(['pending', 'generating', 'completed', 'failed']).default('pending'),
});
export type Shot = z.infer<typeof ShotSchema>;

export const SceneSchema = z.object({
  id: z.string().optional(),
  sceneNumber: z.number().int().positive(),
  durationSeconds: z.number().positive().default(20.0),
  summary: z.string().optional(),
  heading: z.string(),
  narrativeSummary: z.string(),
  location: z.string().optional(),
  characters: z.array(z.string()).default([]),
  mood: z.string().optional(),
  shots: z.array(ShotSchema).default([]),
});
export type Scene = z.infer<typeof SceneSchema>;

export const GenerationMetadataSchema = z.object({
  jobId: z.string(),
  stage: GenerationStageEnum.default('understanding'),
  progress: z.number().min(0).max(100).default(0),
  stageResults: z.record(z.enum(['pending', 'passed', 'failed'])).default({}),
  costUsed: z.number().default(0),
  costBudget: z.number().default(15.00),
  error: z.string().optional(),
});
export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(120),
  logline: z.string().min(5).max(10000).optional(),
  genre: z.string().min(2).max(50).default('Sci-Fi'),
  aspectRatio: AspectRatioEnum.default('16:9'),
  visualStyle: z.string().default('cinematic_35mm'),
  input: ProjectInputSchema.optional(),
  preferences: ProjectPreferencesSchema.optional(),
  ownerId: z.string().default('user_ayush'), // single-tenant dev mode default
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  ownerId: z.string().default('user_ayush'), // closes loophole #9, scoped per loophole #13
  title: z.string().min(1).max(120),
  logline: z.string().optional(),
  genre: z.string().default('Sci-Fi'),
  aspectRatio: AspectRatioEnum.default('16:9'),
  visualStyle: z.string().default('cinematic_35mm'),
  input: ProjectInputSchema,
  preferences: ProjectPreferencesSchema,
  status: z.enum(['draft', 'planning', 'generating', 'editing', 'completed', 'failed']).default('draft'),
  characters: z.array(CharacterProfileSchema).default([]),
  locations: z.array(LocationProfileSchema).default([]),
  scenes: z.array(SceneSchema).default([]),
  shots: z.array(ShotSchema).default([]),
  generation: GenerationMetadataSchema.optional(),
  masterVideoUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

// =============================================================================
// Node/Express ↔ FastAPI/LangGraph Contracts
// =============================================================================

export const WorkflowTypeEnum = z.enum([
  'script_ideation',
  'script_to_storyboard',
  'continuity_validation',
  'scene_synthesis',
  'render_timeline',
  'full_pipeline',
]);
export type WorkflowType = z.infer<typeof WorkflowTypeEnum>;

export const TriggerWorkflowRequestSchema = z.object({
  projectId: z.string(),
  workflowType: WorkflowTypeEnum,
  parameters: z.record(z.any()).default({}),
  userFeedback: z.string().optional(),
  targetSceneNumber: z.number().optional(),
  targetShotNumber: z.number().optional(),
  interruptOnHumanApproval: z.boolean().default(false),
});
export type TriggerWorkflowRequest = z.infer<typeof TriggerWorkflowRequestSchema>;

export const WorkflowRunStatusEnum = z.enum([
  'queued',
  'running',
  'waiting_for_approval',
  'completed',
  'failed',
  'cancelled',
]);
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusEnum>;

export const WorkflowRunResponseSchema = z.object({
  runId: z.string(),
  projectId: z.string(),
  workflowType: WorkflowTypeEnum,
  status: WorkflowRunStatusEnum,
  currentStage: GenerationStageEnum.optional(),
  progress: z.number().min(0).max(100).default(0),
  stageResults: z.record(z.enum(['pending', 'passed', 'failed'])).optional(),
  costUsed: z.number().default(0),
  costBudget: z.number().default(15.00),
  currentNode: z.string().optional(),
  completedNodes: z.array(z.string()).default([]),
  intermediateArtifacts: z.record(z.any()).default({}),
  result: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkflowRunResponse = z.infer<typeof WorkflowRunResponseSchema>;
