# Shared MongoDB Schema Contract: `snake_case` Standard

To prevent silent serialization drift between `backend-agents` (Python / PyMongo) and `backend-node` (TypeScript / Mongoose), all shared MongoDB collections store raw document keys using **`snake_case`**.

---

## 1. Collection: `generation_jobs`

Stores asynchronous background generation job state, checkpoints, stage transitions, and telemetry.

### Document Specification

| Field Key (Raw Mongo) | Type | TS Property (Mongoose Alias) | Description |
|---|---|---|---|
| `_id` | `ObjectId` / `string` | `_id` | MongoDB document ID |
| `job_id` | `string` | `jobId` | Unique job identifier (e.g. `job_abc123`) |
| `project_id` | `string` | `projectId` | Reference to parent `FilmProject` ID |
| `current_stage` | `string` | `currentStage` | Active stage: `understanding`, `screenplay`, `storyboard`, `visuals`, `continuity`, `voice`, `sound`, `editing`, `completed`, `failed` |
| `progress` | `number` | `progress` | Real progress percentage (0 - 100) written only at real stage transitions |
| `stage_results` | `object` | `stageResults` | Map of stage name to status: `{"understanding": "passed", ...}` |
| `cost_used` | `number` | `costUsed` | Total provider cost consumed in USD (e.g. `0.45`) |
| `cost_budget` | `number` | `costBudget` | Per-project hard budget cap (default `$15.00`) |
| `error_message` | `string` (opt) | `errorMessage` | Error details if job failed |
| `intermediate_artifacts` | `object` | `intermediateArtifacts` | Output payloads produced by each stage |
| `created_at` | `string` / `Date` | `createdAt` | ISO-8601 creation timestamp |
| `updated_at` | `string` / `Date` | `updatedAt` | ISO-8601 last update timestamp |

---

## 2. Collection: `projects`

Stores user film projects, screenplay, scene and shot metadata, asset references, and owner binding.

| Field Key (Raw Mongo) | Type | TS Property (Mongoose Alias) | Description |
|---|---|---|---|
| `_id` | `ObjectId` / `string` | `_id` | MongoDB document ID |
| `id` | `string` | `id` | Unique project identifier (e.g. `proj_123456`) |
| `owner_id` | `string` | `ownerId` | Project owner ID (`user_ayush` in single-tenant dev mode) |
| `title` | `string` | `title` | Film title |
| `input` | `object` | `input` | `{ type: "script" | "story" | "audio", content: string, audio_url?: string, transcript?: string }` (raw user input preserved verbatim) |
| `preferences` | `object` | `preferences` | `{ duration_seconds: number (60-300), aspect_ratio: string, visual_style: string, language: string, voice: object, music: object, subtitles: boolean }` |
| `status` | `string` | `status` | `"draft" | "planning" | "generating" | "editing" | "completed" | "failed"` |
| `scenes` | `array` | `scenes` | Array of scene objects |
| `shots` | `array` | `shots` | Array of shot objects referencing `scene_id` |
| `characters` | `array` | `characters` | Character Bible profiles |
| `locations` | `array` | `locations` | Location Bible profiles |
| `timeline` | `object` | `timeline` | Final assembled timeline tracks |
| `master_video_url` | `string` (opt) | `masterVideoUrl` | Final rendered MP4 URL |
| `created_at` | `string` / `Date` | `createdAt` | ISO-8601 creation timestamp |
| `updated_at` | `string` / `Date` | `updatedAt` | ISO-8601 last update timestamp |
