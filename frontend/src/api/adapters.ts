import { Scene, Shot } from '../types/filmStudio';

export function mapAgentScenesToFrontend(agentScenes: any[]): Scene[] {
  if (!agentScenes || !Array.isArray(agentScenes)) return [];

  let accumulatedSeconds = 0;

  return agentScenes.map((s, idx) => {
    const sceneStart = accumulatedSeconds;
    const sceneDuration = s.duration || 15;
    accumulatedSeconds += sceneDuration;

    const startMin = Math.floor(sceneStart / 60);
    const startSec = Math.floor(sceneStart % 60);
    const endMin = Math.floor(accumulatedSeconds / 60);
    const endSec = Math.floor(accumulatedSeconds % 60);

    const fmt = (m: number, sec: number) =>
      `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const sceneTimeRange = `${fmt(startMin, startSec)} – ${fmt(endMin, endSec)}`;

    let shotAccumulated = sceneStart;

    const mappedShots: Shot[] = (s.shots || []).map((sh: any, shIdx: number) => {
      const shotDur = sh.duration || 4;
      const shotStart = shotAccumulated;
      shotAccumulated += shotDur;

      const sStartMin = Math.floor(shotStart / 60);
      const sStartSec = Math.floor(shotStart % 60);
      const sEndMin = Math.floor(shotAccumulated / 60);
      const sEndSec = Math.floor(shotAccumulated % 60);
      const shotTimeRange = `${fmt(sStartMin, sStartSec)} – ${fmt(sEndMin, sEndSec)}`;

      return {
        id: sh.id || `sh_${idx + 1}_${shIdx + 1}`,
        shotNumber: sh.shot_number || sh.shotNumber || `Shot ${idx + 1}.${shIdx + 1}`,
        sceneNumber: s.scene_number || s.sceneNumber || idx + 1,
        type: sh.shot_type || sh.type || 'Wide Shot',
        timeRange: shotTimeRange,
        duration: shotDur,
        cameraDirective: sh.camera_directive || sh.cameraDirective || '',
        actionDescription: sh.action_description || sh.actionDescription || '',
        dialogueSpeaker: sh.dialogue_speaker || sh.dialogueSpeaker,
        dialogueText: sh.dialogue_text || sh.dialogueText,
        audioCue: sh.audio_cue || sh.audioCue,
        status: 'ready',
        strategy: sh.strategy || 'VIDEO',
        strategyReason:
          sh.strategy_reason ||
          sh.strategyReason ||
          'Cinematic dynamics verified by Production Intelligence',
        recommendedModel: sh.recommended_model || sh.recommendedModel || 'Veo 3',
        estimatedCost: sh.estimated_cost || sh.estimatedCost || 18,
        thumbnailUrl:
          sh.thumbnail_url ||
          sh.thumbnailUrl ||
          '/generated_videos/gen_proj_test_1_sh_1_1.jpg',
        thumbnailGradient:
          sh.thumbnail_gradient ||
          sh.thumbnailGradient ||
          'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        continuityScore: sh.continuity_score || sh.continuityScore || 96,
        motionIntensity: (sh.motion_intensity || sh.motionIntensity || 'medium') as any,
        videoUrl: sh.video_url || sh.videoUrl,
      };

    });

    return {
      id: s.id || `sc_${idx + 1}`,
      sceneNumber: s.scene_number || s.sceneNumber || idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      timeRange: sceneTimeRange,
      duration: sceneDuration,
      slugline: s.slugline || s.heading || 'INT. SCENE – NIGHT',
      description: s.description || s.narrative_summary || '',
      shots: mappedShots,
      status: 'ready',
      fountainScript: s.fountain_script || s.fountainScript,
    };
  });
}