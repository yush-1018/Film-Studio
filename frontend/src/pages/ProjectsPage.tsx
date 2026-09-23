import React, { useEffect, useState } from 'react';
import { Film, Plus, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { NavigationTab, Project } from '../types/filmStudio';

interface ProjectsPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectTab, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/v1/projects');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      setError('Could not connect to database. Ensure backend-node and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto', color: '#F1F1F4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Film Projects</h1>
          <p style={{ color: '#8E8E9F', margin: '6px 0 0 0', fontSize: '14px' }}>
            Autonomous agentic film productions. Real persistence via MongoDB.
          </p>
        </div>
        <button
          onClick={() => onSelectTab('create' as NavigationTab)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          }}
        >
          <Plus size={18} />
          Create New Film
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#8E8E9F' }}>
          <Sparkles className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: '#7C3AED' }} />
          <p>Querying MongoDB projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed #2A2A32',
          borderRadius: '16px',
          backgroundColor: '#121216',
        }}>
          <Film size={48} style={{ color: '#4A4A5A', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No projects created yet</h3>
          <p style={{ color: '#8E8E9F', fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px' }}>
            Zero seeded demo data exists. Create a real film project from your own story prompt or audio recording.
          </p>
          <button
            onClick={() => onSelectTab('create' as NavigationTab)}
            style={{
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start First Production
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {projects.map((proj) => {
            const durationSec = proj.preferences?.durationSeconds || 120;
            const minutes = Math.floor(durationSec / 60);
            const seconds = durationSec % 60;
            const durationFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  if (proj.status === 'completed') {
                    onSelectTab('viewer' as NavigationTab);
                  } else {
                    onSelectTab('production' as NavigationTab);
                  }
                }}
                style={{
                  backgroundColor: '#16161C',
                  border: '1px solid #262630',
                  borderRadius: '14px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#262630';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: proj.status === 'completed' ? '#064E3B' : '#312E81',
                    color: proj.status === 'completed' ? '#34D399' : '#A5B4FC',
                  }}>
                    {proj.status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8E8E9F', fontSize: '12px' }}>
                    <Clock size={13} />
                    {durationFormatted}
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#FFFFFF' }}>{proj.title}</h3>
                <p style={{
                  fontSize: '13px',
                  color: '#9E9EB2',
                  margin: '0 0 16px 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {proj.input?.storyPrompt || proj.input?.rawTextInput || proj.logline || 'Custom film project.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #22222A' }}>
                  <span style={{ fontSize: '12px', color: '#717182' }}>Genre: {proj.genre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7C3AED', fontSize: '13px', fontWeight: 600 }}>
                    {proj.status === 'completed' ? 'Watch Film' : 'Inspect Production'}
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
