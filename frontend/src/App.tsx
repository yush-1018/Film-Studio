import { useState, useEffect, useRef } from 'react';
import {
  Clapperboard,
  Film,
  Play,
  Pause,
  RotateCcw,
  Layers,
  User,
  Sliders,
  Volume2,
  Tv,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Camera
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  role: string;
  voice: string;
  faceSeed: string;
  matchScore: number;
}

interface ShotItem {
  id: number;
  shotNumber: number;
  camera: string;
  action: string;
  speaker?: string;
  dialogue?: string;
  duration: number;
  bgGradient: string;
  status: 'pending' | 'synthesizing' | 'ready';
  thumbnailText: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'completed' | 'in_progress' | 'waiting_approval' | 'idle';
  detail: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'screenplay' | 'storyboard' | 'timeline' | 'agents'>('screenplay');
  const [projectTitle] = useState('Neon Horizon: The Memory Courier');
  const [logline] = useState(
    'In rain-soaked Neo-Tokyo, an ex-detective transports an unauthorized neural backup while being hunted by cyber-enforcers.'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '2.39:1' | '9:16'>('2.39:1');
  const [visualStyle] = useState('Cyberpunk Noir (35mm Anamorphic)');

  // Simulation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const playheadInterval = useRef<NodeJS.Timeout | null>(null);

  // Characters
  const [characters] = useState<Character[]>([
    { id: 'c1', name: 'Ren Tanaka', role: 'Memory Courier (Protagonist)', voice: 'ElevenLabs: Adam (Deep, Gritty)', faceSeed: 'SEED-8492-REN', matchScore: 99.2 },
    { id: 'c2', name: 'Commander Vex', role: 'Arasaka Strike Unit Lead', voice: 'ElevenLabs: Rachel (Cold, Authoritative)', faceSeed: 'SEED-3301-VEX', matchScore: 98.6 },
    { id: 'c3', name: 'Maya', role: 'Synthetic Android Contact', voice: 'ElevenLabs: Bella (Melancholic)', faceSeed: 'SEED-1190-MAYA', matchScore: 97.8 },
  ]);

  // Shots
  const [shots] = useState<ShotItem[]>([
    {
      id: 1,
      shotNumber: 1,
      camera: 'Extreme Wide Shot — Slow Crane Down, 24mm f/2.8',
      action: 'Neon skyscrapers bleed crimson light into rain-drenched streets. Fog coils around high-voltage cables.',
      duration: 4.5,
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #431407 100%)',
      status: 'ready',
      thumbnailText: 'EXT. NEO-TOKYO - ROOFTOP',
    },
    {
      id: 2,
      shotNumber: 2,
      camera: 'Medium Close-Up — Tracking Low Angle, 50mm Anamorphic',
      action: 'Ren Tanaka tightens his cybernetic coat. Rain drips from his metallic collar. His augmented optic glows amber.',
      speaker: 'REN',
      dialogue: 'Three minutes until the neural lock decrypts. Keep moving.',
      duration: 3.5,
      bgGradient: 'linear-gradient(135deg, #18181b 0%, #2e1065 60%, #064e3b 100%)',
      status: 'ready',
      thumbnailText: 'REN - OPTIC GLOW',
    },
    {
      id: 3,
      shotNumber: 3,
      camera: 'Dutch Angle — Dolly Zoom (Vertigo Effect), 35mm',
      action: 'Down the alley, sirens flash cerulean blue. Two heavy assault drones drop from the ceiling grate, searchlights pivoting.',
      speaker: 'COMMANDER VEX (V.O.)',
      dialogue: 'Grid locked down. Eliminate the courier on sight.',
      duration: 4.0,
      bgGradient: 'linear-gradient(135deg, #030712 0%, #172554 50%, #7f1d1d 100%)',
      status: 'ready',
      thumbnailText: 'ASSAULT DRONES DROP',
    },
    {
      id: 4,
      shotNumber: 4,
      camera: 'Macro Tight Close-Up — Rack Focus from Gun Barrel to Eyes',
      action: 'Ren draws the kinetic pistol. The chamber clicks into firing mode as his reflection shimmers in a puddle.',
      speaker: 'REN',
      dialogue: 'Not tonight.',
      duration: 3.0,
      bgGradient: 'linear-gradient(135deg, #111827 0%, #312e81 60%, #450a0a 100%)',
      status: 'ready',
      thumbnailText: 'KINETIC DRAW',
    },
  ]);

  const totalTimelineDuration = shots.reduce((acc, s) => acc + s.duration, 0);

  // Multi-Agent Pipeline Status
  const [pipelineSteps, setPipelineSteps] = useState<WorkflowStep[]>([
    { id: 'w1', name: 'Script Breakdown', agent: 'Screenwriter Agent', status: 'completed', detail: 'Fountain parsed: 4 scenes, 12 shots, 3 dialogue cues' },
    { id: 'w2', name: 'Cinematography Directives', agent: 'Storyboard Director', status: 'completed', detail: 'Camera lenses & motion prompts synthesized' },
    { id: 'w3', name: 'Continuity Verification', agent: 'Continuity Supervisor', status: 'completed', detail: 'Character face vectors verified (>97% identity retention)' },
    { id: 'w4', name: 'Multi-Modal Generation', agent: 'TTS & Video Adapters', status: 'completed', detail: 'Dialogue audio stems & video motion keyframes rendered' },
    { id: 'w5', name: 'FFmpeg Stitching & Master', agent: 'Editor Engine', status: 'waiting_approval', detail: 'Final 1080p anamorphic timeline ready for human sign-off' },
  ]);

  // Timeline playback simulation
  useEffect(() => {
    if (isPlaying) {
      playheadInterval.current = setInterval(() => {
        setPlayheadTime((prev) => {
          if (prev >= totalTimelineDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(prev + 0.1, totalTimelineDuration);
        });
      }, 100);
    } else {
      if (playheadInterval.current) clearInterval(playheadInterval.current);
    }
    return () => {
      if (playheadInterval.current) clearInterval(playheadInterval.current);
    };
  }, [isPlaying, totalTimelineDuration]);

  // Find active shot during playback
  let accumulatedTime = 0;
  let currentActiveShot = shots[0];
  for (const s of shots) {
    if (playheadTime >= accumulatedTime && playheadTime <= accumulatedTime + s.duration) {
      currentActiveShot = s;
      break;
    }
    accumulatedTime += s.duration;
  }

  // Trigger agent pipeline simulation
  const handleRegenerate = async () => {
    setIsGenerating(true);
    setPipelineSteps((prev) =>
      prev.map((step) => ({ ...step, status: step.id === 'w1' ? 'in_progress' : 'idle' }))
    );

    // Call Node gateway if online, otherwise simulate smoothly
    try {
      await fetch('/api/v1/projects/workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'proj_demo',
          workflowType: 'script_to_storyboard',
          parameters: { style: visualStyle, aspectRatio },
        }),
      });
    } catch {
      // Offline fallback handled gracefully
    }

    setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx <= 1 ? 'completed' : idx === 2 ? 'in_progress' : 'idle',
        }))
      );
    }, 1000);

    setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx <= 3 ? 'completed' : 'waiting_approval',
        }))
      );
      setIsGenerating(false);
    }, 2200);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const frames = Math.floor((secs % 1) * 24);
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0b1120', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#6366f1', padding: '9px', borderRadius: '10px', display: 'flex', boxShadow: '0 0 15px rgba(99,102,241,0.5)' }}>
            <Clapperboard size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>Film Studio</h1>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#a5b4fc', border: '1px solid #334155' }}>
                Prototype v1.0
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Autonomous & Human-in-the-Loop Multi-Agent Cinema Engine</p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', backgroundColor: '#022c22', padding: '5px 10px', borderRadius: '6px', border: '1px solid #065f46' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            Node API: 4000
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', backgroundColor: '#082f49', padding: '5px 10px', borderRadius: '6px', border: '1px solid #0369a1' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8', display: 'inline-block' }}></span>
            FastAPI Agents: 8000
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isGenerating ? '#475569' : '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
          >
            <RefreshCw size={15} className={isGenerating ? 'spin-animation' : ''} />
            {isGenerating ? 'Agents Orchestrating...' : 'Trigger Agent Pipeline'}
          </button>
        </div>
      </header>

      {/* Main Studio Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
        <nav style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'screenplay', label: '1. Screenplay & Characters', icon: Film },
            { id: 'storyboard', label: '2. Storyboard & Camera', icon: Camera },
            { id: 'timeline', label: '3. Timeline Editor & Player', icon: Tv },
            { id: 'agents', label: '4. LangGraph Agent Pipeline', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isSel ? '2px solid #6366f1' : '2px solid transparent',
                  color: isSel ? '#ffffff' : '#94a3b8',
                  fontWeight: isSel ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} color={isSel ? '#818cf8' : '#64748b'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Framing Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
          <span>Aspect Ratio:</span>
          {(['16:9', '2.39:1', '9:16'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid #334155',
                backgroundColor: aspectRatio === ratio ? '#6366f1' : '#1e293b',
                color: aspectRatio === ratio ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {/* TAB 1: SCREENPLAY & CHARACTERS */}
        {activeTab === 'screenplay' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Left: Screenplay Editor */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={18} color="#818cf8" />
                  Scene 1 — Screenplay (Fountain Format)
                </h2>
                <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Screenwriter Agent Approved
                </span>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1', marginBottom: '16px', borderLeft: '3px solid #6366f1' }}>
                <span style={{ fontWeight: 600, color: '#a5b4fc' }}>Premise / Logline: </span>
                {logline}
              </div>

              {/* Fountain Screenplay Presentation */}
              <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '24px', fontFamily: 'Courier New, monospace', fontSize: '14px', lineHeight: 1.7, color: '#e2e8f0' }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '12px' }}>
                  EXT. NEO-TOKYO ROOFTOPS - NIGHT
                </div>
                <p style={{ margin: '0 0 16px 0', color: '#cbd5e1' }}>
                  A deluge of rain cascades across obsidian chrome and holographic kanji signs.
                  Fog gathers thick around the cooling towers. Down in the narrow alley below,
                  blue emergency lights sweep the puddles.
                </p>
                <div style={{ textAlign: 'center', fontWeight: 700, color: '#f59e0b', marginTop: '16px' }}>
                  REN
                </div>
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                  (adjusting cybernetic optical collar)
                </div>
                <div style={{ maxWidth: '480px', margin: '0 auto 16px auto', textAlign: 'center' }}>
                  Three minutes until the neural lock decrypts. Keep moving.
                </div>
                <p style={{ margin: '0 0 16px 0', color: '#cbd5e1' }}>
                  A low resonant hum shakes the grating. Two Arasaka heavy surveillance drones
                  pierce the clouds, illuminating Ren in harsh cobalt searchlights.
                </p>
                <div style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444', marginTop: '16px' }}>
                  COMMANDER VEX (V.O.)
                </div>
                <div style={{ maxWidth: '480px', margin: '0 auto 16px auto', textAlign: 'center' }}>
                  Grid locked down. Eliminate the courier on sight.
                </div>
              </div>
            </div>

            {/* Right: Character Consistency Profiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#38bdf8" />
                  Character Continuity Anchors
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {characters.map((char) => (
                    <div key={char.id} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>{char.name}</span>
                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>{char.matchScore}% vector match</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{char.role}</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Volume2 size={12} color="#818cf8" />
                        {char.voice}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '10px', backgroundColor: '#0f172a', padding: '3px 6px', borderRadius: '4px', color: '#64748b' }}>
                        Embedding: <code>{char.faceSeed}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Aesthetic Preset Card */}
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={16} color="#f59e0b" />
                  Aesthetic Conditioning
                </h3>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                  <strong>Style:</strong> {visualStyle}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Prompt conditioning attaches volumetric rain lighting, high-contrast anamorphic streaks, and 35mm film grain to all image & video generation prompts.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORYBOARD & CAMERA */}
        {activeTab === 'storyboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Storyboard Keyframes & Director Directives</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Generated by Storyboard Director Agent with camera focal lengths, movement directives, and dialogue timing.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('timeline')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Send to Timeline Editor <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {shots.map((shot) => (
                <div
                  key={shot.id}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Aspect Ratio Box with Visual Representation */}
                  <div
                    style={{
                      height: aspectRatio === '2.39:1' ? '170px' : aspectRatio === '16:9' ? '200px' : '280px',
                      background: shot.bgGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                        {shot.thumbnailText}
                      </div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                        Shot #{shot.shotNumber} — {shot.duration}s
                      </div>
                    </div>
                    <span style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                      Mock Adapter: Ready
                    </span>
                  </div>

                  {/* Shot Directive Details */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={14} />
                        {shot.camera}
                      </div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {shot.action}
                      </p>
                      {shot.dialogue && (
                        <div style={{ backgroundColor: '#020617', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #f59e0b', fontSize: '12px', color: '#e2e8f0', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '11px' }}>{shot.speaker}: </span>
                          "{shot.dialogue}"
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Duration: {shot.duration}s</span>
                      <button
                        onClick={() => {
                          alert(`Regenerating shot #${shot.shotNumber} with mock Image & Video adapter...`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'transparent',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          color: '#cbd5e1',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TIMELINE & PLAYER */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Cinema Player Preview */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '780px',
                  height: aspectRatio === '2.39:1' ? '320px' : aspectRatio === '16:9' ? '400px' : '520px',
                  background: currentActiveShot.bgGradient,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Cinema Letterbox bars if 2.39:1 */}
                {aspectRatio === '2.39:1' && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '24px', backgroundColor: '#000000' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px', backgroundColor: '#000000' }}></div>
                  </>
                )}

                <div style={{ textAlign: 'center', padding: '20px', zIndex: 2 }}>
                  <div style={{ fontSize: '13px', color: '#38bdf8', letterSpacing: '2px', fontWeight: 700, marginBottom: '6px' }}>
                    {currentActiveShot.thumbnailText}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                    Shot #{currentActiveShot.shotNumber}
                  </div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '480px', lineHeight: 1.5 }}>
                    {currentActiveShot.action}
                  </div>
                  {currentActiveShot.dialogue && (
                    <div style={{ marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', color: '#fef08a', display: 'inline-block' }}>
                      <strong>{currentActiveShot.speaker}:</strong> "{currentActiveShot.dialogue}"
                    </div>
                  )}
                </div>

                {/* Subtitle / Camera Overlay */}
                <div style={{ position: 'absolute', bottom: 30, left: 20, fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                  CAM: {currentActiveShot.camera}
                </div>
                <div style={{ position: 'absolute', bottom: 30, right: 20, fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                  TC: {formatTime(playheadTime)} / {formatTime(totalTimelineDuration)}
                </div>
              </div>

              {/* Player Controls Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <button
                  onClick={() => setPlayheadTime(0)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(99,102,241,0.5)',
                  }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                </button>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#f8fafc', width: '120px' }}>
                  {formatTime(playheadTime)}
                </div>
              </div>
            </div>

            {/* Multi-Track Timeline */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="#818cf8" />
                  Multi-Track Composition (FFmpeg Timeline)
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total: {totalTimelineDuration}s (24 fps)</span>
              </div>

              {/* Time Ruler */}
              <div style={{ height: '20px', display: 'flex', borderBottom: '1px solid #334155', marginBottom: '8px', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ flex: 1 }}>00:0{i * 3}:00</div>
                ))}
              </div>

              {/* Track 1: Video */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '80px', fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>VIDEO 1</div>
                <div style={{ flex: 1, height: '44px', display: 'flex', gap: '3px', backgroundColor: '#020617', padding: '3px', borderRadius: '6px' }}>
                  {shots.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setPlayheadTime(shots.slice(0, s.id - 1).reduce((a, b) => a + b.duration, 0))}
                      style={{
                        flex: s.duration,
                        background: s.bgGradient,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#f8fafc',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: currentActiveShot.id === s.id ? '2px solid #38bdf8' : '1px solid #334155',
                      }}
                    >
                      Shot {s.shotNumber} ({s.duration}s)
                    </div>
                  ))}
                </div>
              </div>

              {/* Track 2: Dialogue Audio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '80px', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>VOICE (TTS)</div>
                <div style={{ flex: 1, height: '32px', display: 'flex', gap: '3px', backgroundColor: '#020617', padding: '3px', borderRadius: '6px' }}>
                  <div style={{ flex: 4.5, background: '#1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#64748b' }}>
                    [Atmosphere Silence]
                  </div>
                  <div style={{ flex: 3.5, background: '#78350f', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#fef08a' }}>
                    Ren: "Three minutes..."
                  </div>
                  <div style={{ flex: 4.0, background: '#7f1d1d', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#fecaca' }}>
                    Vex: "Grid locked down..."
                  </div>
                  <div style={{ flex: 3.0, background: '#78350f', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#fef08a' }}>
                    Ren: "Not tonight."
                  </div>
                </div>
              </div>

              {/* Track 3: Ambience & Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>SCORE / SFX</div>
                <div style={{ flex: 1, height: '28px', backgroundColor: '#064e3b', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '10px', color: '#a7f3d0' }}>
                  Cyberpunk Dystopia Synthpad (48kHz Stereo) + Rain & Siren Foley
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AGENTS & LANGGRAPH STATE */}
        {activeTab === 'agents' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>LangGraph Execution State Inspector</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Real-time visualization of recursive agent execution graph, memory checkpoints, and human approval interrupts.
                </p>
              </div>
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#022c22', color: '#34d399', border: '1px solid #065f46', fontWeight: 600 }}>
                Checkpoint: Redis State Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pipelineSteps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isWait = step.status === 'waiting_approval';
                const isRunning = step.status === 'in_progress';

                return (
                  <div
                    key={step.id}
                    style={{
                      backgroundColor: isWait ? '#1e1b4b' : '#1e293b',
                      border: isWait ? '1px solid #6366f1' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#065f46' : isWait ? '#4338ca' : '#0f172a',
                          color: isDone ? '#34d399' : isWait ? '#a5b4fc' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {step.name}
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>({step.agent})</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{step.detail}</div>
                      </div>
                    </div>

                    <div>
                      {isDone && (
                        <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <CheckCircle2 size={15} /> Checkpoint Saved
                        </span>
                      )}
                      {isRunning && (
                        <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <RefreshCw size={15} className="spin-animation" /> Processing...
                        </span>
                      )}
                      {isWait && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                            Human-in-the-Loop Gate
                          </span>
                          <button
                            onClick={() => {
                              alert('Sign-off received! FFmpeg render job dispatched to Celery.');
                              setPipelineSteps((prev) =>
                                prev.map((s) => (s.id === 'w5' ? { ...s, status: 'completed', detail: 'Master 1080p video uploaded to S3: s3://film-studio-assets/master_cut_1080p.mp4' } : s))
                              );
                            }}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Approve & Render Cut
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer style={{ borderTop: '1px solid #1e293b', backgroundColor: '#0b1120', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Active Project: <strong>{projectTitle}</strong></span>
          <span>•</span>
          <span>Target Style: <strong>{visualStyle}</strong></span>
          <span>•</span>
          <span>Framing: <strong>{aspectRatio}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>AI Adapters: Mock / Pluggable</span>
          <span>•</span>
          <span style={{ color: '#10b981' }}>Week 1 Scope Gate: Ready for Review</span>
        </div>
      </footer>
    </div>
  );
}
