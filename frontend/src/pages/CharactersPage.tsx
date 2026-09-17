import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch,
  AlertCircle,
} from 'lucide-react';
import { Project, NavigationTab } from '../types/filmStudio';

interface CharactersPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
}

export const CharactersPage: React.FC<CharactersPageProps> = ({
  project,
  onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'style' | 'dependencies'>('characters');
  const [showDependencyAlert, setShowDependencyAlert] = useState(false);

  const { bible } = project;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Film Bible & World Building
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #FDE68A' }}>
              Consistency Anchors
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            The Continuity Agent conditions all downstream shot generation against these identity and aesthetic anchors.
          </p>
        </div>

        {/* Category switcher */}
        <div style={{ display: 'flex', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          {[
            { id: 'characters', label: 'Characters (2)' },
            { id: 'locations', label: 'Locations (4)' },
            { id: 'style', label: 'Visual Style' },
            { id: 'dependencies', label: 'Dependency Graph' },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isSel ? '#1E293B' : 'transparent',
                  color: isSel ? '#FFFFFF' : '#64748B',
                  fontSize: '12px',
                  fontWeight: isSel ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dependency Warning Bar */}
      {showDependencyAlert && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="#DC2626" />
            <div>
              <strong style={{ fontSize: '13px', color: '#991B1B' }}>Aarav’s Wardrobe Updated: </strong>
              <span style={{ fontSize: '13px', color: '#B91C1C' }}>
                This change affects 14 shots across Scenes 1, 2, 3, 4, 5, 7.
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('storyboard')}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Review Affected Shots
          </button>
        </div>
      )}

      {/* TAB 1: CHARACTERS */}
      {activeTab === 'characters' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {bible.characters.map((char) => (
            <div
              key={char.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={char.referenceImage}
                  alt={char.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#34D399',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ✓ {char.consistencyScore}% Consistency
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{char.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Age: {char.age || 'N/A'}</span>
                </div>

                <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, marginBottom: '12px' }}>
                  {char.role}
                </div>

                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', lineHeight: 1.5 }}>
                  <strong>Appearance:</strong> {char.appearance}
                </div>

                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', lineHeight: 1.5 }}>
                  <strong>Wardrobe:</strong> {char.wardrobe}
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', marginBottom: '16px' }}>
                  <strong>Voice Profile:</strong> {char.voiceProfile}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Used in {char.shotsCount} shots</span>
                  <button
                    onClick={() => setShowDependencyAlert(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'transparent',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={12} /> Regenerate Reference
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LOCATIONS */}
      {activeTab === 'locations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {bible.locations.map((loc) => (
            <div
              key={loc.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img
                  src={loc.referenceImage}
                  alt={loc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{loc.name}</h4>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{loc.type}</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                  {loc.description}
                </p>
                <div style={{ fontSize: '11px', color: '#7C3AED', backgroundColor: '#F3E8FF', padding: '4px 8px', borderRadius: '4px' }}>
                  <strong>Lighting:</strong> {loc.lighting}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VISUAL STYLE */}
      {activeTab === 'style' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            {bible.visualStyle.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
            {bible.visualStyle.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Lighting Directive</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>{bible.visualStyle.lighting}</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Camera Specification</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>{bible.visualStyle.cameraStyle}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            Film Color Palette:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {bible.visualStyle.colorPalette.map((col, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: col, border: '1px solid #CBD5E1' }} />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>{col}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEPENDENCY GRAPH */}
      {activeTab === 'dependencies' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <GitBranch size={18} color="#7C3AED" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Production Dependency Graph
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
            Tracks asset propagation across the film graph. When character appearances or location assets update, only downstream impacted shots are queued for re-verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>Aarav (Character Anchor)</span>
                <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>Linked to 14 Shots</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Scene 1 (4 shots)', 'Scene 2 (3 shots)', 'Scene 3 (2 shots)', 'Scene 4 (2 shots)', 'Scene 5 (2 shots)', 'Scene 7 (1 shot)'].map((sc, i) => (
                  <span key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: '#334155' }}>
                    {sc}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>Abandoned Facility (Location Plate)</span>
                <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>Linked to 10 Shots</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Scene 3 (2 shots)', 'Scene 4 (3 shots)', 'Scene 5 (2 shots)', 'Scene 6 (2 shots)', 'Scene 8 (1 shot)'].map((sc, i) => (
                  <span key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: '#334155' }}>
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
