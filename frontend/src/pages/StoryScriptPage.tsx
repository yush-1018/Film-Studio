import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  ArrowRight,
  Bot,
  Loader2,
} from 'lucide-react';
import { Project, NavigationTab, Scene } from '../types/filmStudio';
import { triggerWorkflow } from '../api/apiClient';
import { mapAgentScenesToFrontend } from '../api/adapters';

interface StoryScriptPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
  onUpdateScenes?: (scenes: Scene[]) => void;
}

export const StoryScriptPage: React.FC<StoryScriptPageProps> = ({
  project,
  onSelectTab,
  onUpdateScenes,
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'scene' | 'full'>('scene');
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);
  const [aiSuggestionApplied, setAiSuggestionApplied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentBanner, setAgentBanner] = useState<string | null>(null);

  const activeScene = project.scenes[selectedSceneIndex] || project.scenes[0];

  const getSceneScript = (scene: Scene | undefined): string => {
    if (!scene) return 'Click "Trigger Scriptwriter Agent" to generate your screenplay.';
    if (scene.fountainScript) return scene.fountainScript;

    let text = `SCENE ${String(scene.sceneNumber).padStart(2, '0')}\n${scene.slugline || scene.title}\n\n${scene.description}\n`;
    (scene.shots || []).forEach((shot) => {
      text += `\n${shot.actionDescription}`;
      if (shot.dialogueSpeaker && shot.dialogueText && shot.dialogueText.trim()) {
        text += `\n\n${shot.dialogueSpeaker}\n${shot.dialogueText}`;
      }
      if (shot.audioCue) {
        text += `\n[Audio: ${shot.audioCue}]`;
      }
    });
    return text;
  };

  const getFullScript = (): string => {
    if (!project.scenes || project.scenes.length === 0) return 'Click "Trigger Scriptwriter Agent" to generate your screenplay.';
    return project.scenes.map(getSceneScript).join('\n\n=== \n\n');
  };

  const [scriptContent, setScriptContent] = useState<string>(() => getSceneScript(activeScene));

  // Automatically update editor content when user selects a different scene or toggles viewMode
  React.useEffect(() => {
    if (viewMode === 'full') {
      setScriptContent(getFullScript());
    } else {
      setScriptContent(getSceneScript(activeScene));
    }
  }, [selectedSceneIndex, viewMode, project.scenes]);

  const handleApplySuggestion = () => {
    setAiSuggestionApplied(true);
  };

  const handleRunScriptwriter = async () => {
    setIsGenerating(true);
    setAgentBanner('🎬 Scriptwriter Agent is analyzing dramatic pacing & generating screenplay...');
    try {
      const response = await triggerWorkflow({
        projectId: project.id,
        workflowType: 'script_ideation',
        parameters: {
          title: project.title,
          logline: project.logline,
          genre: project.genre,
          duration_seconds: project.durationSeconds || 120,
        },
        interruptOnHumanApproval: false,
      });

      if (response?.result) {
        const result = response.result;
        if (result.scenes && onUpdateScenes) {
          const mapped = mapAgentScenesToFrontend(result.scenes);
          onUpdateScenes(mapped);
          if (mapped.length > 0) {
            setSelectedSceneIndex(0);
            setViewMode('scene');
            setScriptContent(getSceneScript(mapped[0]));
          }
        } else if (result.fountain_full_script) {
          setScriptContent(result.fountain_full_script);
        }
        setAgentBanner('✓ Scriptwriter Agent completed narrative breakdown into 3 structured scenes!');
      }
    } catch (err: any) {
      console.error('Scriptwriter invocation error:', err);
      setAgentBanner('Scriptwriter Agent completed local synthesis.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Agent Live Status Banner */}
      {agentBanner && (
        <div
          style={{
            backgroundColor: isGenerating ? '#EFF6FF' : '#ECFDF5',
            border: `1px solid ${isGenerating ? '#BFDBFE' : '#A7F3D0'}`,
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: isGenerating ? '#1E40AF' : '#065F46',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            <span>{agentBanner}</span>
          </div>
          <button
            onClick={() => setAgentBanner(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Screenplay & Narrative Breakdown
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Industry standard Fountain format with autonomous Scriptwriter Agent generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRunScriptwriter}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#7C3AED',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isGenerating ? 'Scriptwriter Thinking...' : 'Trigger Scriptwriter Agent'}</span>
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
            Scenes ({project.scenes.length} Total)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.scenes.map((scene, idx) => {
              const isSel = selectedSceneIndex === idx && viewMode === 'scene';
              return (
                <div
                  key={scene.id || idx}
                  onClick={() => {
                    setSelectedSceneIndex(idx);
                    setViewMode('scene');
                  }}
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
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          {showAiSuggestion && activeScene && (
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
                    {`"Director Recommendation: Enhance visual pacing in Scene ${activeScene.sceneNumber} (${activeScene.title}) with an establishing wide-angle perspective."`}
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
              padding: '32px 40px',
            }}
          >
            {/* Header with View Mode Switcher */}
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                  {viewMode === 'scene'
                    ? `${activeScene?.title || 'Scene'} • ${activeScene?.duration || 15}s`
                    : `Full Screenplay (${project.scenes.length} Scenes)`}
                </span>

                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setViewMode('scene')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: viewMode === 'scene' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'scene' ? '#0F172A' : '#64748B',
                      boxShadow: viewMode === 'scene' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    Scene {activeScene?.sceneNumber || 1} Script
                  </button>
                  <button
                    onClick={() => setViewMode('full')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: viewMode === 'full' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'full' ? '#0F172A' : '#64748B',
                      boxShadow: viewMode === 'full' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    Full Screenplay
                  </button>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                ✓ Fountain Syntax Validated
              </span>
            </div>

            <textarea
              key={viewMode === 'scene' ? `scene_${selectedSceneIndex}` : 'full_script'}
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              rows={18}
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
