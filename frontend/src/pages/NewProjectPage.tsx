import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Mic,
  ArrowRight,
  Clapperboard,
} from 'lucide-react';
import { NavigationTab } from '../types/filmStudio';

interface NewProjectPageProps {
  onStartPlanning: (newProjectData: {
    title: string;
    logline: string;
    genre: string;
    duration: string;
    style: string;
    budget: number;
  }) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const NewProjectPage: React.FC<NewProjectPageProps> = ({
  onStartPlanning,
  onSelectTab,
}) => {
  const [inputMode, setInputMode] = useState<'idea' | 'script' | 'story' | 'audio'>('idea');
  const [storyPrompt, setStoryPrompt] = useState(
    'A curious college student discovers an oscillating radio signal on his laptop late at night. The transmission carries coordinates to an abandoned power station in the pine ridge forest, where an extraterrestrial light entity manifests.'
  );
  const [genre, setGenre] = useState('Sci-Fi');
  const [duration, setDuration] = useState('2 min');
  const [visualStyle, setVisualStyle] = useState('Cinematic');
  const [budget, setBudget] = useState(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartPlanning({
      title: 'THE LAST SIGNAL',
      logline: storyPrompt,
      genre,
      duration,
      style: visualStyle,
      budget,
    });
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Create a new film.
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          Start with an idea, script, story, or audio idea. The AI Director will formulate your production plan.
        </p>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '32px',
        }}
      >
        {/* Input Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          {[
            { id: 'idea', label: 'Write an Idea', icon: Sparkles },
            { id: 'script', label: 'Upload Script', icon: FileText },
            { id: 'story', label: 'Paste Story', icon: Clapperboard },
            { id: 'audio', label: 'Upload Audio', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = inputMode === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setInputMode(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isSel ? '#FFFFFF' : 'transparent',
                  color: isSel ? '#0F172A' : '#64748B',
                  fontWeight: isSel ? 600 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <Icon size={14} color={isSel ? '#D97706' : '#94A3B8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Area */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
            What do you want to create?
          </label>
          <textarea
            rows={4}
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="A student discovers a mysterious signal coming from an abandoned building..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              color: '#1E293B',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Genre */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Genre
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Auto Detect', 'Sci-Fi', 'Horror', 'Drama', 'Comedy', 'Action'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGenre(g)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: genre === g ? '#D97706' : '#E2E8F0',
                    backgroundColor: genre === g ? '#FEF3C7' : '#FFFFFF',
                    color: genre === g ? '#92400E' : '#475569',
                    fontSize: '12px',
                    fontWeight: genre === g ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Target Duration
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['30 sec', '1 min', '2 min', '5 min'].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: duration === d ? '#D97706' : '#E2E8F0',
                    backgroundColor: duration === d ? '#FEF3C7' : '#FFFFFF',
                    color: duration === d ? '#92400E' : '#475569',
                    fontSize: '12px',
                    fontWeight: duration === d ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Style & Budget row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Visual Style */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Visual Style
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Cinematic', 'Anime', 'Realistic', 'Stylized'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setVisualStyle(s)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: visualStyle === s ? '#7C3AED' : '#E2E8F0',
                    backgroundColor: visualStyle === s ? '#F3E8FF' : '#FFFFFF',
                    color: visualStyle === s ? '#6B21A8' : '#475569',
                    fontSize: '12px',
                    fontWeight: visualStyle === s ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Generation Budget Limit
              </label>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                ₹{budget}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={1500}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#D97706' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
              <span>₹200 (Economy)</span>
              <span>₹500 (Standard 2 min)</span>
              <span>₹1500 (Feature High-Res)</span>
            </div>
          </div>
        </div>

        {/* Action Button: Create Film Plan */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>Note: </span>
            The Director plans scenes & shots before any generation occurs.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <span>Create Film Plan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
