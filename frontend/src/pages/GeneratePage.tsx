import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Film,
  Loader2,
  Camera,
  Play,
} from 'lucide-react';

import { Project, NavigationTab, Scene } from '../types/filmStudio';
import { triggerWorkflow } from '../api/apiClient';

interface GeneratePageProps {
  project: Project;
  onSelectTab: (tab: NavigationTab) => void;
  onUpdateScenes?: (scenes: Scene[]) => void;
  externalIsGenerating?: boolean;
  externalActiveStage?: string;
  externalProgress?: number;
  onTriggerGenerate?: (prompt: string, genre: string, duration: string) => void;
}

export const GeneratePage: React.FC<GeneratePageProps> = ({
  project,
  externalIsGenerating = false,
  externalActiveStage = 'Ready for neural dispatch',
  externalProgress = 100,
  onTriggerGenerate,
}) => {
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'master' | 'shot'>('master');
  const [generatingPartIdx, setGeneratingPartIdx] = useState<number | null>(null);

  const isGenerating = externalIsGenerating || internalIsGenerating;
  const activeStage = externalActiveStage;
  const generationProgress = externalProgress;

  const durationMap: Record<string, number> = {
    '1 min': 60,
    '2 min': 120,
    '5 min': 300,
  };
  const durationSec = durationMap[project.duration || '1 min'] || 60;

  const activeMasterUrl = project.masterVideoUrl || (project as any).master_video_url || '';
  const activeMasterThumb = project.masterThumbnailUrl || (project as any).master_thumbnail_url || '';

  const [masterFilm, setMasterFilm] = useState({
    videoUrl: activeMasterUrl,
    thumbnailUrl: activeMasterThumb,
    title: project.title ? `${project.title} — Full Feature Film` : 'Cinematic Master Film',
    duration: `${durationSec}.0s (${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')})`,
    model: 'Google Veo 3 (Multi-Act Diffusion)',
    resolution: '1080p • 24 FPS',
    cost: '₹72',
  });

  // Watch for changes in project.masterVideoUrl
  useEffect(() => {
    const vUrl = project.masterVideoUrl || (project as any).master_video_url;
    const tUrl = project.masterThumbnailUrl || (project as any).master_thumbnail_url;
    if (vUrl) {
      setMasterFilm({
        videoUrl: vUrl,
        thumbnailUrl: tUrl || '',
        title: project.title ? `${project.title} — Full Feature Film` : 'Cinematic Master Film',
        duration: `${durationSec}.0s (${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')})`,
        model: 'Google Veo 3 (Multi-Act Diffusion)',
        resolution: '1080p • 24 FPS',
        cost: '₹72',
      });
      setViewMode('master');
    }
  }, [project.masterVideoUrl, (project as any).master_video_url, project.masterThumbnailUrl, (project as any).master_thumbnail_url, project.title]);

  const getInitialClips = () => {
    const allShots = project.scenes?.flatMap((sc) => sc.shots) || [];
    const partDuration = Math.round(durationSec / 3);

    if (allShots.length === 0) {
      return [
        {
          shotNumber: 'Part 1',
          title: 'Opening Establishing Scene',
          cameraDirective: 'Wide atmospheric 35mm framing',
          model: 'Google Veo 3 (High Dynamic)',
          resolution: '1080p • 24 FPS',
          duration: `${partDuration}s`,
          cost: '₹18',
          videoUrl: '/generated_videos/gen_sh_1_1.mp4',
          thumbnailUrl: '/generated_videos/gen_sh_1_1.jpg',
        },
        {
          shotNumber: 'Part 2',
          title: 'Dramatic Tension & Conflict',
          cameraDirective: 'Close-up tracking with dramatic lighting',
          model: 'Runway Gen-3 Alpha',
          resolution: '1080p • 24 FPS',
          duration: `${partDuration}s`,
          cost: '₹18',
          videoUrl: '/generated_videos/gen_sh_1_2.mp4',
          thumbnailUrl: '/generated_videos/gen_sh_1_2.jpg',
        },
        {
          shotNumber: 'Part 3',
          title: 'Climactic Resolution',
          cameraDirective: 'Dynamic low angle, high emotional intensity',
          model: 'Google Veo 3',
          resolution: '1080p • 24 FPS',
          duration: `${partDuration}s`,
          cost: '₹18',
          videoUrl: '/generated_videos/gen_sh_1_3.mp4',
          thumbnailUrl: '/generated_videos/gen_sh_1_3.jpg',
        },
      ];
    }

    return allShots.slice(0, 3).map((s, idx) => ({
      shotNumber: s.shotNumber || `Part ${idx + 1}`,
      title: s.actionDescription || `Scene ${idx + 1}`,
      cameraDirective: s.cameraDirective || 'Cinematic composition',
      model: s.recommendedModel || 'Google Veo 3',
      resolution: '1080p • 24 FPS',
      duration: `${s.duration || partDuration}s`,
      cost: '₹18',
      videoUrl: s.videoUrl || `/generated_videos/gen_sh_1_${idx + 1}.mp4`,
      thumbnailUrl: s.thumbnailUrl || `/generated_videos/gen_sh_1_${idx + 1}.jpg`,
    }));
  };

  const [renderedClips, setRenderedClips] = useState(getInitialClips);

  // Sync rendered clips whenever project.scenes updates
  useEffect(() => {
    const allShots = project.scenes?.flatMap((sc) => sc.shots) || [];
    if (allShots.length > 0) {
      const partDuration = Math.round(durationSec / 3);
      const updated = allShots.slice(0, 3).map((s, idx) => ({
        shotNumber: s.shotNumber || `Part ${idx + 1}`,
        title: s.actionDescription || `Scene ${idx + 1}`,
        cameraDirective: s.cameraDirective || 'Cinematic composition',
        model: s.recommendedModel || 'Google Veo 3',
        resolution: '1080p • 24 FPS',
        duration: `${s.duration || partDuration}s`,
        cost: '₹18',
        videoUrl: s.videoUrl || `/generated_videos/gen_sh_1_${idx + 1}.mp4`,
        thumbnailUrl: s.thumbnailUrl || `/generated_videos/gen_sh_1_${idx + 1}.jpg`,
      }));
      setRenderedClips(updated);
    }
  }, [project.scenes, durationSec]);

  const activeClip = renderedClips[selectedShotIndex] || renderedClips[0];

  const currentVideoItem = viewMode === 'master'
    ? {
        shotNumber: 'Master Cut',
        title: masterFilm.title,
        cameraDirective: `Continuous Multi-Act Feature Film (${project.duration || '1 min'})`,
        model: masterFilm.model,
        resolution: masterFilm.resolution,
        duration: masterFilm.duration,
        cost: masterFilm.cost,
        videoUrl: masterFilm.videoUrl,
        thumbnailUrl: masterFilm.thumbnailUrl,
      }
    : activeClip;

  // Individual Part Generator (Part 1, Part 2, etc.)
  const handleGeneratePart = async (idx: number) => {
    setGeneratingPartIdx(idx);
    setInternalIsGenerating(true);
    const targetShot = renderedClips[idx] || (project.scenes?.[0]?.shots?.[idx]);
    const partDuration = Math.round(durationSec / Math.max(1, renderedClips.length));

    try {
      const response = await triggerWorkflow({
        projectId: project.id,
        workflowType: 'scene_synthesis',
        parameters: {
          title: project.title || 'Untitled Film',
          genre: project.genre || 'Sci-Fi',
          scene_number: 1,
          duration_seconds: partDuration,
          shots: [
            {
              id: `part_${idx + 1}`,
              shot_number: `Part ${idx + 1}`,
              action_description: targetShot.title || 'Cinematic shot',
              camera_directive: targetShot.cameraDirective,
              duration: partDuration,
            },
          ],
        },
        interruptOnHumanApproval: false,
      });

      if (response?.result?.rendered_shots?.[0]) {
        const rs = response.result.rendered_shots[0];
        const updated = [...renderedClips];
        updated[idx] = {
          shotNumber: rs.shot_number,
          title: rs.action_description,
          cameraDirective: rs.camera_directive || 'Cinematic composition',
          model: rs.model_used || 'Google Veo 3',
          resolution: `${rs.resolution || '1080p'} • ${rs.fps || 24} FPS`,
          duration: `${rs.duration_seconds || partDuration}s`,
          cost: '₹18',
          videoUrl: rs.video_url,
          thumbnailUrl: rs.thumbnail_url,
        };
        setRenderedClips(updated);
        setSelectedShotIndex(idx);
        setViewMode('shot');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInternalIsGenerating(false);
      setGeneratingPartIdx(null);
    }
  };

  const handleTopGenerate = () => {
    if (onTriggerGenerate) {
      onTriggerGenerate(
        project.logline || project.title || 'Cinematic Film',
        project.genre || 'Sci-Fi',
        project.duration || '1 min'
      );
    }
  };

  return (
    <div
      style={{
        padding: '24px 28px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: '#EDEDED',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Center Video Canvas
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#34D399',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              ● Veo Engine Ready
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: '#9E9EA7', margin: '4px 0 0 0' }}>
            Active project: <strong>"{project.title || 'Untitled Film'}"</strong> • Genre: <span style={{ color: '#A78BFA' }}>{project.genre || 'Sci-Fi'}</span>
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleTopGenerate}
          disabled={isGenerating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.75 : 1,
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          <span>{isGenerating ? 'Rendering Frames...' : 'Generate Full Movie'}</span>
        </button>
      </div>

      {/* Generation Status Indicator */}
      {isGenerating && (
        <div
          style={{
            backgroundColor: '#181822',
            border: '1px solid #7C3AED',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#DDD6FE' }}>
            <Loader2 size={15} className="animate-spin" />
            <span>{activeStage}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#A78BFA' }}>
            {generationProgress}%
          </span>
        </div>
      )}

      {/* 2. Middle Video Formatting Canvas: 16:9 High-Definition Cinematic Player */}
      <div
        style={{
          backgroundColor: '#121216',
          border: '1px solid #23232E',
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Top Video Formatting Badges Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            paddingBottom: '12px',
            borderBottom: '1px solid #1E1E28',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              {currentVideoItem.shotNumber.toUpperCase()}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F1F4' }}>
              {currentVideoItem.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#38BDF8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {currentVideoItem.resolution}
            </span>

            <span
              style={{
                fontSize: '11px',
                color: '#A1A1AA',
                backgroundColor: '#1C1C24',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Runtime: {currentVideoItem.duration}
            </span>
          </div>
        </div>

        {/* 16:9 Video Player Formatting Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            backgroundColor: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #282836',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <Loader2 size={36} color="#8B5CF6" className="animate-spin" />
                <div style={{ fontSize: '13px', color: '#DDD6FE', fontWeight: 600 }}>
                  Neural Diffusion Rendering: Encoding Video Frames...
                </div>
              </div>
            ) : currentVideoItem.videoUrl ? (
              <video
                key={currentVideoItem.videoUrl}
                src={currentVideoItem.videoUrl}
                poster={currentVideoItem.thumbnailUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#71717A',
                }}
              >
                <Film size={40} color="#52525B" />
                <span style={{ fontSize: '13px' }}>Start creating or prompt the Virtual Director on the right panel</span>
              </div>
            )}
          </div>
        </div>

        {/* Under-Player Mode Selector: Full Master Film vs Scene Takes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #1E1E28',
          }}
        >
          {/* Dual Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('master')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: viewMode === 'master' ? '#7C3AED' : '#282834',
                backgroundColor: viewMode === 'master' ? '#7C3AED' : '#181820',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Film size={14} />
              <span>🎬 Full Film Master ({project.duration || '1 min'})</span>
            </button>

            <button
              onClick={() => setViewMode('shot')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: viewMode === 'shot' ? '#7C3AED' : '#282834',
                backgroundColor: viewMode === 'shot' ? '#7C3AED' : '#181820',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Camera size={14} />
              <span>🎞 Individual Takes ({renderedClips.length} Parts)</span>
            </button>
          </div>

          <div style={{ fontSize: '11.5px', color: '#71717A' }}>
            Prompt bar on the right is always active for continuous generation
          </div>
        </div>
      </div>

      {/* 3. Takes / Shot Cards Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
            Individual Part Takes & Directives
          </div>
          <span style={{ fontSize: '11px', color: '#71717A' }}>
            Click any take to format & play in center player
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {renderedClips.map((clip, idx) => {
            const isSelected = viewMode === 'shot' && selectedShotIndex === idx;
            const isPartGenerating = generatingPartIdx === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedShotIndex(idx);
                  setViewMode('shot');
                }}
                style={{
                  backgroundColor: '#131318',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #8B5CF6' : '1px solid #22222E',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(139, 92, 246, 0.25)' : 'none',
                }}
              >
                {/* Authentic Video Thumbnail */}
                <div
                  style={{
                    height: '140px',
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%), url('${clip.thumbnailUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(15, 15, 20, 0.9)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {clip.shotNumber}
                    </span>

                    <span
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                        color: '#FFFFFF',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ Ready
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#BAE6FD' }}>
                        {clip.duration} • 1080P
                      </div>
                    </div>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(124, 58, 237, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      <Play size={12} fill="#FFFFFF" />
                    </div>
                  </div>
                </div>

                {/* Take Info & Dedicated Part Button */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px', lineHeight: '1.3' }}>
                    {clip.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8E8E98', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    CAM: {clip.cameraDirective}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePart(idx);
                    }}
                    disabled={isGenerating}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: '1px solid #333342',
                      backgroundColor: '#1C1C24',
                      color: '#DDD6FE',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.backgroundColor = '#7C3AED';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.backgroundColor = '#1C1C24';
                        e.currentTarget.style.color = '#DDD6FE';
                      }
                    }}
                  >
                    {isPartGenerating ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} color="#A78BFA" />
                    )}
                    <span>
                      {isPartGenerating ? `Generating Part ${idx + 1}...` : `⚡ Generate Part ${idx + 1} (${clip.duration})`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
