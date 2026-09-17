import React, { useState } from 'react';
import {
  Music,
  Mic,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface AudioPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AudioPage: React.FC<AudioPageProps> = ({
  project,
  onSelectTab,
}) => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const toggleTrack = (id: string) => {
    setPlayingTrack(playingTrack === id ? null : id);
  };

  const tracks = [
    {
      id: 'dialogue',
      name: 'Dialogue Track (ElevenLabs Voice TTS)',
      type: 'voice',
      clip: 'AARAV: "What is that...?" (48kHz Mono)',
      speaker: 'Aarav (Adam Voice Profile)',
      duration: '00:04',
      status: 'Ready',
    },
    {
      id: 'music',
      name: 'Original Cinematic Score',
      type: 'music',
      clip: 'Nocturnal Resonance Theme (Analog Synthpad, Tension Sub-Bass)',
      speaker: 'Sound Agent Generated',
      duration: '02:00',
      status: 'Ready',
    },
    {
      id: 'sfx',
      name: 'Foley & Sound Effects',
      type: 'sfx',
      clip: 'Sinusoidal Glitch Pulse (440Hz) + Casio Watch Beep',
      speaker: 'Sound Agent Decision: Shot 1.2',
      duration: '00:03',
      status: 'Ready',
    },
    {
      id: 'ambience',
      name: 'Environmental Ambience',
      type: 'ambience',
      clip: 'Hostel Room Rain Tap on Glass + Low Frequency Fluorescent Ballast Hum',
      speaker: 'Stereo Soundscape',
      duration: '02:00',
      status: 'Ready',
    },
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Audio, Voice & Sound Agent
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #FDE68A' }}>
              4 Stems Synced
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            The Sound Agent orchestrates dialogue timbre, Foley placement, and harmonic score for <strong>{project.title}</strong>.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onSelectTab('timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>Timeline</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => alert('Generating dialogue voice stems with ElevenLabs...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Mic size={14} color="#7C3AED" />
            <span>Generate Voice</span>
          </button>

          <button
            onClick={() => alert('Synthesizing cinematic music themes...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Music size={14} color="#D97706" />
            <span>Generate Music</span>
          </button>

          <button
            onClick={() => alert('Auto-syncing sound stems to storyboard cuts...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>Auto Sync</span>
          </button>
        </div>
      </div>

      {/* Sound Agent Decision Card */}
      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '4px' }}>
          Sound Agent Intelligence • Scene 1 Foley Plan
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
          "In Shot 1.2, placing an abrupt high-frequency sine tone (440Hz) when the waveform appears, followed by room reverb dampening to accentuate Aarav's whispered dialogue."
        </p>
      </div>

      {/* Audio Stems List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tracks.map((track) => {
          const isPlay = playingTrack === track.id;
          return (
            <div
              key={track.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <button
                  onClick={() => toggleTrack(track.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isPlay ? '#D97706' : '#F1F5F9',
                    color: isPlay ? '#FFFFFF' : '#1E293B',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {isPlay ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                </button>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {track.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {track.clip} • <span style={{ color: '#059669', fontWeight: 600 }}>{track.speaker}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Waveform Visualizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px', marginRight: '24px' }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = Math.sin(i * 0.5) * 10 + 12;
                  return (
                    <div
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h}px`,
                        backgroundColor: isPlay ? '#D97706' : '#CBD5E1',
                        borderRadius: '2px',
                        transition: 'height 0.2s',
                      }}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748B' }}>{track.duration}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ {track.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
