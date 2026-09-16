import { z } from 'zod';

// =============================================================================
// React ↔ Node/Express Contracts
// =============================================================================

export const AspectRatioEnum = z.enum(['16:9', '9:16', '2.39:1', '1:1', '4:3']);
export type AspectRatio = z.infer<typeof AspectRatioEnum>;

export const ProjectStyleEnum = z.enum([
  'cinematic_35mm',
  'cyberpunk_noir',
  'anime_4k',
  'documentary_realism',
  'vintage_polaroid',
]);
export type ProjectStyle = z.infer<typeof ProjectStyleEnum>;

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(120),
  logline: z.string().min(5).max(500),
  genre: z.string().min(2).max(50),
  aspectRatio: AspectRatioEnum.default('16:9'),
  visualStyle: ProjectStyleEnum.default('cinematic_35mm'),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const CharacterProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string(),
  description: z.string(),
  voiceArchetype: z.string(),
  visualReferenceSeeds: z.array(z.string()).default([]),
  faceEmbeddingId: z.string().optional(),
});
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

export const ShotSchema = z.object({
  shotNumber: z.number().int().positive(),
  cameraDirective: z.string(), // e.g., "dolly zoom, medium close-up, 50mm f/1.8"
  actionDescription: z.string(),
  dialogueSpeaker: z.string().optional(),
  dialogueText: z.string().optional(),
  audioCue: z.string().optional(),
  durationSeconds: z.number().positive().default(4.0),
  keyframeImageUrl: z.string().url().optional(),
  renderedVideoUrl: z.string().url().optional(),
  status: z.enum(['pending', 'generating', 'completed', 'failed']).default('pending'),
});
export type Shot = z.infer<typeof ShotSchema>;

export const SceneSchema = z.object({
  sceneNumber: z.number().int().positive(),
  heading: z.string(), // e.g., "EXT. CYBERPUNK ALLEYWAY - NIGHT"
  narrativeSummary: z.string(),
  shots: z.array(ShotSchema).default([]),
});
export type Scene = z.infer<typeof SceneSchema>;

export const ProjectSchema = CreateProjectSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['draft', 'storyboarding', 'synthesizing', 'rendering', 'completed', 'failed']),
  characters: z.array(CharacterProfileSchema).default([]),
  scenes: z.array(SceneSchema).default([]),
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
]);
export type WorkflowType = z.infer<typeof WorkflowTypeEnum>;

export const TriggerWorkflowRequestSchema = z.object({
  projectId: z.string(),
  workflowType: WorkflowTypeEnum,
  parameters: z.record(z.any()).default({}),
  userFeedback: z.string().optional(),
  targetSceneNumber: z.number().optional(),
  targetShotNumber: z.number().optional(),
  interruptOnHumanApproval: z.boolean().default(true),
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
  currentNode: z.string().optional(),
  completedNodes: z.array(z.string()).default([]),
  intermediateArtifacts: z.record(z.any()).default({}),
  result: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkflowRunResponse = z.infer<typeof WorkflowRunResponseSchema>;

export const ResumeWorkflowRequestSchema = z.object({
  runId: z.string(),
  approved: z.boolean(),
  reviewerFeedback: z.string().optional(),
  overrides: z.record(z.any()).optional(),
});
export type ResumeWorkflowRequest = z.infer<typeof ResumeWorkflowRequestSchema>;
