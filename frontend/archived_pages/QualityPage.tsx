import React, { useState } from 'react';
import {
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Project, QualityCheckItem, NavigationTab } from '../types/filmStudio';
import { mockQualityChecklist } from '../data/mockData';

interface QualityPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenFixShotModal: (shotId: string) => void;
}

export const QualityPage: React.FC<QualityPageProps> = ({
  project,
  onSelectTab,
  onOpenFixShotModal,
}) => {
  const [checklist] = useState<QualityCheckItem[]>(mockQualityChecklist);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Continuity & Quality Agent
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
              ● Audit Completed
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Validates facial embeddings, wardrobe persistence, camera continuity, and lighting coherence across generated shots.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('timeline')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>Send to Timeline Editor</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Score Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Overall Quality Score</span>
            <ShieldCheck size={18} color="#059669" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>{project.qualityScore}</span>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>/ 100</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: `${project.qualityScore}%`, height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '6px', fontWeight: 500 }}>
            ✓ High fidelity cinematography standards met
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Continuity Vector Retention</span>
            <Sparkles size={18} color="#7C3AED" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>{project.continuityScore}</span>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>/ 100</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: `${project.continuityScore}%`, height: '100%', backgroundColor: '#7C3AED', borderRadius: '9999px' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '6px', fontWeight: 500 }}>
            ✓ Character facial drift minimized across all 24 shots
          </div>
        </div>
      </div>

      {/* Shot-by-Shot Inspection Checklist */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Shot Validation Audit
          </span>
          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
            ⚠ 1 Shot Requires Targeted Correction
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {checklist.map((item, idx) => (
            <div
              key={item.shotId}
              style={{
                padding: '20px',
                borderBottom: idx < checklist.length - 1 ? '1px solid #F1F5F9' : 'none',
                backgroundColor: item.isProblematic ? '#FEFCE8' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {item.shotNumber}
                    </span>
                    {item.isProblematic ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>
                        ⚠ Action Needed
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Passed
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
                    {item.notes}
                  </p>
                </div>

                {item.isProblematic && (
                  <button
                    onClick={() => onOpenFixShotModal(item.shotId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(217, 119, 6, 0.3)',
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>Fix Shot</span>
                  </button>
                )}
              </div>

              {/* 4 Consistency Vectors Checklist */}
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#64748B' }}>
                <span style={{ color: item.characterMatch ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.characterMatch ? '✓' : '✗'} Character Identity
                </span>
                <span style={{ color: item.wardrobeMatch ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.wardrobeMatch ? '✓' : '✗'} Wardrobe & Props
                </span>
                <span style={{ color: item.locationMatch ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.locationMatch ? '✓' : '✗'} Location Architecture
                </span>
                <span style={{ color: item.lightingMatch ? '#059669' : '#D97706', fontWeight: !item.lightingMatch ? 700 : 400, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.lightingMatch ? '✓' : '⚠'} Lighting & Color Temperature
                </span>
              </div>

              {item.isProblematic && (
                <div style={{ marginTop: '12px', backgroundColor: '#FFFFFF', border: '1px solid #FDE68A', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#92400E' }}>
                  <strong>Recommendation: </strong>{item.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
