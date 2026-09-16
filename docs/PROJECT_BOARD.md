# Film Studio — Engineering Project Board & Roadmap

This document serves as the single source of truth for sprint planning, task tracking, and milestone delivery.

---

## Sprint Board (Week 1 — Scope Gate Milestone)

### 📋 Columns: Backlog | Ready for Dev | In Progress | In Review | Done

| Task ID | Epic | Task Description | Assignee | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **W1-D1-01** | Core | Lock Revised PRD Scope (`docs/PRD.md`) | Product / Arch | P0 | **DONE** |
| **W1-D1-02** | Monorepo | Setup monorepo directories (`frontend/`, `backend-node/`, `backend-agents/`) | Lead Eng | P0 | **DONE** |
| **W1-D1-03** | Core | Initialize Project Board & Sprint Tracker (`docs/PROJECT_BOARD.md`) | Lead Eng | P1 | **DONE** |
| **W1-D2-01** | Contracts | Define React ↔ Node/Express API Contract (`docs/contracts/client-node-api.yaml`) | Backend Node | P0 | **DONE** |
| **W1-D2-02** | Contracts | Define Node/Express ↔ FastAPI/LangGraph API Contract (`docs/contracts/node-agents-api.yaml`) | AI Eng | P0 | **DONE** |
| **W1-D2-03** | Types | Implement shared Zod & TypeScript types in `backend-node` | Backend Node | P1 | **DONE** |
| **W1-D2-04** | Types | Implement matching Pydantic v2 schemas in `backend-agents` | AI Eng | P1 | **DONE** |
| **W1-D3-01** | Architecture | Draw system topology & pipeline sequence diagram in Mermaid | Arch / Lead | P0 | **DONE** |
| **W1-D3-02** | Architecture | Define Scene State Machine & Data Models (`docs/architecture/ARCHITECTURE.md`) | Arch / Lead | P0 | **DONE** |
| **W1-D4-01** | AI Adapters | Design `BaseLLMAdapter`, `BaseSTTAdapter`, `BaseTTSAdapter` | AI Eng | P0 | **DONE** |
| **W1-D4-02** | AI Adapters | Design `BaseImageAdapter`, `BaseVideoAdapter` | AI Eng | P0 | **DONE** |
| **W1-D4-03** | AI Adapters | Implement dynamic Provider Factory & Registry | AI Eng | P0 | **DONE** |
| **W1-D4-04** | AI Adapters | Implement deterministic Mock Adapters for all 5 modalities | AI Eng | P0 | **DONE** |
| **W1-D4-05** | Testing | Write unit test suite for adapters & mock providers (`tests/test_providers.py`) | QA / AI Eng | P0 | **DONE** |
| **W1-D5-01** | DevOps | Create multi-service `docker-compose.yml` (Mongo, Redis, MinIO, Node, FastAPI, Worker) | DevOps | P0 | **DONE** |
| **W1-D5-02** | DevOps | Create Dockerfiles for `backend-node`, `backend-agents`, and `frontend` | DevOps | P1 | **DONE** |
| **W1-D5-03** | DevOps | Create GitHub Actions CI workflow (`.github/workflows/ci.yml`) | DevOps | P0 | **DONE** |
| **W1-D5-04** | Scope Gate | Finalize Scope Gate Verification Checklist (`docs/SCOPE_GATE_WEEK1.md`) | Mentor / Lead | P0 | **DONE** |

---

## 4-Week Milestone Roadmap

### 🏁 Week 1: Foundation, Architecture, Provider Adapters, Monorepo & CI (CURRENT)
- Focus: System design, contracts, pluggable adapters, Docker skeleton, CI validation.
- Scope Gate Criteria: All contracts specified, mock adapters 100% test passing, Docker Compose ready, CI green.

### 🎬 Week 2: Screenplay Ingestion & Multi-Agent Storyboarding
- Focus: LangGraph Agent Graph implementation (Screenwriter Agent, Storyboard Director Agent, Prompt Engineer Agent).
- Deliverables: Fountain script parser, scene/shot graph state machine, prompt decomposition, storyboard frame generator.

### 🎭 Week 3: Continuity Engine & Multi-Modal Audio/Visual Generation
- Focus: Character face consistency (IP-Adapter / InsightFace / vector embeddings), voice design (ElevenLabs TTS), audio stem generation.
- Deliverables: Vector similarity checks, character sheet conditioning, dialogue timing alignment, B-roll image & video synthesis.

### 🎞️ Week 4: Timeline Editor, FFmpeg Composition & Cloud Export
- Focus: Celery FFmpeg rendering worker, timeline editing API, video stitching, audio crossfades, subtitles, S3 packaging.
- Deliverables: Full end-to-end rendering pipeline: Script → Storyboard → Voice → Video Clips → Final 1080p Cut exported to S3.
