import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface DirectorModePageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenDirectorChat: () => void;
}

export const DirectorModePage: React.FC<DirectorModePageProps> = ({
  project,
  onSelectTab,
  onOpenDirectorChat,
}) => {
  const [expandedScene, setExpandedScene] = useState<number | null>(1);

  const toggleScene = (sceneNum: number) => {
    setExpandedScene(expandedScene === sceneNum ? null : sceneNum);
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#F3E8FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E9D5FF',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                AI Director Mode
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                }}
              >
                ● Plan Formulated
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Autonomous narrative breakdown, character continuity anchoring, and scene planning.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDirectorChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#475569',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={14} color="#7C3AED" />
          <span>Consult Director</span>
        </button>
      </div>

      {/* Conversational Director Explanation Box */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7C3AED', marginTop: '6px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.6 }}>
            "I've analyzed your story premise and structured <strong>{project.title}</strong> as an intimate 2-minute Sci-Fi suspense short. The narrative arcs from claustrophobic student isolation toward cosmic revelation. To maximize cinematic tension within your ₹{project.budget} budget, I've divided production into 8 scenes, 24 shots, and selected 2 core character anchors."
          </p>
        </div>

        {/* Film Concept Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Genre & Tone</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Sci-Fi Thriller (Tense)</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Visual Style</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Dark Cinematic 35mm</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Pacing Ratio</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>24 Shots • 5.0s Avg</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Est. Production Cost</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>₹412 (Under Budget)</div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Stream: STORY -> SCENES -> SHOTS -> ASSETS -> FINAL FILM */}
      <div
        style={{
          backgroundColor: '#FAFAFA',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {[
          { label: 'STORY', sub: 'Input Premise', done: true },
          { label: 'SCENES', sub: '8 Narrative Blocks', done: true },
          { label: 'SHOTS', sub: '24 Camera Prompts', done: true },
          { label: 'ASSETS', sub: 'Voice, Stems, Stills', active: true },
          { label: 'FINAL FILM', sub: '1080p Timeline', done: false },
        ].map((node, i) => (
          <React.Fragment key={node.label}>
            {i > 0 && <span style={{ color: '#CBD5E1', fontSize: '14px' }}>↓</span>}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: node.active ? '#7C3AED' : node.done ? '#059669' : '#94A3B8',
                }}
              >
                {node.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{node.sub}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Scene Breakdown List */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Planned Scene Breakdown (8 Scenes)
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Total: 02:00 (120s)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {project.scenes.map((scene) => {
            const isExp = expandedScene === scene.sceneNumber;
            return (
              <div
                key={scene.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  onClick={() => toggleScene(scene.sceneNumber)}
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isExp ? '#F8FAFC' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {scene.sceneNumber}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        {scene.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                        {scene.slugline}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>{scene.duration}s • {scene.shots.length || 3} shots</span>
                    {isExp ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                  </div>
                </div>

                {isExp && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      <strong>Action Summary: </strong>{scene.description}
                    </p>

                    {scene.shots.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {scene.shots.map((shot) => (
                          <div
                            key={shot.id}
                            style={{
                              backgroundColor: '#FFFFFF',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontSize: '11px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                              <span>{shot.shotNumber} ({shot.type})</span>
                              <span style={{ color: '#D97706' }}>{shot.duration}s</span>
                            </div>
                            <div style={{ color: '#64748B' }}>{shot.actionDescription.slice(0, 75)}...</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Action Bar */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => onSelectTab('script')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Review Screenplay First
        </button>

        <button
          onClick={() => onSelectTab('storyboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(30, 41, 59, 0.2)',
          }}
        >
          <span>Start Production in Storyboard</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
