import mongoose, { Schema, Document } from 'mongoose';
import { Project } from '../contracts/types';

export interface IProjectDocument extends Document, Omit<Project, 'id'> {
  id: string;
}

const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, default: 'user_ayush', index: true, alias: 'owner_id' },
    title: { type: String, required: true, trim: true },
    logline: { type: String },
    genre: { type: String, default: 'Sci-Fi' },
    aspectRatio: { type: String, default: '16:9', alias: 'aspect_ratio' },
    visualStyle: { type: String, default: 'cinematic_35mm', alias: 'visual_style' },
    input: {
      type: { type: String, enum: ['script', 'story', 'audio'], default: 'story' },
      content: { type: String, required: true },
      audioUrl: { type: String, alias: 'audio_url' },
      transcript: { type: String },
    },
    preferences: {
      durationSeconds: { type: Number, default: 120, min: 60, max: 300, alias: 'duration_seconds' },
      aspectRatio: { type: String, default: '16:9', alias: 'aspect_ratio' },
      visualStyle: { type: String, default: 'cinematic_35mm', alias: 'visual_style' },
      language: { type: String, default: 'en' },
      voice: {
        enabled: { type: Boolean, default: true },
        gender: { type: String, default: 'neutral' },
        tone: { type: String, default: 'cinematic narrator' },
      },
      music: {
        enabled: { type: Boolean, default: true },
        mood: { type: String },
      },
      subtitles: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['draft', 'planning', 'generating', 'editing', 'completed', 'failed'],
      default: 'draft',
    },
    characters: [{ type: Schema.Types.Mixed }],
    locations: [{ type: Schema.Types.Mixed }],
    scenes: [{ type: Schema.Types.Mixed }],
    shots: [{ type: Schema.Types.Mixed }],
    masterVideoUrl: { type: String, alias: 'master_video_url' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'projects',
  }
);

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
