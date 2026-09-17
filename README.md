# 🎬 Agentic Film Studio
### *From idea to cinematic reality, autonomously.*

[![CI Pipeline](https://github.com/ayushraj/film-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushraj/film-studio/actions)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Gateway-Node.js_24_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/Agent_Engine-Python_3.13_+_FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Containers-Docker_Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 📌 Executive Summary

**Agentic Film Studio** is an autonomous, multi-agent virtual film production platform that transforms a raw text prompt, screenplay, or audio idea into a fully rendered, multi-scene cinematic short film.

> 💡 **Core Philosophy**:  
> *"AI models generate the content, but the AI Director decides HOW the film should be produced."*

Unlike basic text-to-video tools that suffer from severe character drift, uncontrolled compute costs, and monolithic regenerations, Agentic Film Studio treats filmmaking as a **collaborative multi-agent system** coordinated around a shared **Film Bible**, a **Production Intelligence Engine**, and a **Non-Linear Multi-Track Editor**.

---

## 🌟 Key Technical Innovations & USPs

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 USER PROMPT / AUDIO / SCRIPT             │
                  └─────────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
     ┌─────────────────────────────────────────────────────────────────────────────────────┐
     │                             AI DIRECTOR ORCHESTRATOR                                │
     │             [Plans]  ➔  [Generates]  ➔  [Validates]  ➔  [Corrects]  ➔  [Edits]      │
     └──────┬──────────────────────┬───────────────────────┬────────────────────────┬──────┘
            │                      │                       │                        │
            ▼                      ▼                       ▼                        ▼
     ┌──────────────┐       ┌──────────────┐        ┌──────────────┐         ┌──────────────┐
     │ Screenplay & │       │  Film Bible  │        │  Production  │         │ Single-Shot  │
     │ Storyboard   │       │ Consistency  │        │ Intelligence │         │ Repair Gate  │
     │  (24 Shots)  │       │ (Face Seeds) │        │ (65% Savings)│         │ (Targeted QA)│
     └──────────────┘       └──────────────┘        └──────────────┘         └──────────────┘
```

1. **Production Intelligence Engine (Cost & Compute Optimization)**:
   - High-motion action shots are tagged for full diffusion video (`[VIDEO]`).
   - Dialogue, emotional beats, and ambient shots are rendered as high-res keyframes with 2.5D parallax / camera pans (`[IMAGE + MOTION]`), reducing generation costs by **60% to 80%**.
   - Background plates and camera angles are reused (`[REUSE]`), and scenes are continued (`[EXTEND]`) to maximize continuity.
2. **Film Bible & Character Consistency**:
   - Maintains locked facial embeddings, visual seed tokens, costume descriptors, and world lore across scenes, solving the dreaded AI "character morphing" problem.
3. **Single-Shot Independent Repair (Failure Recovery)**:
   - If Shot 4 fails a quality check (e.g., facial drift or lighting glitch), **only Shot 4 is patched**. The other 23 shots remain untouched, eliminating wasted credits.
4. **Interactive Multi-Track Editor**:
   - 4 independent tracks: **Video**, **Dialogue**, **SFX**, and **Music Score** with a live scrubbing playhead and a 16:9 cinema preview window.
5. **Pluggable AI Provider Adapter Architecture**:
   - Abstract interfaces for LLM, STT, TTS, Image, and Video. Switch between Runway, OpenAI, ElevenLabs, Replicate, or local mock adapters without altering workflow logic.

---

## 👥 The 10 Virtual Production Agents

| # | Agent | Primary Role & Output |
|:--|:---|:---|
| 1 | **Director Agent** | Pacing analysis, tone constraints, scene transitions, and creative approval loops. |
| 2 | **Scriptwriter Agent** | Hollywood standard screenplay formatting (Scene Headings, Action Beats, Dialogue). |
| 3 | **Storyboard Agent** | Camera directives (Dolly, Pan, Zoom), lens focal lengths (24mm, 50mm, 85mm), and composition. |
| 4 | **Character & World Agent** | Film Bible management, facial embeddings, visual seed retention, and setting lore. |
| 5 | **Production Intelligence** | Analyzes shot dynamics to assign `[VIDEO]`, `[IMAGE + MOTION]`, `[REUSE]`, or `[EXTEND]`. |
| 6 | **Visual Generation Agent** | Multimodal dispatch to image/video adapters with LoRA weights and negative prompts. |
| 7 | **Voice / Speech Agent** | Emotional speech synthesis, character voice matching, cadence, and breath pacing. |
| 8 | **Sound / Foley Agent** | Diegetic sound effects synthesis (airlocks, footsteps, static) + ambient music scoring. |
| 9 | **Quality & Continuity Agent** | Automated CV audit of face coherence, lighting continuity, and artifact scoring. |
| 10 | **Editor Agent** | Assembly of approved takes onto the timeline, audio mixdown, and 1080p FFmpeg rendering. |

---

## 📽️ Featured Production: *"The Last Signal"*

Every installation includes the complete, pre-configured demo project:
- **Title**: *The Last Signal*
- **Genre**: Sci-Fi Psychological Thriller
- **Duration**: 2 Minutes (8 Scenes, 24 Planned Shots)
- **Protagonist**: Aarav — Solo Communications Engineer
- **Setting**: Kepler-452b Deep Space Relay Outpost
- **Budget Performance**:
  - *Unoptimized Video Cost*: **$18.50**
  - *Production Intelligence Cost*: **$6.40** (**65.4% Cost Reduction**)
  - *Continuity Score*: **94% Coherent** (3 minor warnings flagged for single-shot patch)

---

## 💻 Technology Stack Justification

| Layer | Technologies | Justification & Architectural Role |
|:---|:---|:---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons | High-performance interactive UI designed with a clean **Notion + Linear** aesthetic; real-time multi-track scrubber, zero runtime type errors. |
| **API Gateway** | Node.js 24, Express, Zod, JWT, Axios | Aligns with MERN stack OJT requirements; fast asynchronous I/O, user authentication, and strict Zod payload validation before hitting heavy AI agents. |
| **Agent Engine** | Python 3.13, FastAPI, LangGraph, Pydantic v2 | Industry-standard stack for multi-agent workflows, cyclic execution graphs, and Human-in-the-Loop interrupt/approval gates. |
| **Pluggable Adapters** | Python Abstract Base Classes (`abc`) | Future-proof abstraction isolating provider APIs (OpenAI, Runway, ElevenLabs) with deterministic local mocks for zero-cost testing. |
| **Persistence** | MongoDB Atlas, Atlas Vector Search | Flexible document schema for hierarchical tree data (`Project -> Scenes -> Shots -> Assets`); native vector search for Film Bible embeddings. |
| **Async Jobs** | Redis, Celery | Asynchronous task queue handling long-running video generation and rendering jobs without blocking HTTP threads. |
| **Media Pipeline** | FFmpeg | Professional multi-track audio-video muxing, color grading LUTs, trimming, and subtitle burn-in. |
| **Containers & CI** | Docker Compose, GitHub Actions | Multi-container reproducible development (`docker-compose up`) and automated 3-tier CI matrix testing. |

---

## 📂 Repository Structure

```
film-studio/
├── .github/
│   └── workflows/ci.yml         # 3-tier CI Matrix (Node, Python, Frontend)
├── docs/
│   ├── PRD.md                   # Product Requirements Document
│   ├── PROJECT_BOARD.md         # 4-Week Sprint Roadmap & Milestones
│   ├── SCOPE_GATE_WEEK1.md      # Week 1 Scope Gate Verification Checklist
│   ├── architecture/
│   │   └── ARCHITECTURE.md      # System topology & sequence diagrams
│   └── contracts/
│       ├── client-node-api.yaml # OpenAPI 3.1: React ↔ Node Gateway
│       └── node-agents-api.yaml # OpenAPI 3.1: Node Gateway ↔ FastAPI Agents
├── frontend/                    # Studio Dashboard & Timeline Editor (Port 5173)
│   ├── src/
│   │   ├── components/          # Topbar, Sidebar, CommandPalette, Modals
│   │   ├── pages/               # 10 core pages (Dashboard, Script, Storyboard, Timeline, etc.)
│   │   ├── data/mockData.ts     # Complete "The Last Signal" demo data
│   │   └── types/filmStudio.ts  # Shared domain contracts
├── backend-node/                # Product Gateway & Persistence Layer (Port 4000)
│   ├── src/
│   │   ├── controllers/         # Project CRUD & Agent Workflow proxy
│   │   ├── contracts/types.ts   # Zod validation schemas
│   │   └── server.ts            # Express server initialization
├── backend-agents/              # Python Multi-Agent AI Core (Port 8000)
│   ├── app/
│   │   ├── api/v1/              # Health & Workflow orchestration endpoints
│   │   ├── models/contracts.py  # Pydantic v2 data models
│   │   └── providers/           # Pluggable LLM, STT, TTS, Image, Video adapters
│   └── tests/                   # Pytest test suite (9/9 passed)
├── docker-compose.yml           # Unified orchestration for all microservices
└── README.md                    # Project documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: `v20.x` or `v24.x`
- **Python**: `3.11+` or `3.13+`
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/ayushraj/film-studio.git
cd film-studio
```

### 2. Option A: Run Services Locally (Development Mode)

#### Terminal 1 — Python Multi-Agent Engine:
```bash
cd backend-agents
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*Health endpoint: `http://localhost:8000/api/health`*

#### Terminal 2 — Node.js API Gateway:
```bash
cd backend-node
npm install
npm run build
node dist/server.js
```
*Health endpoint: `http://localhost:4000/api/health`*

#### Terminal 3 — React Studio Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Open in Browser: **[http://localhost:5173](http://localhost:5173)***

---

### 3. Option B: Run with Docker Compose
```bash
docker-compose up --build
```

---

## 🌐 Default Ports & Endpoints

| Service | Port / URL | Description |
|:---|:---|:---|
| **Studio Frontend** | `http://localhost:5173` | React 19 Light UI Studio Workspace |
| **Node API Gateway** | `http://localhost:4000` | Project CRUD & Workflow Gateway |
| **FastAPI Agent Core** | `http://localhost:8000` | Multi-Agent Orchestration & Interactive Swagger (`/docs`) |
| **MinIO S3 Storage** | `http://localhost:9001` | S3 Media Asset Bucket (`minioadmin` / `minioadmin`) |

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suite across all three tiers:

```bash
# 1. Run Python Agent & Provider Adapter Tests (9/9 passing)
cd backend-agents
pytest -v tests/

# 2. Run Node.js API Gateway Contract Validation Tests
cd ../backend-node
npm test

# 3. Verify Frontend TypeScript & Production Build
cd ../frontend
npm run build
```

---

## 🎓 Academic / OJT Project Details

- **Project Title**: Agentic Film Studio
- **Domain**: Generative AI / Agentic AI in Media & Creator Economy
- **Student**: Ayush Raj (251810700122)
- **Partner**: Puneet Seervi (251810700104)
- **Academic Year / Batch**: 2nd Year, Batch 3C
- **Project Core Philosophy**: *Plans ➔ Generates ➔ Validates ➔ Corrects ➔ Edits*

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
