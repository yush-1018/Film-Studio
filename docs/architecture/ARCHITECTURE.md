# System Architecture & Technical Specification — Film Studio

**Status**: Baseline Complete (Week 1 Scope Gate)  
**Pipeline**: React → Node/Express → FastAPI/LangGraph → Agents → Redis/Celery → Continuity Engine → Editor/FFmpeg → S3

---

## 1. System Topology Overview

The Film Studio platform utilizes a distributed, decoupled multi-service architecture designed to isolate fast interactive API operations from compute-heavy, non-deterministic generative AI and rendering tasks.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client / Presentation Layer"]
        WebUI["React 19 / Vite Web App<br/>(Studio Dashboard, Screenplay, Timeline)"]
    end

    subgraph GatewayLayer ["API Gateway & State Layer (Node.js)"]
        NodeGateway["Node/Express API Gateway<br/>(Auth, Project Metadata, State Sync)"]
        MongoDB[(MongoDB 7.0<br/>Projects, Scenes, Characters)]
    end

    subgraph AgentLayer ["Agent Reasoning Layer (Python / FastAPI)"]
        FastAPIService["FastAPI Agent Orchestrator"]
        LangGraph["LangGraph StateGraph Engine<br/>(Checkpoints, State Machines)"]
        
        subgraph SubAgents ["Specialized Sub-Agents"]
            ScriptAgent["Screenwriter Agent"]
            DirectorAgent["Storyboard Director"]
            ContinuityAgent["Continuity Supervisor"]
            SoundAgent["Audio/TTS Designer"]
        end
    end

    subgraph TaskLayer ["Distributed Execution & Asynchronous Tasks"]
        RedisQueue[(Redis 7.0<br/>Broker, Cache, Checkpoint Store)]
        CeleryWorkers["Celery Worker Fleet<br/>(Job Workers)"]
    end

    subgraph MediaAndContinuityLayer ["Media & Continuity Engines"]
        ContinuityEngine["Continuity Engine<br/>(Face Embeddings & Visual Seed Conditioning)"]
        FFmpegWorker["Editor / FFmpeg Composition Engine<br/>(Audio Mixing, Video Stitching)"]
        Adapters["Pluggable AI Provider Adapters<br/>(LLM, STT, TTS, Image, Video)"]
    end

    subgraph StorageLayer ["Object Storage Layer"]
        S3Storage[("MinIO / AWS S3<br/>Keyframes, Audio Stems, Final Cuts")]
    end

    %% Flow Connections
    WebUI <-->|HTTP REST / SSE Events| NodeGateway
    NodeGateway <-->|Read / Write Metadata| MongoDB
    NodeGateway -->|HTTP POST Workflows| FastAPIService
    FastAPIService --> LangGraph
    LangGraph --> SubAgents
    SubAgents --> Adapters
    SubAgents -->|Enqueue Heavy Tasks| RedisQueue
    RedisQueue --> CeleryWorkers
    CeleryWorkers --> ContinuityEngine
    CeleryWorkers --> FFmpegWorker
    ContinuityEngine --> Adapters
    FFmpegWorker -->|Upload Artifacts| S3Storage
    Adapters -->|Download/Upload Media| S3Storage
    FastAPIService -.->|State Checkpoints| RedisQueue
```

---

## 2. End-to-End Generation Sequence Diagram

This sequence traces the complete path of a project from user prompt to final rendered MP4 in S3.

```mermaid
sequenceDiagram
    autonumber
    actor User as Filmmaker (React UI)
    participant Gateway as Node/Express Gateway
    participant DB as MongoDB
    participant AgentSvc as FastAPI / LangGraph
    participant Provider as AI Provider Adapters
    participant Queue as Redis / Celery
    participant Continuity as Continuity Engine
    participant FFmpeg as Editor / FFmpeg Worker
    participant S3 as S3 / MinIO Storage

    User->>Gateway: Create Project & Input Prompt/Screenplay
    Gateway->>DB: Save Project Record (Status: DRAFT)
    User->>Gateway: Click "Generate Storyboard & Shots"
    Gateway->>AgentSvc: POST /api/v1/workflows/trigger
    AgentSvc->>Provider: LLM: Generate Scene Breakdown & Directives
    Provider-->>AgentSvc: Parsed Scenes, Shots, & Dialogue lines
    AgentSvc-->>Gateway: Return WorkflowRun (Status: WAITING_FOR_APPROVAL)
    Gateway-->>User: Display Generated Storyboard for Review

    Note over User,Gateway: Human-in-the-Loop Review Gate
    User->>Gateway: Approve Storyboard with Notes
    Gateway->>AgentSvc: POST /api/v1/workflows/{id}/resume

    AgentSvc->>Queue: Enqueue Asset Generation Tasks
    Queue->>Continuity: Verify Character Consistency Embeddings
    Continuity->>Provider: Synthesize Keyframes (Image Adapter with Face Seed)
    Provider-->>Continuity: Rendered Keyframe URLs
    Continuity->>S3: Cache Verified Character Anchor Frames

    Queue->>Provider: Synthesize Dialogue Audio (TTS Adapter)
    Provider-->>Queue: Audio Stem Bytes
    Queue->>S3: Upload Dialogue WAV/MP3

    Queue->>Provider: Synthesize Motion Clip (Video Adapter with Init Image)
    Provider-->>Queue: Shot Video MP4 URL
    Queue->>S3: Upload Video Clip

    Queue->>FFmpeg: Dispatch Stitching & Mixing Job
    FFmpeg->>S3: Download Video Clips & Audio Stems
    FFmpeg->>FFmpeg: Concat Clips, Mix Audio Tracks, Apply Crossfades
    FFmpeg->>S3: Upload Final Master Video (master_cut_1080p.mp4)
    FFmpeg-->>Gateway: Notify Job Completed Webhook
    Gateway->>DB: Update Project Status (COMPLETED)
    Gateway-->>User: Push Notification / SSE: Movie Ready to Watch
