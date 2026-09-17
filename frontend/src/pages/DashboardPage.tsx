import React from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Project, ProjectActivity, NavigationTab } from '../types/filmStudio';

interface DashboardPageProps {
  project: Project;
  activities: ProjectActivity[];
  onSelectTab: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  project,
  activities,
  onSelectTab,
}) => {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Good evening, Ayush
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Turn your next idea into a cinematic reality.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('new_project')}
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F172A')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid: Left = Recent Projects, Right = Production Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Recent Projects Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Recent Projects
            </h2>
            <button
              onClick={() => onSelectTab('storyboard')}
              style={{ background: 'transparent', border: 'none', color: '#D97706', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          {/* Project Card (The Last Signal) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
          >
            {/* Cinematic Hero Thumbnail */}
            <div
              style={{
                height: '180px',
                backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 100%), url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#34D399',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ● {project.status}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {project.genre} • {project.duration}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                {project.title}
              </h3>
            </div>

            {/* Card Content */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {project.logline}
              </p>

              {/* Progress bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Production Progress</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{project.progress}% complete</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${project.progress}%`,
                      height: '100%',
                      backgroundColor: '#D97706',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>

              {/* Card Footer info & continue button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                  <Clock size={13} />
                  <span>Last edited {project.lastEdited}</span>
                </div>

                <button
                  onClick={() => onSelectTab('storyboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FDE68A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF3C7')}
                >
                  <span>Continue Production</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Production Activity Stream */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={16} color="#475569" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Production Activity
            </h2>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor:
                        act.type === 'director'
                          ? '#F3E8FF'
                          : act.type === 'quality'
                          ? '#ECFDF5'
                          : '#FEF3C7',
                      color:
                        act.type === 'director'
                          ? '#7C3AED'
                          : act.type === 'quality'
                          ? '#059669'
                          : '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {act.type === 'quality' ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                      {act.action}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '8px' }}>
                      <span>{act.agent}</span>
                      <span>•</span>
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View full log trigger */}
            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '16px', paddingTop: '12px', textAlign: 'center' }}>
              <button
                onClick={() => onSelectTab('quality')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                View Quality Agent Audit →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
