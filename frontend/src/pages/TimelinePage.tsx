import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface TimelinePageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  project,
  onSelectTab,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAutoEditBanner, setShowAutoEditBanner] = useState(false);
  const [firstCutAccepted, setFirstCutAccepted] = useState(false);

  const totalDuration = 15; // 15s preview for scene 1
  const playheadInterval = useRef<number | null>(null);

  const sceneShots = project.scenes[0].shots;

  useEffect(() => {
    if (isPlaying) {
      playheadInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(prev + 0.1, totalDuration);
        });
      }, 100);
    } else {
      if (playheadInterval.current) clearInterval(playheadInterval.current);
    }
    return () => {
      if (playheadInterval.current) clearInterval(playheadInterval.current);
    };
  }, [isPlaying]);

  // Find active shot
  let accum = 0;
  let activeShot = sceneShots[0];
  for (const s of sceneShots) {
    if (currentTime >= accum && currentTime <= accum + s.duration) {
      activeShot = s;
      break;
    }
    accum += s.duration;
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    const frames = Math.floor((secs % 1) * 24);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Timeline Editor & Cinema Player
            </h1>
            {firstCutAccepted && (
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                ✓ First Cut Approved
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Multi-track timeline assembled by the Editor Agent with automated dialogue and music pacing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAutoEditBanner(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F5F3FF',
              color: '#6D28D9',
              border: '1px solid #DDD6FE',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} color="#7C3AED" />
            <span>AI Auto Edit (First Cut)</span>
          </button>

          <button
            onClick={() => onSelectTab('render')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>Proceed to Render</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Auto Edit Announcement Card */}
      {showAutoEditBanner && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', padding: '6px', borderRadius: '6px' }}>
              <Scissors size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                AI Editor created a First Cut
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Pacing analyzed: cross-faded Scene 1 dialogue stems, synchronized atmospheric synthpad swells to Shot 1.2 reveal.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Preview Cut
            </button>
            <button
              onClick={() => {
                setFirstCutAccepted(true);
                setShowAutoEditBanner(false);
              }}
              style={{
                backgroundColor: '#059669',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              Accept First Cut
            </button>
          </div>
        </div>
      )}

      {/* Cinema Monitor View */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            height: '340px',
            backgroundColor: '#000000',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          }}
        >
          {/* Real video playback when playing or if shot has videoUrl */}
          {isPlaying ? (
            <video
              src={activeShot.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4'}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%), url('${activeShot.thumbnailUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* Cinema Overlay Container */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            {/* Cinema Top Letterbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#FCD34D', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                SCENE 1 • {activeShot.shotNumber}
              </span>
              <span style={{ color: '#F8FAFC', fontSize: '11px', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                {isPlaying ? '▶ PLAYING (24 FPS • 1080p)' : 'PAUSED • 1080p'}
              </span>
            </div>

            {/* Subtitle / Dialogue overlay */}
            <div style={{ textAlign: 'center' }}>
              {activeShot.dialogueText && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#FEF08A', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', display: 'inline-block', border: '1px solid rgba(254, 240, 138, 0.2)' }}>
                  <strong>{activeShot.dialogueSpeaker}: </strong>"{activeShot.dialogueText}"
                </div>
              )}
            </div>

            {/* Bottom HUD info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', color: '#CBD5E1', fontFamily: 'monospace', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              <span>CAM: {activeShot.cameraDirective.slice(0, 45)}...</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#38BDF8' }}>
                TC: {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>


        {/* Player Transport Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <button
            onClick={() => setCurrentTime(0)}
            style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
          </button>
          <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: '#0F172A', width: '90px' }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multi-Track Timeline
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Total 15.0s (Scene 1 Cuts)
          </span>
        </div>

        {/* Time ruler */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px', fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
          <div style={{ flex: 1 }}>00:00:00</div>
          <div style={{ flex: 1 }}>00:03:00</div>
          <div style={{ flex: 1 }}>00:06:00</div>
          <div style={{ flex: 1 }}>00:09:00</div>
          <div style={{ flex: 1 }}>00:12:00</div>
          <div style={{ flex: 1 }}>00:15:00</div>
        </div>

        {/* Track 1: VIDEO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '80px', fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>VIDEO 1</div>
          <div style={{ flex: 1, height: '42px', display: 'flex', gap: '3px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            {sceneShots.map((shot, i) => (
              <div
                key={shot.id}
                onClick={() => setCurrentTime(sceneShots.slice(0, i).reduce((a, b) => a + b.duration, 0))}
                style={{
                  flex: shot.duration,
                  backgroundColor: '#1E293B',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#F8FAFC',
                  cursor: 'pointer',
                  border: activeShot.id === shot.id ? '2px solid #F59E0B' : '1px solid #334155',
                }}
              >
                {shot.shotNumber} ({shot.duration}s)
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: DIALOGUE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '80px', fontSize: '11px', fontWeight: 700, color: '#D97706' }}>DIALOGUE</div>
          <div style={{ flex: 1, height: '32px', display: 'flex', gap: '3px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ flex: 4, backgroundColor: '#F1F5F9', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#94A3B8' }}>
              [Silence]
            </div>
            <div style={{ flex: 4, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#92400E', fontWeight: 600 }}>
              Aarav: "What is that...?"
            </div>
            <div style={{ flex: 4, backgroundColor: '#F1F5F9', borderRadius: '4px' }} />
            <div style={{ flex: 3, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', color: '#92400E', fontWeight: 600 }}>
              Aarav: "That’s an address."
            </div>
          </div>
        </div>

        {/* Track 3: MUSIC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '80px', fontSize: '11px', fontWeight: 700, color: '#7C3AED' }}>MUSIC</div>
          <div style={{ flex: 1, height: '28px', backgroundColor: '#F3E8FF', border: '1px solid #E9D5FF', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '10px', color: '#6B21A8', fontWeight: 600 }}>
            Analog Tension Pad Theme (Stereo 48kHz)
          </div>
        </div>

        {/* Track 4: SFX */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '80px', fontSize: '11px', fontWeight: 700, color: '#059669' }}>SFX</div>
          <div style={{ flex: 1, height: '26px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontSize: '10px', color: '#065F46' }}>
            Rain Foley + 440Hz Sine Wave Chirp
          </div>
        </div>
      </div>
    </div>
  );
};