```

---

## 3. Scene & Shot State Machine

Each scene and shot follows a deterministic lifecycle:

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Project Created
    DRAFT --> SCRIPT_GENERATING: Trigger Script Agent
    SCRIPT_GENERATING --> SCRIPT_REVIEW: Script Generated
    SCRIPT_REVIEW --> SCRIPT_GENERATING: User Edits / Regenerate
    SCRIPT_REVIEW --> STORYBOARD_GENERATING: Approved
    
    STORYBOARD_GENERATING --> CONTINUITY_CHECK: Keyframes Generated
    CONTINUITY_CHECK --> CONTINUITY_FAILED: Face Drift Detected
    CONTINUITY_FAILED --> STORYBOARD_GENERATING: Inpainting Regeneration
    CONTINUITY_CHECK --> ASSET_SYNTHESIS: Face Consistency Passed

    state ASSET_SYNTHESIS {
        [*] --> TTS_SYNTHESIZING
        [*] --> VIDEO_SYNTHESIZING
        TTS_SYNTHESIZING --> AUDIO_READY
        VIDEO_SYNTHESIZING --> VIDEO_READY
        AUDIO_READY --> ASSETS_READY
        VIDEO_READY --> ASSETS_READY
    }

    ASSET_SYNTHESIS --> TIMELINE_RENDERING: All Shot Stems Ready
    TIMELINE_RENDERING --> COMPLETED: FFmpeg Composition Uploaded
    TIMELINE_RENDERING --> RENDER_FAILED: Composition Error
    RENDER_FAILED --> TIMELINE_RENDERING: Retry with Fallback Codec
    COMPLETED --> [*]
```

---

## 4. Storage & Persistence Layout

### 4.1 MongoDB (Documents & Relational Trees)
- `projects`: Metadata, aspect ratio, visual aesthetic style, creator reference.
- `characters`: Character voice profile IDs, prompt conditioning keywords, facial embedding vector references.
- `scenes`: Scene order, screenplay sluglines, narrative descriptions.
- `shots`: Camera prompts, audio dialogue transcript, stem references, duration.

### 4.2 Redis 7.0 (Fast In-Memory & Queues)
- **Celery Broker & Result Backend**: Task queues `generation_queue`, `render_queue`, `priority_queue`.
- **LangGraph Checkpoint Store**: Serialized memory state enabling pause and resume workflows upon human review.
- **Pub/Sub**: Live progress broadcasting to Node gateway WebSocket listeners.

### 4.3 MinIO / Amazon S3 (Binary Media Objects)
```
s3://film-studio-assets/
├── projects/
│   └── {projectId}/
│       ├── characters/
│       │   └── {characterId}/
│       │       ├── reference_seed_01.png
│       │       └── face_embedding.bin
│       ├── scenes/
│       │   └── scene_{sceneNum}/
│       │       ├── shot_{shotNum}_keyframe.png
│       │       ├── shot_{shotNum}_motion.mp4
│       │       └── shot_{shotNum}_dialogue.wav
│       └── exports/
│           ├── timeline_master_{timestamp}.mp4
│           └── storyboard_preview.pdf
```

---

## 5. Failure Recovery, Idempotency & Resiliency

1. **Deterministic Mock Fallback**: In non-GPU environments or when third-party provider rates are exceeded, services gracefully fallback to deterministic mock adapters for local iteration.
2. **Idempotent Celery Tasks**: Every task has a unique task hash composed of `(shot_id, prompt_hash, seed)`. If already present in S3, duplicate generation is skipped.
3. **LangGraph State Checkpointing**: Long-running multi-agent debates and revisions do not lose state upon container restarts.
