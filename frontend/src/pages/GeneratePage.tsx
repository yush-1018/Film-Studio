import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  XCircle,
  Clock,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface GeneratePageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
}

export const GeneratePage: React.FC<GeneratePageProps> = ({
  project,
  onSelectTab,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeProgress, setActiveProgress] = useState(74);

  // Smooth progress increment simulation
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveProgress((prev) => {
        if (prev >= 100) return 74; // loop demo progress
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Autonomous Generation Queue
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
              ● 1 Job Active
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Dispatching neural render jobs across pluggable providers for <strong>{project.title}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => alert('Generation job cancelled.')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FECACA',
              color: '#DC2626',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <XCircle size={14} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Active Highlighting Card: Shot 3.2 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', backgroundColor: '#F1F5F9', padding: '3px 10px', borderRadius: '4px' }}>
              Shot 3.2
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Generating video motion (Volumetric flashlight beam through mist)
            </span>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {Math.max(1, Math.round((100 - activeProgress) * 0.8))}s remaining
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
          <div
            style={{
              width: `${activeProgress}%`,
              height: '100%',
              backgroundColor: '#D97706',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Status specs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={14} color="#7C3AED" />
            <span>Model: <strong style={{ color: '#0F172A' }}>Google Veo 3</strong></span>
            <span>•</span>
            <span>Resolution: <strong style={{ color: '#0F172A' }}>1080p (24 fps)</strong></span>
          </div>
          <span style={{ fontWeight: 700, color: '#D97706', fontSize: '13px' }}>
            {activeProgress}%
          </span>
        </div>
      </div>

      {/* Scene by Scene Queue Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Generation Pipeline Queue
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { scene: 'Scene 1: The Ordinary Night', status: 'completed', badge: '✓ Complete', time: '15s • 4 shots', cost: '₹50' },
            { scene: 'Scene 2: The Mysterious Message', status: 'completed', badge: '✓ Complete', time: '15s • 3 shots', cost: '₹44' },
            { scene: 'Scene 3: The Journey Begins', status: 'generating', badge: 'Generating Shot 3.2 (74%)', time: '20s • 2 shots', cost: '₹32' },
            { scene: 'Scene 4: The Abandoned Facility', status: 'waiting', badge: 'Waiting in queue', time: '20s • 3 shots', cost: '₹48' },
            { scene: 'Scene 5: The Discovery', status: 'waiting', badge: 'Waiting in queue', time: '15s • 3 shots', cost: '₹38' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: idx < 4 ? '1px solid #F1F5F9' : 'none',
                backgroundColor: item.status === 'generating' ? '#FEFCE8' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor:
                      item.status === 'completed'
                        ? '#ECFDF5'
                        : item.status === 'generating'
                        ? '#FEF3C7'
                        : '#F1F5F9',
                    color:
                      item.status === 'completed'
                        ? '#059669'
                        : item.status === 'generating'
                        ? '#D97706'
                        : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {item.status === 'completed' ? '✓' : idx + 1}
                </span>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {item.scene}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {item.time} • Est: {item.cost}
                  </div>
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor:
                      item.status === 'completed'
                        ? '#ECFDF5'
                        : item.status === 'generating'
                        ? '#FEF3C7'
                        : '#F1F5F9',
                    color:
                      item.status === 'completed'
                        ? '#059669'
                        : item.status === 'generating'
                        ? '#92400E'
                        : '#64748B',
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onSelectTab('quality')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>Run Quality & Continuity Checks</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
