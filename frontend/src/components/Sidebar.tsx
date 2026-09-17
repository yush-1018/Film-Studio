import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileText,
  Camera,
  Sparkles,
  Users,
  Box,
  Volume2,
  Film,
  CheckCircle2,
  Share2,
  Sliders,
} from 'lucide-react';
import { NavigationTab } from '../types/filmStudio';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  demoMode,
  onToggleDemoMode,
}) => {
  const navSections = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'new_project' as NavigationTab, label: 'New Project', icon: PlusCircle },
        { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
      ],
    },
    {
      label: 'Creation',
      items: [
        { id: 'script' as NavigationTab, label: 'Story & Script', icon: FileText },
        { id: 'storyboard' as NavigationTab, label: 'Storyboard', icon: Camera },
        { id: 'generate' as NavigationTab, label: 'Generate', icon: Sparkles },
      ],
    },
    {
      label: 'Production',
      items: [
        { id: 'characters' as NavigationTab, label: 'Characters & World', icon: Users },
        { id: 'assets' as NavigationTab, label: 'Assets', icon: Box },
        { id: 'audio' as NavigationTab, label: 'Audio & Music', icon: Volume2 },
      ],
    },
    {
      label: 'Post-Production',
      items: [
        { id: 'timeline' as NavigationTab, label: 'Timeline & Edit', icon: Film },
        { id: 'quality' as NavigationTab, label: 'Quality & Continuity', icon: CheckCircle2 },
        { id: 'render' as NavigationTab, label: 'Render & Export', icon: Share2 },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Brand Header with Minimal Cinematic "A" Logo */}
      <div
        style={{
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Minimal Abstract Cinematic "A" Aperture Logo */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(30, 41, 59, 0.2)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {/* Cinematic layered triangular aperture 'A' */}
            <path
              d="M12 3L3 21H7.5L9.5 17H14.5L16.5 21H21L12 3Z"
              fill="#F59E0B"
              fillOpacity="0.9"
            />
            <path
              d="M12 7.5L10.2 13.5H13.8L12 7.5Z"
              fill="#1E293B"
            />
            <circle cx="12" cy="11.5" r="1.5" fill="#38BDF8" />
          </svg>
        </div>

        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
            Agentic
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', letterSpacing: '0.02em' }}>
            Film Studio
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>
            From idea to cinematic reality
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 10px 6px 10px',
              }}
            >
              {section.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                      color: isActive ? '#92400E' : '#334155',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={16} color={isActive ? '#D97706' : '#64748B'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Demo Mode Toggle & User Profile Card */}
      <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 16px', backgroundColor: '#FAFAFA' }}>
        {/* Demo Mode Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            padding: '6px 10px',
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={13} color="#7C3AED" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563' }}>Demo Mode</span>
          </div>
          <button
            onClick={onToggleDemoMode}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: demoMode ? '#059669' : '#9CA3AF',
              color: '#FFFFFF',
            }}
          >
            {demoMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              border: '1px solid #FDE68A',
            }}
          >
            AR
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Ayush Raj
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Film Producer</div>
          </div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
        </div>
      </div>
    </aside>
  );
};
