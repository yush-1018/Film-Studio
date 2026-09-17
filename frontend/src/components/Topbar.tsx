import React from 'react';
import {
  Sparkles,
  Play,
  Share2,
  Search,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface TopbarProps {
  project: Project;
  onOpenDirectorMode: () => void;
  onOpenPreview: () => void;
  onOpenCommandPalette: () => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  onOpenDirectorMode,
  onOpenPreview,
  onOpenCommandPalette,
  onSelectTab,
}) => {
  const pipelineSteps = [
    { label: 'Planning', tab: 'director_mode' as NavigationTab, done: true },
    { label: 'Script', tab: 'script' as NavigationTab, done: true },
    { label: 'Characters', tab: 'characters' as NavigationTab, done: true },
    { label: 'Storyboard', tab: 'storyboard' as NavigationTab, done: true },
    { label: 'Generating', tab: 'generate' as NavigationTab, active: true },
    { label: 'Audio', tab: 'audio' as NavigationTab, done: false },
    { label: 'Editing', tab: 'timeline' as NavigationTab, done: false },
    { label: 'Rendering', tab: 'render' as NavigationTab, done: false },
  ];

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 15,
      }}
    >
      {/* Left: Project title & metadata */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => onSelectTab('dashboard')}
          title="Back to Dashboard"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
              {project.title}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#D97706',
                backgroundColor: '#FEF3C7',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #FDE68A',
              }}
            >
              {project.genre} • {project.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Step Indicator Flow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          backgroundColor: '#F8FAFC',
          padding: '4px 10px',
          borderRadius: '9999px',
          border: '1px solid #E2E8F0',
        }}
      >
        {pipelineSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            {idx > 0 && <span style={{ color: '#CBD5E1' }}>•</span>}
            <button
              onClick={() => onSelectTab(step.tab)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '11px',
                fontWeight: step.active ? 700 : step.done ? 600 : 400,
                color: step.active ? '#7C3AED' : step.done ? '#059669' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {step.done && <CheckCircle2 size={11} color="#059669" />}
              {step.active && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#7C3AED' }} />}
              <span>{step.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Quick actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Ctrl+K Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#64748B',
            cursor: 'pointer',
          }}
          title="Command Palette (Ctrl + K)"
        >
          <Search size={14} color="#64748B" />
          <span>Search...</span>
          <kbd
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Director Mode button */}
        <button
          onClick={onOpenDirectorMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F5F3FF',
            color: '#6D28D9',
            border: '1px solid #DDD6FE',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Sparkles size={14} color="#7C3AED" />
          <span>Director Mode</span>
        </button>

        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
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
          <Play size={13} fill="#FFFFFF" />
          <span>Preview</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => alert('Share link copied to clipboard: https://filmstudio.ai/p/the-last-signal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            color: '#475569',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};
