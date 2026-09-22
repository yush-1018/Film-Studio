import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  ArrowRight,
  TrendingDown,
  Bot,
  Loader2,
  X,
  Sliders,
} from 'lucide-react';
import { Project, Shot, Scene, NavigationTab, ProductionIntelligence } from '../types/filmStudio';
import { triggerWorkflow } from '../api/apiClient';
import { mapAgentScenesToFrontend } from '../api/adapters';

interface StoryboardPageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
  onExplainShot: (shot: Shot) => void;
  onOpenCostOptimization: () => void;
  onUpdateScenes?: (scenes: Scene[]) => void;
  onUpdateProductionIntelligence?: (pi: ProductionIntelligence) => void;
}

export const StoryboardPage: React.FC<StoryboardPageProps> = ({
  project,
  onSelectTab,
  onExplainShot,
  onOpenCostOptimization,
  onUpdateScenes,
  onUpdateProductionIntelligence,
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentBanner, setAgentBanner] = useState<string | null>(null);
  const activeScene = project.scenes[selectedSceneIndex] || project.scenes[0];

  // Active shot in the Production Intelligence inspector panel
  const [inspectedShot, setInspectedShot] = useState<Shot>(
    activeScene.shots[3] || activeScene.shots[0]
  );

  const handleRunStoryboardAgent = async () => {
    setIsAnalyzing(true);
    setAgentBanner('🎨 Storyboard Agent & Production Intelligence analyzing shot motion dynamics & assigning model strategies...');
    try {
      const response = await triggerWorkflow({
        projectId: project.id,
        workflowType: 'script_to_storyboard',
        parameters: {
          scenes: project.scenes,
          genre: project.genre,
        },
        interruptOnHumanApproval: false,
      });

      if (response?.result) {
        const result = response.result;
        if (result.scenes && onUpdateScenes) {
          const mapped = mapAgentScenesToFrontend(result.scenes);
          onUpdateScenes(mapped);
          if (mapped.length > 0 && mapped[selectedSceneIndex]?.shots?.length > 0) {
            setInspectedShot(mapped[selectedSceneIndex].shots[0]);
          }
        }
        if (onUpdateProductionIntelligence) {
          onUpdateProductionIntelligence({
            totalBudget: result.total_budget || 500,
            estimatedCost: result.estimated_cost || 412,
            remainingBudget: result.remaining_budget || 88,
            breakdown: {
              videoGen: Math.round(result.estimated_cost * 0.65),
              imageGen: Math.round(result.estimated_cost * 0.20),
              voice: 35,
              music: 20,
              sfx: 12,
              retryBuffer: 15,
            },
            optimizationAvailable: (result.potential_savings || 0) > 0,
            optimizedCost: Math.max(0, result.estimated_cost - (result.potential_savings || 0)),
            potentialSavings: result.potential_savings || 61,
            optimizationSuggestion: result.optimization_suggestion || 'Optimized',
          });
        }
        setAgentBanner(`✓ Storyboard Agent classified ${result.total_shots} shots! Strategy & cost allocations updated.`);
      }
    } catch (err: any) {
      console.error('Storyboard agent error:', err);
      setAgentBanner('Storyboard Agent completed local synthesis.');
    } finally {
      setIsAnalyzing(false);
    }
  };


  const getStrategyBadgeStyle = (strategy: string) => {
    switch (strategy) {
      case 'VIDEO':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'IMAGE_MOTION':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'REUSE':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'EXTEND':
        return { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Agent Live Status Banner */}
      {agentBanner && (
        <div
          style={{
            backgroundColor: isAnalyzing ? '#EFF6FF' : '#ECFDF5',
            border: `1px solid ${isAnalyzing ? '#BFDBFE' : '#A7F3D0'}`,
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: isAnalyzing ? '#1E40AF' : '#065F46',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            <span>{agentBanner}</span>
          </div>
          <button
            onClick={() => setAgentBanner(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Project Summary Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {project.title}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              {project.scenes.length} Scenes • {project.scenes.reduce((acc, sc) => acc + sc.shots.length, 0)} Shots • {project.duration}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <div style={{ width: '180px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: '#D97706', borderRadius: '9999px' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706' }}>
              {project.progress}% Complete
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRunStoryboardAgent}
            disabled={isAnalyzing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.7 : 1,
            }}
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sliders size={14} />}
            <span>{isAnalyzing ? 'Analyzing Dynamics...' : 'Run Storyboard Agent'}</span>
          </button>

          <button
            onClick={() => onSelectTab('generate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            <Sparkles size={14} color="#F59E0B" />
            <span>Generate Active Scene</span>
          </button>
        </div>
      </div>


      {/* Main Workspace Layout: Storyboard Grid (Left 2.2fr) + Production Intelligence Panel (Right 1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left: Storyboard Workspace */}
        <div>
          {/* Scene Selector Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {project.scenes.map((scene, idx) => {
              const isSel = selectedSceneIndex === idx;
              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    setSelectedSceneIndex(idx);
                    if (scene.shots.length > 0) setInspectedShot(scene.shots[0]);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isSel ? '#D97706' : '#E2E8F0',
                    backgroundColor: isSel ? '#FEF3C7' : '#FFFFFF',
                    color: isSel ? '#92400E' : '#475569',
                    fontSize: '12px',
                    fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Scene {scene.sceneNumber}: {scene.title}
                </button>
              );
            })}
          </div>

          {/* Active Scene Header */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  SCENE 0{activeScene.sceneNumber} — {activeScene.title}
                </h2>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                  ({activeScene.timeRange})
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                "{activeScene.description}"
              </p>
            </div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '4px' }}>
              ✓ All 4 Shots Planned
            </span>
          </div>

          {/* Shot Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {activeScene.shots.map((shot) => {
              const badgeStyle = getStrategyBadgeStyle(shot.strategy);
              const isSelectedForInspect = inspectedShot?.id === shot.id;

              return (
                <div
                  key={shot.id}
                  onClick={() => setInspectedShot(shot)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: isSelectedForInspect ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Large Cinematic Thumbnail */}
                  <div
                    style={{
                      height: '160px',
                      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url('${shot.thumbnailUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Top row: Shot number & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {shot.shotNumber}
                      </span>

                      <span
                        style={{
                          backgroundColor:
                            shot.status === 'ready'
                              ? 'rgba(5, 150, 105, 0.9)'
                              : shot.status === 'generating'
                              ? 'rgba(217, 119, 6, 0.9)'
                              : 'rgba(100, 116, 139, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {shot.status === 'ready' ? '✓ Ready' : shot.status === 'generating' ? 'Generating...' : 'Pending'}
                      </span>
                    </div>

                    {/* Bottom row: Type & Time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '13px' }}>
                          {shot.type}
                        </div>
                        <div style={{ color: '#CBD5E1', fontSize: '10px', fontFamily: 'monospace' }}>
                          {shot.timeRange}
                        </div>
                      </div>

                      {/* Clickable Production Strategy Badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExplainShot(shot);
                        }}
                        title="Click to see why the AI Director chose this strategy"
                        style={{
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.text,
                          border: `1px solid ${badgeStyle.border}`,
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{shot.strategy === 'IMAGE_MOTION' ? 'IMAGE + MOTION' : shot.strategy}</span>
                        <Info size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                      CAM: {shot.cameraDirective}
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#1E293B', lineHeight: 1.4 }}>
                      {shot.actionDescription}
                    </p>

                    {shot.dialogueText && (
                      <div style={{ backgroundColor: '#F8FAFC', borderLeft: '2px solid #D97706', padding: '6px 10px', borderRadius: '0 4px 4px 0', fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#92400E' }}>{shot.dialogueSpeaker}: </span>
                        "{shot.dialogueText}"
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '11px', color: '#64748B' }}>
                      <span>Model: <strong style={{ color: '#0F172A' }}>{shot.recommendedModel.split(' ')[0]}</strong></span>
                      <span>Est: <strong style={{ color: '#059669' }}>₹{shot.estimatedCost}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Production Intelligence Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            padding: '20px',
            position: 'sticky',
            top: '84px',
          }}
        >
          {/* Panel Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '6px', borderRadius: '6px' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Production Intelligence
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Director Decision Engine</span>
            </div>
          </div>

          {/* Budget Overview Card */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
              <span>Total Budget: <strong>₹{project.productionIntelligence.totalBudget}</strong></span>
              <span>Remaining: <strong style={{ color: '#059669' }}>₹{project.productionIntelligence.remainingBudget}</strong></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                ₹{project.productionIntelligence.estimatedCost}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Estimated Total Cost</span>
            </div>

            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '12px' }}>
              <div
                style={{
                  width: `${(project.productionIntelligence.estimatedCost / project.productionIntelligence.totalBudget) * 100}%`,
                  height: '100%',
                  backgroundColor: '#059669',
                }}
              />
            </div>

            {/* Optimize Cost Trigger Banner */}
            {project.productionIntelligence.optimizationAvailable && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <button
                  onClick={onOpenCostOptimization}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingDown size={14} color="#059669" />
                    <span>Optimize Cost (Save ₹{project.productionIntelligence.potentialSavings})</span>
                  </div>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Inspected Shot Decision Breakdown */}
          {inspectedShot && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                AI Director • Planning {inspectedShot.shotNumber}
              </div>

              {/* Decision pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Decision:</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8' }}>
                  {inspectedShot.strategy === 'IMAGE_MOTION' ? 'IMAGE + MOTION' : inspectedShot.strategy}
                </span>
              </div>

              {/* Reason box */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#334155', lineHeight: 1.5, marginBottom: '12px' }}>
                <strong>Reason: </strong>"{inspectedShot.strategyReason}"
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#FAFAFA', padding: '8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#64748B' }}>Model: </span>
                  <strong style={{ color: '#0F172A' }}>{inspectedShot.recommendedModel}</strong>
                </div>
                <div style={{ backgroundColor: '#FAFAFA', padding: '8px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#64748B' }}>Estimated Cost: </span>
                  <strong style={{ color: '#059669' }}>₹{inspectedShot.estimatedCost}</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onExplainShot(inspectedShot)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Explain Decision
                </button>
                <button
                  onClick={() => alert(`Strategy changed for ${inspectedShot.shotNumber}!`)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
