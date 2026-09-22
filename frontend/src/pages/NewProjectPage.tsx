import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { NavigationTab } from '../types/filmStudio';
import { triggerWorkflow } from '../api/apiClient';

interface NewProjectPageProps {
  onStartPlanning: (data: {
    title: string;
    logline: string;
    genre: string;
    duration: string;
    style: string;
    budget: number;
    agentResult?: any;
  }) => void;
  onSelectTab?: (tab: NavigationTab) => void;
}

export const NewProjectPage: React.FC<NewProjectPageProps> = ({
  onStartPlanning,
}) => {
  const [title, setTitle] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [genre, setGenre] = useState('Sci-Fi');
  const [duration, setDuration] = useState('1 min');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const genres = ['Sci-Fi', 'Thriller', 'Drama', 'Horror', 'Romance', 'Comedy', 'Action'];
  const durations = ['1 min', '2 min', '5 min'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusBanner('Triggering Scriptwriter Agent...');

    const durationMap: Record<string, number> = {
      '1 min': 60,
      '2 min': 120,
      '5 min': 300,
    };
    const duration_seconds = durationMap[duration] || 60;

    try {
      const response = await triggerWorkflow({
        projectId: 'new', // arbitrary since it's a new project
        workflowType: 'script_ideation',
        parameters: {
          title: title,
          logline: storyPrompt,
          genre: genre,
          duration_seconds: duration_seconds,
        },
        interruptOnHumanApproval: false,
      });

      setStatusBanner('Agent generated script successfully!');
      
      onStartPlanning({
        title,
        logline: storyPrompt,
        genre,
        duration,
        style: 'Cinematic', // Default style
        budget: 50000, // Default budget
        agentResult: response?.result,
      });
      
    } catch (err) {
      console.error(err);
      setStatusBanner('Failed to generate script. Using fallback.');
      onStartPlanning({
        title,
        logline: storyPrompt,
        genre,
        duration,
        style: 'Cinematic',
        budget: 50000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          Create New Project
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px' }}>
          Describe your vision and our AI agents will handle the rest.
        </p>
      </div>

      {statusBanner && (
        <div
          style={{
            backgroundColor: isGenerating ? '#EFF6FF' : '#F3F4F6',
            border: isGenerating ? '1px solid #BFDBFE' : '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            color: isGenerating ? '#1E40AF' : '#475569',
            fontWeight: 500,
          }}
        >
          {isGenerating && <Loader2 size={16} className="animate-spin" />}
          <span>{statusBanner}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Film Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Last Signal"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Story Prompt / Logline
          </label>
          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="Describe your film idea..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '15px',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Genre
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: genre === g ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                  backgroundColor: genre === g ? '#F5F3FF' : '#FFFFFF',
                  color: genre === g ? '#6D28D9' : '#64748B',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Duration
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: duration === d ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                  backgroundColor: duration === d ? '#F5F3FF' : '#FFFFFF',
                  color: duration === d ? '#6D28D9' : '#64748B',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !storyPrompt}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '14px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: (isGenerating || !storyPrompt) ? 'not-allowed' : 'pointer',
            opacity: (isGenerating || !storyPrompt) ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating Screenplay...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Screenplay with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
