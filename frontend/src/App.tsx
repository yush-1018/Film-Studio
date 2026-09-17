import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandPalette } from './components/CommandPalette';
import {
  StrategyExplainModal,
  CostOptimizeModal,
  DirectorChatModal,
  FixShotModal,
} from './components/Modals';

import { DashboardPage } from './pages/DashboardPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { DirectorModePage } from './pages/DirectorModePage';
import { StoryScriptPage } from './pages/StoryScriptPage';
import { CharactersPage } from './pages/CharactersPage';
import { StoryboardPage } from './pages/StoryboardPage';
import { GeneratePage } from './pages/GeneratePage';
import { QualityPage } from './pages/QualityPage';
import { AssetsPage } from './pages/AssetsPage';
import { AudioPage } from './pages/AudioPage';
import { TimelinePage } from './pages/TimelinePage';
import { RenderPage } from './pages/RenderPage';

import { initialProject, mockRecentActivities } from './data/mockData';
import { NavigationTab, Shot, Project } from './types/filmStudio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [project, setProject] = useState<Project>(initialProject);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Modal triggers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [inspectedShot, setInspectedShot] = useState<Shot | null>(null);
  const [isCostOptimizeOpen, setIsCostOptimizeOpen] = useState(false);
  const [isDirectorChatOpen, setIsDirectorChatOpen] = useState(false);
  const [fixShotId, setFixShotId] = useState<string | null>(null);

  const handleStartPlanning = (newProjectData: {
    title: string;
    logline: string;
    genre: string;
    duration: string;
    style: string;
    budget: number;
  }) => {
    setProject((prev) => ({
      ...prev,
      title: newProjectData.title,
      logline: newProjectData.logline,
      genre: newProjectData.genre,
      duration: newProjectData.duration,
      budget: newProjectData.budget,
      status: 'Planning',
    }));
    setCurrentTab('director_mode');
  };

  const handleApplyCostOptimization = () => {
    setProject((prev) => ({
      ...prev,
      productionIntelligence: {
        ...prev.productionIntelligence,
        estimatedCost: prev.productionIntelligence.optimizedCost,
        remainingBudget:
          prev.productionIntelligence.totalBudget -
          prev.productionIntelligence.optimizedCost,
        optimizationAvailable: false,
      },
    }));
  };

  const handleFixShotSuccess = () => {
    setProject((prev) => ({
      ...prev,
      qualityScore: 97,
      continuityScore: 98,
    }));
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#F7F7F5' }}>
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
      />

      {/* 2. Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Topbar */}
        <Topbar
          project={project}
          onOpenDirectorMode={() => setCurrentTab('director_mode')}
          onOpenPreview={() => setCurrentTab('timeline')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onSelectTab={setCurrentTab}
        />

        {/* Dynamic Page Routing View */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              project={project}
              activities={mockRecentActivities}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'new_project' && (
            <NewProjectPage
              onStartPlanning={handleStartPlanning}
              onSelectTab={setCurrentTab}
            />
          )}

          {(currentTab === 'projects' || currentTab === 'director_mode') && (
            <DirectorModePage
              project={project}
              onSelectTab={setCurrentTab}
              onOpenDirectorChat={() => setIsDirectorChatOpen(true)}
            />
          )}

          {currentTab === 'script' && (
            <StoryScriptPage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'characters' && (
            <CharactersPage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'storyboard' && (
            <StoryboardPage
              project={project}
              onSelectTab={setCurrentTab}
              onExplainShot={(shot) => setInspectedShot(shot)}
              onOpenCostOptimization={() => setIsCostOptimizeOpen(true)}
            />
          )}

          {currentTab === 'generate' && (
            <GeneratePage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'quality' && (
            <QualityPage
              project={project}
              onSelectTab={setCurrentTab}
              onOpenFixShotModal={(shotId) => setFixShotId(shotId)}
            />
          )}

          {currentTab === 'assets' && <AssetsPage />}

          {currentTab === 'audio' && (
            <AudioPage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelinePage
              project={project}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'render' && (
            <RenderPage project={project} />
          )}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
      />

      <StrategyExplainModal
        shot={inspectedShot}
        onClose={() => setInspectedShot(null)}
      />

      <CostOptimizeModal
        isOpen={isCostOptimizeOpen}
        onClose={() => setIsCostOptimizeOpen(false)}
        onApplyOptimization={handleApplyCostOptimization}
      />

      <DirectorChatModal
        isOpen={isDirectorChatOpen}
        onClose={() => setIsDirectorChatOpen(false)}
      />

      <FixShotModal
        shotId={fixShotId}
        onClose={() => setFixShotId(null)}
        onFixSuccess={handleFixShotSuccess}
      />
    </div>
  );
}
