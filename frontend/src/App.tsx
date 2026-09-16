import { useState } from 'react';
import { Clapperboard, Film, Sparkles, Cpu, Layers, Radio, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'contracts'>('overview');

  const pipelineStages = [
    { name: '1. Scriptwriter Agent', status: 'ready', desc: 'Narrative generation & Fountain scene parsing' },
    { name: '2. Storyboard Director', status: 'ready', desc: 'Shot composition, lens, camera angle prompts' },
    { name: '3. Continuity Supervisor', status: 'ready', desc: 'Face vector & character seed consistency' },
    { name: '4. Voice & Sound (TTS)', status: 'ready', desc: 'Character timbre synthesis & dialogue timing' },
    { name: '5. Shot Synthesis (Video)', status: 'ready', desc: 'Pluggable image keyframes & motion clips' },
    { name: '6. FFmpeg Timeline Engine', status: 'ready', desc: 'Multi-track timeline mixing & S3 export' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '24px', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#6366f1', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Clapperboard size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Film Studio</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Autonomous & Human-in-the-Loop AI Cinematic Engine</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #334155' }}>
          <Radio size={14} color="#10b981" />
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981' }}>Week 1 Scope Gate: Active</span>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['overview', 'pipeline', 'contracts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'capitalize',
              backgroundColor: activeTab === tab ? '#6366f1' : '#1e293b',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Film size={20} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Dual-Backend Architecture</h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              <strong>Node/Express:</strong> Serves as the high-throughput API gateway, project metadata manager, and client state orchestrator.<br />
              <strong>FastAPI + LangGraph:</strong> Orchestrates recursive agent decision graphs, vector continuity checks, and distributed async worker jobs.
            </p>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Pluggable Adapters</h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Abstract base interfaces for LLM, STT, TTS, Image, and Video synthesis. Zero vendor lock-in with out-of-the-box deterministic mock adapters for instant zero-cost development and CI.
            </p>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Cpu size={20} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Docker & CI Pipeline</h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Multi-service Compose configuration orchestrating MongoDB, Redis, MinIO/S3, Node API, FastAPI Agents, and Celery workers with automated GitHub Actions testing.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#818cf8" />
            Film Studio Agentic Pipeline Sequence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pipelineStages.map((stage, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0' }}>{stage.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stage.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 500 }}>
                  <CheckCircle2 size={16} />
                  <span>Adapter Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginTop: 0, marginBottom: '16px' }}>API Contracts Specification</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#a5b4fc', marginBottom: '8px' }}>React ↔ Node/Express</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                Specification: <code>docs/contracts/client-node-api.yaml</code><br />
                Enforces project CRUD, scene hierarchy, character consistency profiles, and rendering job progress polling.
              </p>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#a5b4fc', marginBottom: '8px' }}>Node/Express ↔ FastAPI/LangGraph</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                Specification: <code>docs/contracts/node-agents-api.yaml</code><br />
                Enforces workflow invocation payloads, interrupt/resume hooks for human-in-the-loop review, and agent graph state queries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
