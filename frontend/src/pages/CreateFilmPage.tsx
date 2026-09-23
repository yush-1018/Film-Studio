import React, { useState } from 'react';
import { Sparkles, Mic, FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { NavigationTab, Project } from '../types/filmStudio';

interface CreateFilmPageProps {
  onStartPlanning: (data: {
    title: string;
    logline: string;
    genre: string;
    duration: string;
    style: string;
    budget: number;
    projectDoc?: Project;
  }) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const CreateFilmPage: React.FC<CreateFilmPageProps> = ({ onStartPlanning, onSelectTab }) => {
  const [inputType, setInputType] = useState<'text' | 'audio'>('text');
  const [title, setTitle] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [audioTranscript, setAudioTranscript] = useState('');
  const [genre, setGenre] = useState('Sci-Fi');
  const [durationSeconds, setDurationSeconds] = useState(120); // 60 to 300
  const [visualStyle, setVisualStyle] = useState('cinematic_35mm');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GENRES = ['Sci-Fi', 'Thriller', 'Horror', 'Romance', 'Comedy', 'Drama', 'Action'];
  const STYLES = [
    { id: 'cinematic_35mm', label: 'Cinematic 35mm' },
    { id: 'cyberpunk_noir', label: 'Cyberpunk Noir' },
    { id: 'anime_4k', label: 'Anime 4K' },
    { id: 'documentary_realism', label: 'Documentary Realism' },
  ];

  const handleSimulateAudioUpload = () => {
    // Canonical Test C Audio Simulator
    const sampleSpokenStory =
      "A young astronomer tracking deep space cosmic rays detects an anomalous signal pattern originating from inside an abandoned arctic weather station.";
    setAudioTranscript(sampleSpokenStory);
    if (!title) setTitle("The Arctic Signal");
  };

  const handleCreate = async () => {
    setError(null);
    const content = inputType === 'audio' ? audioTranscript : storyPrompt;

    if (!title.trim()) {
      setError("Please enter a film title (Rule #16: no silent defaults).");
      return;
    }
    if (!content.trim()) {
      setError("Please provide story content or record audio (Rule #16: no silent defaults).");
      return;
    }
    if (durationSeconds < 60 || durationSeconds > 300) {
      setError("Duration must be strictly between 60s (1 min) and 300s (5 min).");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create project in MongoDB
      const createRes = await fetch('http://localhost:4000/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          logline: content.trim(),
          genre,
          visualStyle,
          input: {
            type: inputType === 'audio' ? 'audio' : 'story',
            content: content.trim(),
            transcript: inputType === 'audio' ? audioTranscript : undefined,
          },
          preferences: {
            durationSeconds,
            visualStyle,
            language: 'en',
            voice: { enabled: true, gender: 'neutral', tone: 'cinematic narrator' },
            music: { enabled: true },
            subtitles: false,
          },
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.message || createJson.error || 'Failed to create project in database.');
      }

      const projectDoc: Project = createJson.data;

      // 2. Trigger asynchronous background generation workflow
      const triggerRes = await fetch('http://localhost:4000/api/v1/projects/' + projectDoc.id + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectDoc.id,
          workflowType: 'full_pipeline',
          parameters: {
            title: title.trim(),
            content: content.trim(),
            logline: content.trim(),
            genre,
            duration_seconds: durationSeconds,
            cost_budget: 15.00,
          },
        }),
      });

      const triggerJson = await triggerRes.json();
      if (!triggerRes.ok || !triggerJson.success) {
        throw new Error(triggerJson.message || triggerJson.error || 'Failed to trigger agent workflow.');
      }

      // 3. Navigate to Production screen
      onStartPlanning({
        title: title.trim(),
        logline: content.trim(),
        genre,
        duration: `${durationSeconds}s`,
        style: visualStyle,
        budget: 15.00,
        projectDoc,
      });
      onSelectTab('production' as NavigationTab);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const formattedDuration = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '840px', margin: '0 auto', color: '#F1F1F4' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Create Film Production
        </h1>
        <p style={{ color: '#8E8E9F', margin: 0, fontSize: '14px' }}>
          Input your story or spoken audio. All downstream shots and video elements will be traceably derived from this content.
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: '#2E1212', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', marginBottom: '24px', fontSize: '14px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Input Mode Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#16161C', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid #262630' }}>
        <button
          onClick={() => setInputType('text')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: inputType === 'text' ? '#7C3AED' : 'transparent',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FileText size={16} />
          Text Screenplay / Story
        </button>
        <button
          onClick={() => setInputType('audio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: inputType === 'audio' ? '#7C3AED' : 'transparent',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Mic size={16} />
          Spoken Story Audio (Test C)
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#C8C8D4', marginBottom: '8px' }}>
          Film Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Last Signal"
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#16161C',
            border: '1px solid #262630',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Story Prompt or Audio Input */}
      {inputType === 'text' ? (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#C8C8D4', marginBottom: '8px' }}>
            Story Prompt / Narrative Ground Truth *
          </label>
          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            rows={5}
            placeholder="Describe your story beats in detail. Mention characters, locations, key events (e.g. Alex discovers an unknown signal on his computer, traces it to an abandoned railway station, uncovers a hidden device from the future)..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#16161C',
              border: '1px solid #262630',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '14px',
              lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: '24px', backgroundColor: '#16161C', border: '1px solid #262630', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Audio Transcription Pipeline</span>
            <button
              onClick={handleSimulateAudioUpload}
              style={{
                backgroundColor: '#262634',
                color: '#A5B4FC',
                border: '1px solid #3B3B4F',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Simulate Spoken Story Upload
            </button>
          </div>
          <textarea
            value={audioTranscript}
            onChange={(e) => setAudioTranscript(e.target.value)}
            rows={4}
            placeholder="Uploaded audio transcript will appear here (editable before generation)..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#101014',
              border: '1px solid #2B2B38',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Duration Slider (60s - 300s strictly validated) */}
      <div style={{ marginBottom: '24px', backgroundColor: '#16161C', border: '1px solid #262630', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: '#7C3AED' }} /> Target Runtime (60s – 300s)
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#7C3AED' }}>
            {formattedDuration} ({durationSeconds} seconds)
          </span>
        </div>
        <input
          type="range"
          min={60}
          max={300}
          step={10}
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#717182', marginTop: '6px' }}>
          <span>1:00 (60s min)</span>
          <span>2:00 (120s)</span>
          <span>3:00 (180s)</span>
          <span>5:00 (300s max)</span>
        </div>
      </div>

      {/* Genre Style Profile (Rule #11: Post-content styling layer) */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#C8C8D4', marginBottom: '8px' }}>
          Genre Style Profile (Post-Process Visual & Color Grading)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              style={{
                backgroundColor: genre === g ? '#7C3AED' : '#16161C',
                color: genre === g ? '#FFFFFF' : '#A2A2B4',
                border: `1px solid ${genre === g ? '#7C3AED' : '#262630'}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Style Preset */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#C8C8D4', marginBottom: '8px' }}>
          Cinematic Visual Style
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setVisualStyle(s.id)}
              style={{
                backgroundColor: visualStyle === s.id ? '#201A30' : '#16161C',
                color: visualStyle === s.id ? '#C4B5FD' : '#A2A2B4',
                border: `1px solid ${visualStyle === s.id ? '#7C3AED' : '#262630'}`,
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCreate}
        disabled={submitting}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#7C3AED',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
        }}
      >
        {submitting ? (
          <>
            <Sparkles className="animate-spin" size={20} />
            Initializing Multi-Agent Production...
          </>
        ) : (
          <>
            Begin Autonomous Production
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
};
