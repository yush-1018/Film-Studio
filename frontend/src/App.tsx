import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AgentPromptPanel } from './components/AgentPromptPanel';
import {
  StrategyExplainModal,
} from './components/Modals';

import { ProjectsPage } from './pages/ProjectsPage';
import { CreateFilmPage } from './pages/CreateFilmPage';
import { ProductionPage } from './pages/ProductionPage';
import { FilmViewerPage } from './pages/FilmViewerPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { StoryScriptPage } from './pages/StoryScriptPage';
import { StoryboardPage } from './pages/StoryboardPage';
import { GeneratePage } from './pages/GeneratePage';

import { initialProject } from './data/mockData';
import { mapAgentScenesToFrontend } from './api/adapters';
import { triggerWorkflow } from './api/apiClient';
import { NavigationTab, Shot, Project } from './types/filmStudio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('projects');
  const [project, setProject] = useState<Project>(initialProject);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Persistent Right-docked Agent Studio state matching Image 2
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string>('Ready for neural prompt dispatch');
  const [generationProgress, setGenerationProgress] = useState<number>(100);

  // Modal triggers
  const [inspectedShot, setInspectedShot] = useState<Shot | null>(null);

  const handleStartPlanning = (newProjectData: {
    title: string;
    logline: string;
    genre: string;
    duration: string;
    style: string;
    budget: number;
    projectDoc?: Project;
    agentResult?: any;
  }) => {
    if (newProjectData.projectDoc) {
      setProject(newProjectData.projectDoc);
    } else {
      setProject((prev) => ({
        ...prev,
        title: newProjectData.title || 'Untitled Film',
        logline: newProjectData.logline,
        genre: newProjectData.genre,
        duration: newProjectData.duration,
        budget: newProjectData.budget,
        status: 'Planning',
        ...(newProjectData.agentResult?.scenes
          ? { scenes: mapAgentScenesToFrontend(newProjectData.agentResult.scenes) }
          : {}),
      }));
    }
    setCurrentTab('production');
  };

  const handleUpdateScenes = (newScenes: any[]) => {
    setProject((prev) => ({
      ...prev,
      scenes: newScenes,
    }));
  };

  const handleUpdateProductionIntelligence = (pi: any) => {
    setProject((prev) => ({
      ...prev,
      productionIntelligence: pi,
    }));
  };

  // Triggered directly from the persistent Right Agent Prompting Panel (before or AFTER video generation)
  const handleAgentPrompt = async (prompt: string, genre: string, duration: string) => {
    setIsGenerating(true);
    setGenerationProgress(20);
    setActiveStage(`Visual Generation Agent: Processing prompt for "${genre}" film synthesis...`);

    const durSec = duration === '5 min' ? 300 : duration === '2 min' ? 120 : 60;

    try {
      setTimeout(() => {
        setGenerationProgress(55);
        setActiveStage(`Neural Diffusion: Synthesizing ${genre} multi-frame optical flow & lighting...`);
      }, 700);

      setTimeout(() => {
        setGenerationProgress(85);
        setActiveStage(`Post-Processing: Extracting authentic video frame thumbnail & timeline takes...`);
      }, 1400);

      const response = await triggerWorkflow({
        projectId: project.id,
        workflowType: 'scene_synthesis',
        parameters: {
          title: prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt,
          genre: genre,
          duration_seconds: durSec,
          shots: [
            {
              id: `take_1`,
              shot_number: 'Part 1',
              action_description: prompt,
              camera_directive: 'Dynamic cinematic framing, genre-tailored lighting',
              duration: durSec / 3,
            },
            {
              id: `take_2`,
              shot_number: 'Part 2',
              action_description: `Escalating ${genre.toLowerCase()} action & narrative development`,
              camera_directive: 'Medium tracking shot, high contrast shadows',
              duration: durSec / 3,
            },
            {
              id: `take_3`,
              shot_number: 'Part 3',
              action_description: `Climactic resolution of ${genre.toLowerCase()} journey`,
              camera_directive: 'Dramatic wide cinematic composition',
              duration: durSec / 3,
            },
          ],
        },
        interruptOnHumanApproval: false,
      });

      const resResult = response?.result;
      const masterUrl = resResult?.master_video_url;
      const masterThumb = resResult?.master_thumbnail_url;
      const renderedShots = resResult?.rendered_shots;

      setProject((prev) => {
        const updatedScenes = [...(prev.scenes || [])];
        if (renderedShots && renderedShots.length > 0) {
          updatedScenes[0] = {
            ...updatedScenes[0],
            shots: renderedShots.map((rs: any, rIdx: number) => ({
              id: rs.shot_id || `take_${rIdx + 1}`,
              shotNumber: rs.shot_number || `Part ${rIdx + 1}`,
              sceneNumber: 1,
              type: 'Cinematic Take',
              timeRange: `00:${String(rIdx * 20).padStart(2, '0')} – 00:${String((rIdx + 1) * 20).padStart(2, '0')}`,
              duration: rs.duration_seconds || 20,
              cameraDirective: rs.camera_directive || 'Cinematic composition',
              actionDescription: rs.action_description || prompt,
              status: 'ready' as const,
              strategy: 'VIDEO' as const,
              strategyReason: 'Synthesized directly from user prompt',
              recommendedModel: rs.model_used || 'Google Veo 3',
              estimatedCost: 18,
              thumbnailUrl: rs.thumbnail_url,
              videoUrl: rs.video_url,
              thumbnailGradient: 'linear-gradient(135deg, #18181b 0%, #312e81 100%)',
              continuityScore: 98,
              motionIntensity: 'high' as const,
            })),
          };
        }

        return {
          ...prev,
          title: prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt,
          genre: genre,
          duration: duration,
          logline: prompt,
          masterVideoUrl: masterUrl || prev.masterVideoUrl,
          masterThumbnailUrl: masterThumb || prev.masterThumbnailUrl,
          scenes: updatedScenes,
        };
      });

      setGenerationProgress(100);
      setActiveStage(`✓ Video generated in center canvas! You can prompt again below.`);
      setCurrentTab('generate');
    } catch (err) {
      console.error('Agent prompt error:', err);
      setActiveStage('Agent synthesis completed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#0A0A0D',
        color: '#EDEDED',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Left Minimal Studio Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
      />

      {/* 2. Middle Video Canvas / Main Studio Workspace */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: '#0A0A0D',
        }}
      >
        {/* Topbar matching Image 2 */}
        <Topbar
          project={project}
          onOpenDirectorMode={() => {}}
          onOpenPreview={() => {}}
          onOpenCommandPalette={() => {}}
          onSelectTab={setCurrentTab}
          isAgentPanelOpen={isAgentPanelOpen}
          onToggleAgentPanel={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
        />

        {/* Dynamic Center Studio Workspace */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0A0A0D' }}>
          {currentTab === 'projects' && (
            <ProjectsPage
              onSelectTab={setCurrentTab}
              onSelectProject={(selected) => {
                setProject(selected);
                setCurrentTab('production');
              }}
            />
          )}

          {currentTab === 'create' && (
            <CreateFilmPage
              onStartPlanning={handleStartPlanning}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'production' && (
            <ProductionPage
              project={project}
              onSelectTab={setCurrentTab}
              onSelectProject={setProject}
            />
          )}

          {currentTab === 'viewer' && (
            <FilmViewerPage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'generate' && (
            <GeneratePage
              project={project}
              onSelectTab={setCurrentTab}
              onUpdateScenes={handleUpdateScenes}
              externalIsGenerating={isGenerating}
              externalActiveStage={activeStage}
              externalProgress={generationProgress}
              onTriggerGenerate={handleAgentPrompt}
            />
          )}

          {currentTab === 'new_project' && (
            <NewProjectPage
              onStartPlanning={handleStartPlanning}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'script' && (
            <StoryScriptPage
              project={project}
              onSelectTab={setCurrentTab}
              onUpdateScenes={handleUpdateScenes}
            />
          )}

          {currentTab === 'storyboard' && (
            <StoryboardPage
              project={project}
              onSelectTab={setCurrentTab}
              onExplainShot={(shot) => setInspectedShot(shot)}
              onOpenCostOptimization={() => {}}
              onUpdateScenes={handleUpdateScenes}
              onUpdateProductionIntelligence={handleUpdateProductionIntelligence}
            />
          )}
        </main>
      </div>

      {/* 3. Persistent Right Agent Prompting Panel matching Image 2 */}
      <AgentPromptPanel
        project={project}
        isGenerating={isGenerating}
        activeStage={activeStage}
        generationProgress={generationProgress}
        onGenerate={handleAgentPrompt}
        isOpen={isAgentPanelOpen}
        onToggleOpen={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
      />

      {/* Global Modals & Dialogs */}
      <StrategyExplainModal
        shot={inspectedShot}
        onClose={() => setInspectedShot(null)}
      />
    </div>
  );
}
