# Product Requirements Document (PRD) — AI Film Studio

**Version**: 1.0.0  
**Status**: Scope Locked (Week 1 Scope Gate)  
**Target Platform**: Web (Vite + React 19), Node.js (API Gateway), Python (Agent Engine & Video Pipeline)

---

## 1. Executive Summary & Product Vision

### 1.1 Vision
**Film Studio** is a unified, generative AI film and narrative video production platform. It empowers filmmakers, storytellers, content creators, and creative agencies to orchestrate end-to-end cinematic production—from raw conceptual ideas and scriptwriting to storyboarding, character continuity enforcement, multi-modal asset synthesis (audio, voiceover, shot video generation), timeline composition, and final video rendering.

### 1.2 Core Value Propositions
1. **Multi-Agent Narrative Collaboration**: Specialized autonomous agents (Scriptwriter, Storyboard Director, Cinematographer, Continuity Supervisor, Sound Designer, Editor) collaborate via LangGraph to convert ideas into cinematic sequences.
2. **Deterministic Character & Style Continuity**: Solves the fundamental generative AI challenge—facial, wardrobe, and aesthetic drift—through dedicated continuity vector embeddings and reference conditioning.
3. **Hybrid Orchestration**: Node/Express serves as a robust API gateway, state repository, and collaboration layer; FastAPI + LangGraph drives deep multi-agent reasoning and distributed Redis/Celery tasks.
4. **Pluggable Provider Architecture**: Zero vendor lock-in. Switch seamlessly between OpenAI, Anthropic, ElevenLabs, Runway, Luma, Kling, Flux, or local open-source models via standardized adapters.

---

## 2. Target Personas & Use Cases

| Persona | Key Need | Primary User Journey |
| :--- | :--- | :--- |
| **Indie Filmmaker / Director** | Rapid pre-visualization, concept trailers, pitch decks | Types premise -> Generates script -> Reviews storyboard -> Tweaks camera angles -> Renders trailer |
| **Commercial / Ad Agency Creator** | Fast iterative storyboards & multiple creative variations | Feeds brand brief -> Generates 3 storyboard concepts -> Synthesizes voiceovers -> Assembles cut |
| **Screenwriter / Narrative Designer** | Transforming prose or screenplays into visual scenes | Imports Fountain screenplay -> Breaks into scenes & shots -> Validates pacing with rough audio cuts |
| **YouTuber / Video Essayist** | Automated voiceover, B-roll generation, and auto-captioning | Inputs essay outline -> Generates multi-scene B-roll with soundscapes -> Renders with FFmpeg |

---

## 3. Scope Gate Breakdown (Milestones)

### 3.1 Week 1 Scope (Current Milestone — Foundation & Contracts)
- [x] Locked Revised PRD & Monorepo directory structure (`frontend/`, `backend-node/`, `backend-agents/`).
- [x] Project Backlog & Kanban roadmap (`docs/PROJECT_BOARD.md`).
- [x] OpenAPI 3.1 API Contracts:
  - React ↔ Node/Express API Gateway.
  - Node/Express ↔ FastAPI/LangGraph Agent Service.
- [x] TypeScript & Pydantic shared contract definitions.
- [x] Comprehensive Architecture Diagram (React → Node → FastAPI → Agents → Redis/Celery → Continuity → Editor/FFmpeg → S3).
- [x] Pluggable AI Provider Adapter Interface (Base abstractions & deterministic mock providers for LLM, STT, TTS, Image, Video).
- [x] Docker Compose skeleton (MongoDB, Redis, MinIO/S3, Node, Python, Worker).
- [x] GitHub Actions CI workflow for both backends and frontend.
- [x] Mentor checkup & Scope Gate checklist.

### 3.2 Non-Goals for Week 1 (Scheduled for Weeks 2–4)
- **Week 2**: Full LangGraph Multi-Agent Script & Storyboard graph implementation, prompt engineering templates, Fountain parser.
- **Week 3**: Continuity Engine (Face vector embedding, IP-Adapter reference caching, multi-angle character sheets).
- **Week 4**: Celery FFmpeg rendering worker, timeline track mixing, audio sync, S3 export, and full web timeline UI.

---

## 4. Functional Requirements

### 4.1 Project & Script Management
- **FR-01 (Projects)**: Users can create, clone, archive, and delete film projects with custom aspect ratios (`16:9`, `9:16`, `2.39:1` anamorphic) and aesthetic styles (e.g., *Cyberpunk Noir*, *Cinematic 35mm*, *Anime 4K*).
- **FR-02 (Screenplay Generation & Ingestion)**: Support both AI-generated scripts (via Screenwriter Agent) and manual screenplay editing adhering to standard Fountain/industry formatting.
- **FR-03 (Scene Breakdown)**: Automatic breakdown of script into structured Scenes, Shots, Dialogue lines, Characters, and Audio Cues.

### 4.2 Character & Continuity Management
- **FR-04 (Character Profiles)**: Define characters with names, backstories, voice archetypes, and visual reference seed sheets.
- **FR-05 (Continuity State Tracking)**: The Continuity Supervisor agent verifies that character visual embeddings and environmental cues persist across shots.

### 4.3 Multi-Modal Synthesis Pipeline
- **FR-06 (Pluggable Provider Selection)**: Project-level or global configuration to switch providers per modality (LLM, STT, TTS, Image, Video).
- **FR-07 (Speech Synthesis - TTS)**: Synthesize dialogue lines with character-specific voice profiles, emotional tone, and timing tags.
- **FR-08 (Shot Generation)**: Generate shot keyframes (Image adapter) and motion clips (Video adapter) using director camera prompt directives (e.g., `dolly zoom`, `low-angle tracking`).

### 4.4 Timeline Editing & Rendering
- **FR-09 (Timeline Model)**: Multi-track timeline supporting video tracks, dialogue voice tracks, sound effects (SFX) tracks, and background score (BGM) tracks.
- **FR-10 (FFmpeg Composition)**: Headless rendering worker executes timeline composition, transitions (cut, dissolve, fade), and exports MP4/WebM to S3/MinIO.

---

## 5. Non-Functional Requirements (NFR)

- **NFR-01 (Modularity & Extensibility)**: AI providers must adhere to the abstract base adapter pattern; adding a new model provider must require only implementing the base interface without altering agent graph logic.
- **NFR-02 (Deterministic Testing & CI)**: All pipeline components must be fully testable offline using deterministic mock adapters without requiring real API keys or GPUs.
- **NFR-03 (Fault Tolerance & Resumability)**: Agent workflows in LangGraph must support checkpointing (via Redis/Postgres) so long-running pipelines can be paused, inspected, or resumed upon human feedback.
- **NFR-04 (Security & Secrets)**: No API keys stored in source code. Environment variables loaded via strict Pydantic and dotenv validation.
- **NFR-05 (Cross-Platform Compatibility)**: All containers and development configurations must run consistently on Linux, macOS, and Windows (WSL2/Docker).

---

## 6. Success Metrics & Scope Gate Criteria

1. **Monorepo Hygiene**: Clean workspaces with unified linting, type-checking, and test scripts.
2. **Contract Compliance**: Exact synchronization between React frontend requests, Node gateway routes, and FastAPI agent payloads.
3. **Adapter Completeness**: 100% test coverage for the Provider Adapter interfaces and mock implementations.
4. **CI Passing**: GitHub Actions pipeline passes cleanly across Node and Python jobs.
