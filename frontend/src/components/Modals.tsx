import React, { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';
import { Shot } from '../types/filmStudio';

// -----------------------------------------------------------------------------
// Strategy Explain Modal ("Why this strategy?")
// -----------------------------------------------------------------------------
interface StrategyExplainModalProps {
  shot: Shot | null;
  onClose: () => void;
  onChangeStrategy?: (newStrategy: string) => void;
}

export const StrategyExplainModal: React.FC<StrategyExplainModalProps> = ({
  shot,
  onClose,
}) => {
  if (!shot) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', padding: '6px', borderRadius: '6px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Why this Strategy? — {shot.shotNumber}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Production Intelligence Decision</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Selected Strategy Card */}
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Selected Strategy
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: shot.strategy === 'VIDEO' ? '#EFF6FF' : '#FEF3C7',
                color: shot.strategy === 'VIDEO' ? '#1D4ED8' : '#92400E',
                border: shot.strategy === 'VIDEO' ? '1px solid #BFDBFE' : '1px solid #FDE68A',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {shot.strategy === 'IMAGE_MOTION' ? 'IMAGE + MOTION' : shot.strategy}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.6 }}>
            {shot.strategyReason}
          </p>
        </div>

        {/* Intelligence Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Recommended Model</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
              {shot.recommendedModel}
            </div>
          </div>
          <div style={{ backgroundColor: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Estimated Shot Cost</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669', marginTop: '2px' }}>
              ₹{shot.estimatedCost}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Cost Optimize Modal (Budget-Aware Generation)
// -----------------------------------------------------------------------------
interface CostOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: () => void;
}

export const CostOptimizeModal: React.FC<CostOptimizeModalProps> = ({
  isOpen,
  onClose,
  onApplyOptimization,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px', borderRadius: '6px' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Optimize Production Cost
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Production Intelligence Recommendation</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
            <Lightbulb size={16} />
            AI Suggestion
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#15803D', lineHeight: 1.5 }}>
            "6 video shots can be replaced with Image + Motion without significantly affecting cinematic quality. This reduces motion artifacts on static dialogue scenes and preserves budget for dynamic climax shots."
          </p>
        </div>

        {/* Price Comparison */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Current Cost</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#475569' }}>₹412</div>
          </div>
          <ArrowRight size={20} color="#94A3B8" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Optimized Cost</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>₹351</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>Total Savings</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#D97706' }}>₹61</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyOptimization();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Apply Optimization
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Director Chat Modal (Interactive AI Director Assistant)
// -----------------------------------------------------------------------------
interface DirectorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorChatModal: React.FC<DirectorChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputMsg, setInputMsg] = useState('Make Scene 3 darker');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', padding: '6px', borderRadius: '6px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                AI Director Consultation
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Direct your virtual film crew</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Chat input box */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="e.g. Make Scene 3 darker, slow down pacing..."
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setHasSubmitted(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ask
          </button>
        </div>

        {/* Proposed Changes Preview */}
        {hasSubmitted && (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600, marginBottom: '10px' }}>
              AI Director: "I'll adjust Scene 3 lighting, color tone and background music."
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Lighting: </span>
                <strong style={{ color: '#0F172A' }}>Low-key Chiaroscuro</strong>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Music: </span>
                <strong style={{ color: '#0F172A' }}>High Tension Sub-bass</strong>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Color Palette: </span>
                <strong style={{ color: '#0F172A' }}>Cool Cyan Shadows</strong>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Camera: </span>
                <strong style={{ color: '#0F172A' }}>Longer Close-ups (+1.5s)</strong>
              </div>
            </div>

            {applied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Changes successfully applied to Scene 3 storyboard & sound specs!
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  onClick={() => setApplied(true)}
                  style={{
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
                  Apply Proposed Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Fix Shot Modal (Targeted Single-Shot Regeneration)
// -----------------------------------------------------------------------------
interface FixShotModalProps {
  shotId: string | null;
  onClose: () => void;
  onFixSuccess: () => void;
}

export const FixShotModal: React.FC<FixShotModalProps> = ({
  shotId,
  onClose,
  onFixSuccess,
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [done, setDone] = useState(false);

  if (!shotId) return null;

  const handleFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setDone(true);
      setTimeout(() => {
        onFixSuccess();
        onClose();
      }, 1000);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '6px', borderRadius: '6px' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Fix Shot 3.2 Continuity
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Targeted single-shot correction</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#92400E', marginBottom: '16px', lineHeight: 1.5 }}>
          <strong>Recommendation:</strong> Regenerate lighting color grade only. Motion, character seed, and audio sync are already verified and will NOT be re-rendered.
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#059669', fontWeight: 600, fontSize: '13px' }}>
            ✓ Shot 3.2 lighting corrected to 5600K cool moonlight!
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleFix}
              disabled={isFixing}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isFixing ? 'not-allowed' : 'pointer',
              }}
            >
              {isFixing ? 'Correcting Lighting...' : 'Fix Shot 3.2'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
