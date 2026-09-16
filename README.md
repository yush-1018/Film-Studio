# 🎬 AI Film Studio

> **Autonomous & Human-in-the-Loop Multi-Agent Film and Narrative Video Production Platform.**

[![CI Workflow](https://github.com/organization/film-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/organization/film-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Overview

**Film Studio** orchestrates the entire lifecycle of generative cinematic production:
- **Idea to Screenplay**: AI narrative ideation & Fountain screenplay parsing.
- **Storyboard Director**: Shot-by-shot composition and camera directing.
- **Continuity Engine**: Vector-based character face, wardrobe, and aesthetic consistency.
- **Multi-Modal Synthesis**: Pluggable adapters for text, voice (TTS), keyframes, and video motion clips.
- **Timeline Editor & FFmpeg**: Multi-track audio/video mixing and S3-based rendering.

---

## 🏗️ Monorepo Architecture

```
film-studio/
├── .github/workflows/ci.yml       # GitHub Actions CI matrix
├── docs/
│   ├── PRD.md                     # Locked Product Requirements Document
│   ├── PROJECT_BOARD.md           # Agile Kanban Board & 4-Week Roadmap
│   ├── SCOPE_GATE_WEEK1.md        # Week 1 Scope Gate Verification
│   ├── architecture/
│   │   └── ARCHITECTURE.md        # Pipeline diagrams, state machines, topologies
│   └── contracts/
│       ├── client-node-api.yaml   # OpenAPI 3.1: React ↔ Node/Express
│       └── node-agents-api.yaml   # OpenAPI 3.1: Node ↔ FastAPI/LangGraph
├── frontend/                      # Vite + React 19 + TypeScript Studio UI
├── backend-node/                  # Express + TypeScript API Gateway & Persistence
├── backend-agents/                # FastAPI + LangGraph Multi-Agent Orchestrator
├── docker-compose.yml             # Local microservices orchestration
└── package.json                   # Monorepo scripts
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v20+` or `v24+`
- Python `3.11+`
- Docker & Docker Compose (Optional for local containerized stack)

### 1. Clone & Configure
```bash
# Copy root environment variables
cp .env.example .env
```

### 2. Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- **Frontend Studio UI**: `http://localhost:5173`
- **Node API Gateway**: `http://localhost:4000`
- **FastAPI Agent Engine**: `http://localhost:8000/docs`
- **MinIO S3 Console**: `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`)

### 3. Local Development (Without Docker)
```bash
# Run Node Gateway
cd backend-node
npm install
npm run dev

# Run FastAPI Agent Engine
cd ../backend-agents
python -m venv .venv
# activate virtual environment:
# Windows: .venv\Scripts\activate | Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Run Frontend UI
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testing

```bash
# Run backend-node tests & typechecking
npm run test:node

# Run backend-agents provider adapter tests
npm run test:agents
```

---

## 📜 Milestone Deliverables (Week 1 Scope Gate)
For detailed acceptance criteria and validation, see [docs/SCOPE_GATE_WEEK1.md](docs/SCOPE_GATE_WEEK1.md).
