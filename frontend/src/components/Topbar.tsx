import React from 'react';
import {
  Sparkles,
  Search,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface TopbarProps {
  project: Project;
  onOpenDirectorMode: () => void;
  onOpenPreview: () => void;
  onOpenCommandPalette: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  isAgentPanelOpen?: boolean;
  onToggleAgentPanel?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  onSelectTab,
  isAgentPanelOpen = true,
  onToggleAgentPanel,
}) => {
  return (
    <header
      style={{
        height: '56px',
        backgroundColor: '#0D0D10',
        borderBottom: '1px solid #1C1C22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 15,
        color: '#E1E1E6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Left: Active project title & genre badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onSelectTab('projects')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 0,
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            {project.title || 'Untitled Film'}
          </span>
        </button>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#DDD6FE',
            backgroundColor: 'rgba(124, 58, 237, 0.25)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
        >
          {project.genre || 'Sci-Fi'} • {project.duration || '1 min'}
        </span>
      </div>

      {/* Middle: Google Flow style search / command pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#16161C',
          border: '1px solid #252530',
          borderRadius: '20px',
          padding: '6px 14px',
          width: '320px',
        }}
      >
        <Search size={14} color="#71717A" />
        <input
          type="text"
          placeholder="Search scene, shot prompt or directive..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '12px',
            width: '100%',
          }}
        />
      </div>

      {/* Right: Studio actions matching Image 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* PRO Tier badge */}
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#FFFFFF',
            backgroundColor: '#1E1E26',
            border: '1px solid #2F2F3D',
            padding: '3px 8px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}
        >
          PRO
        </span>

        {/* Toggle Agent Studio panel */}
        {onToggleAgentPanel && (
          <button
            onClick={onToggleAgentPanel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isAgentPanelOpen ? '#7C3AED' : '#1C1C24',
              border: isAgentPanelOpen ? 'none' : '1px solid #2B2B36',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Agent Prompt Studio"
          >
            <Sparkles size={14} color={isAgentPanelOpen ? '#FFFFFF' : '#A78BFA'} />
            <span>Agent Studio</span>
          </button>
        )}
      </div>
    </header>
  );
};
