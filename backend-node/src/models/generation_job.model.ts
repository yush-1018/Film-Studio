import mongoose, { Schema, Document } from 'mongoose';
import { GenerationStage } from '../contracts/types';

export interface IGenerationJobDocument extends Document {
  jobId: string;
  projectId: string;
  currentStage: GenerationStage;
  progress: number;
  stageResults: Record<string, 'pending' | 'passed' | 'failed'>;
  costUsed: number;
  costBudget: number;
  errorMessage?: string;
  intermediateArtifacts: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const GenerationJobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true, alias: 'job_id' },
    projectId: { type: String, required: true, index: true, alias: 'project_id' },
    currentStage: {
      type: String,
      required: true,
      default: 'understanding',
      alias: 'current_stage',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    stageResults: { type: Schema.Types.Mixed, default: {}, alias: 'stage_results' },
    costUsed: { type: Number, default: 0.0, alias: 'cost_used' },
    costBudget: { type: Number, default: 15.00, alias: 'cost_budget' },
    errorMessage: { type: String, alias: 'error_message' },
    intermediateArtifacts: { type: Schema.Types.Mixed, default: {}, alias: 'intermediate_artifacts' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'generation_jobs',
  }
);

export const GenerationJobModel = mongoose.model<IGenerationJobDocument>(
  'GenerationJob',
  GenerationJobSchema
);
