import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface StoryScriptPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
}

export const StoryScriptPage: React.FC<StoryScriptPageProps> = ({
  project,
  onSelectTab,
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);
  const [aiSuggestionApplied, setAiSuggestionApplied] = useState(false);
  const [scriptContent, setScriptContent] = useState(`SCENE 01
INT. HOSTEL ROOM – NIGHT

AARAV sits alone at his desk in the dim room.

The only illumination comes from his laptop screen, casting flickering shadows against the bookshelf. Rain taps softly against the glass.

Suddenly, an anomalous sine wave spikes across his terminal.

AARAV
(whispering to himself)
What is that...?

He leans in closer. The audio spectrum analyzer hums with a deep resonant harmonic.

AARAV
(continuing)
That’s not random noise. That’s an address.`);

  const activeScene = project.scenes[selectedSceneIndex] || project.scenes[0];

  const handleApplySuggestion = () => {
    setScriptContent((prev) =>
      prev.replace(
        'What is that...?',
        'What is that...? (he freezes, holding his breath as the audio glitch reverberates through his headphones for three tense seconds)'
      )
    );
    setAiSuggestionApplied(true);
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Screenplay & Narrative Breakdown
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Industry standard Fountain format with autonomous Script Agent continuity suggestions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => alert('Script Agent is re-analyzing narrative pacing for Scene ' + (selectedSceneIndex + 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Regenerate Scene</span>
          </button>

          <button
            onClick={() => onSelectTab('storyboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>Proceed to Storyboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Scene Navigation List */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
            Scenes (8 Total)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.scenes.map((scene, idx) => {
              const isSel = selectedSceneIndex === idx;
              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneIndex(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSel ? '#FEF3C7' : 'transparent',
                    border: isSel ? '1px solid #FDE68A' : '1px solid transparent',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSel ? '#92400E' : '#0F172A' }}>
                      Scene {scene.sceneNumber}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{scene.duration}s</span>
                  </div>
                  <div style={{ fontSize: '12px', color: isSel ? '#78350F' : '#475569', fontWeight: 500 }}>
                    {scene.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace', marginTop: '2px' }}>
                    {scene.slugline}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Screenplay Editor & AI Suggestion Panel */}
        <div>
          {/* AI Suggestion Banner */}
          {showAiSuggestion && (
            <div
              style={{
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#7C3AED" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#6D28D9' }}>Script Agent Suggestion</div>
                  <div style={{ fontSize: '13px', color: '#4C1D95' }}>
                    "Increase suspense by delaying the reveal: hold on Aarav’s reaction before deciphering the coordinates."
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {aiSuggestionApplied ? (
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>✓ Applied</span>
                ) : (
                  <>
                    <button
                      onClick={handleApplySuggestion}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#7C3AED',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={13} />
                      <span>Apply</span>
                    </button>
                    <button
                      onClick={() => setShowAiSuggestion(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Fountain Script Paper View */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              padding: '36px 44px',
            }}
          >
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                {activeScene.title} • {activeScene.duration} seconds
              </span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                ✓ Fountain Syntax Validated
              </span>
            </div>

            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              rows={16}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '14px',
                lineHeight: 1.8,
                color: '#1E293B',
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
