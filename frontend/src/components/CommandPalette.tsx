import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Camera,
  Users,
  Film,
  CheckCircle2,
  Share2,
  PlusCircle,
  X,
} from 'lucide-react';
import { NavigationTab } from '../types/filmStudio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Open Storyboard & Production Intelligence', tab: 'storyboard' as NavigationTab, icon: Camera, category: 'Production' },
    { label: 'Open Screenplay & Script Editor', tab: 'script' as NavigationTab, icon: Film, category: 'Creation' },
    { label: 'AI Director Mode & Concept Plan', tab: 'director_mode' as NavigationTab, icon: Sparkles, category: 'AI Director' },
    { label: 'Inspect Characters & Film Bible', tab: 'characters' as NavigationTab, icon: Users, category: 'Production' },
    { label: 'Run Quality & Continuity Verification', tab: 'quality' as NavigationTab, icon: CheckCircle2, category: 'Quality' },
    { label: 'Open Timeline Editor & Cinema Player', tab: 'timeline' as NavigationTab, icon: Film, category: 'Post-Production' },
    { label: 'Start New Project', tab: 'new_project' as NavigationTab, icon: PlusCircle, category: 'Navigation' },
    { label: 'Render & Export Final Film (1080p)', tab: 'render' as NavigationTab, icon: Share2, category: 'Post-Production' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <Search size={18} color="#94A3B8" style={{ marginRight: '12px' }} />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search project assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#0F172A',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px 8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectTab(cmd.tab);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#64748B', display: 'flex' }}>
                      <Icon size={16} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E293B' }}>{cmd.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#94A3B8',
          }}
        >
          <span>Navigate with arrows, press Enter to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
