import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Sliders,
  Plus,
  Edit3,
  X,
  Menu,
  Film,
  Camera,
  Layers,
  Loader2,
} from 'lucide-react';
import { Project } from '../types/filmStudio';

interface AgentPromptPanelProps {
  project: Project;
  isGenerating: boolean;
  activeStage?: string;
  generationProgress?: number;
  onGenerate: (prompt: string, genre: string, duration: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AgentPromptPanel: React.FC<AgentPromptPanelProps> = ({
  project,
  isGenerating,
  activeStage = 'Ready for neural synthesis',
  generationProgress = 100,
  onGenerate,
  isOpen,
  onToggleOpen,
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(project.genre || 'Sci-Fi');
  const [selectedDuration, setSelectedDuration] = useState(project.duration || '1 min');
  const [sessionTitle, setSessionTitle] = useState('Director Session');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const genres = ['Sci-Fi', 'Thriller', 'Horror', 'Action', 'Drama', 'Comedy'];
  const durations = ['1 min', '2 min', '5 min'];

  const suggestionCards = [
    {
      title: 'Generate Full Feature Cut',
      desc: `Continuous multi-act film (${selectedDuration}) with crossfades`,
      icon: Film,
      prompt: `Create a cinematic ${selectedGenre.toLowerCase()} film about an unexpected journey, high visual contrast, moody lighting.`,
    },
    {
      title: 'Synthesize Next Scene Take',
      desc: 'Part-by-part procedural camera choreography',
      icon: Camera,
      prompt: `A suspenseful close-up shot revealing a hidden signal in the darkness, anamorphic lens flare.`,
    },
    {
      title: 'Switch Mood & Atmosphere',
      desc: 'Re-encode lighting with high dynamic range',
      icon: Layers,
      prompt: `Shift tone to deep neon noir, heavy rain reflections on wet asphalt with police beacons.`,
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;
    const finalPrompt = promptText.trim() || project.logline || `Cinematic ${selectedGenre} scene`;
    onGenerate(finalPrompt, selectedGenre, selectedDuration);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        title="Open Agent Studio Panel"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '24px',
          zIndex: 40,
          backgroundColor: '#7C3AED',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '28px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.45)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Sparkles size={16} />
        <span>Agent Prompt Studio</span>
      </button>
    );
  }

  return (
    <aside
      style={{
        width: '380px',
        backgroundColor: '#121215',
        borderLeft: '1px solid #23232A',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 25,
        color: '#EDEDED',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Header matching Image 2 */}
      <div
        style={{
          height: '56px',
          borderBottom: '1px solid #1E1E24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Menu size={16} color="#9E9EA7" style={{ cursor: 'pointer' }} />
          {isEditingTitle ? (
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              style={{
                backgroundColor: '#1C1C22',
                border: '1px solid #33333E',
                borderRadius: '4px',
                color: '#FFFFFF',
                padding: '2px 8px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{ fontSize: '13px', fontWeight: 600, color: '#E1E1E6', cursor: 'pointer' }}
            >
              {sessionTitle}
            </span>
          )}
          <Edit3
            size={13}
            color="#71717A"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsEditingTitle(true)}
          />
        </div>

        <button
          onClick={onToggleOpen}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717A',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
          }}
          title="Collapse Panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Middle Scrollable Agent Assistant Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Welcome greeting */}
        <div>
          <div style={{ fontSize: '13px', color: '#9E9EA7', marginBottom: '4px' }}>
            Hi Ayush Raj
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            What would you like to create?
          </h2>
        </div>

        {/* Action suggestion cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {suggestionCards.map((card, i) => {
            const IconComponent = card.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  setPromptText(card.prompt);
                }}
                style={{
                  backgroundColor: '#18181D',
                  border: '1px solid #26262E',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#202026';
                  e.currentTarget.style.borderColor = '#383844';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#18181D';
                  e.currentTarget.style.borderColor = '#26262E';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#24242C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={18} color="#A78BFA" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F1F4' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#82828C', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {card.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Agent Telemetry Box */}
        <div
          style={{
            backgroundColor: '#15151A',
            border: '1px solid #23232C',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isGenerating ? '#F59E0B' : '#10B981',
                  boxShadow: isGenerating ? '0 0 8px #F59E0B' : '0 0 8px #10B981',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4D4D8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isGenerating ? 'AI Agents Active' : 'Director Standby'}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#71717A' }}>
              Local Veo Engine
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: '#A1A1AA', lineHeight: '1.4' }}>
            {activeStage}
          </div>

          {isGenerating && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  height: '4px',
                  backgroundColor: '#27272A',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${generationProgress}%`,
                    backgroundColor: '#8B5CF6',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Persistent Bottom Prompting Space matching Image 2 */}
      <div
        style={{
          borderTop: '1px solid #1E1E24',
          padding: '14px 16px 18px 16px',
          backgroundColor: '#121215',
        }}
      >
        {/* Genre & Duration Selector Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {/* Genre selector */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {genres.map((g) => {
              const active = selectedGenre === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: active ? '#8B5CF6' : '#27272A',
                    backgroundColor: active ? 'rgba(139, 92, 246, 0.2)' : '#18181D',
                    color: active ? '#DDD6FE' : '#9E9EA7',
                    fontSize: '11px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Duration selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', color: '#71717A', alignSelf: 'center', marginRight: '2px' }}>
              Runtime:
            </span>
            {durations.map((d) => {
              const active = selectedDuration === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDuration(d)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: active ? '#38BDF8' : '#27272A',
                    backgroundColor: active ? 'rgba(56, 189, 248, 0.18)' : '#18181D',
                    color: active ? '#BAE6FD' : '#9E9EA7',
                    fontSize: '10.5px',
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input Container matching Image 2 */}
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#18181D',
            border: '1px solid #2B2B36',
            borderRadius: '12px',
            padding: '10px 12px 8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="What do you want to create?"
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              lineHeight: '1.4',
              fontFamily: 'inherit',
            }}
          />

          {/* Bottom Actions Row: Attach (+), presets, send (->) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                title="Add reference asset / character"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#26262F',
                  border: 'none',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>

              <button
                type="button"
                title="Director camera settings"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717A',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <Sliders size={14} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isGenerating ? '#374151' : '#7C3AED',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: isGenerating ? 'none' : '0 2px 8px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.15s ease',
              }}
              title="Send prompt to Virtual Director"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        <div style={{ fontSize: '10px', color: '#52525B', textAlign: 'center', marginTop: '8px' }}>
          Film Studio Agents run locally on-device • Always ready for next prompt
        </div>
      </div>
    </aside>
  );
};
