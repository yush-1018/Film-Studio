import {
  PlusCircle,
  FileText,
  Camera,
  Sparkles,
  Sliders,
  Film,
  MoreHorizontal,
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
      label: 'Studio',
      items: [
        { id: 'generate' as NavigationTab, label: 'Video Studio', icon: Sparkles },
        { id: 'new_project' as NavigationTab, label: 'New Project', icon: PlusCircle },
        { id: 'script' as NavigationTab, label: 'Story & Script', icon: FileText },
        { id: 'storyboard' as NavigationTab, label: 'Storyboard', icon: Camera },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#0D0D10',
        borderRight: '1px solid #1C1C22',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 20,
        color: '#E1E1E6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Brand Header matching Image 2 Google Flow aesthetic */}
      <div
        style={{
          padding: '18px 18px 14px 18px',
          borderBottom: '1px solid #1A1A20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#181820',
              border: '1px solid #282834',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Film size={16} color="#A78BFA" />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              Film Studio
            </div>
            <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px' }}>
              Agentic Production
            </div>
          </div>
        </div>

        <MoreHorizontal size={15} color="#52525B" style={{ cursor: 'pointer' }} />
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#52525B',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px 8px 10px',
              }}
            >
              {section.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#202028' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#9E9EA7',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#16161C';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={16} color={isActive ? '#A78BFA' : '#71717A'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile & Demo Mode */}
      <div style={{ borderTop: '1px solid #1A1A20', padding: '14px 14px', backgroundColor: '#0A0A0D' }}>
        {/* Demo Mode Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '6px 10px',
            backgroundColor: '#121216',
            borderRadius: '6px',
            border: '1px solid #1E1E26',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={12} color="#A78BFA" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#A1A1AA' }}>Local Engine</span>
          </div>
          <button
            onClick={onToggleDemoMode}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: demoMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(113, 113, 122, 0.2)',
              color: demoMode ? '#34D399' : '#A1A1AA',
              borderRadius: '4px',
              border: `1px solid ${demoMode ? 'rgba(16, 185, 129, 0.3)' : '#27272A'}`,
              cursor: 'pointer',
            }}
          >
            {demoMode ? 'ON-DEVICE' : 'CLOUD'}
          </button>
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            AR
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#EDEDED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Ayush Raj
            </div>
            <div style={{ fontSize: '10px', color: '#71717A' }}>
              Film Producer
            </div>
          </div>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
        </div>
      </div>
    </aside>
  );
};
