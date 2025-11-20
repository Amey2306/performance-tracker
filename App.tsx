
import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectDeepDiveView } from './components/ProjectDeepDiveView';
import { sampleProjects } from './data/sampleData';
import type { Project } from './types';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
  };

  // New function to update a specific project in the master list
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    // Also update the currently selected project to ensure the view stays in sync
    setSelectedProject(updatedProject);
  };

  const handleAddProject = (name: string, poc: string) => {
    const newProject: Project = {
      id: Date.now(), // Simple unique ID
      name,
      poc,
      quarterlyBusinessPlan: {
        overallBV: 0,
        digitalContributionPercent: 10,
        ats: 0,
        walkinToBookingRatio: 5.0,
        leadToWalkinRatio: 3.0,
        targetCPL: 2000,
        digitalUnitsTarget: 0,
        walkinsTarget: 0,
        leadsTarget: 0,
        totalBudget: 0
      },
      performanceData: [],
      currentPlatforms: []
    };

    setProjects([...projects, newProject]);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header 
        showBackButton={!!selectedProject} 
        onBack={handleBackToDashboard}
        projectName={selectedProject?.name}
      />
      <main className="container mx-auto p-4 md:p-8">
        {!selectedProject ? (
          <DashboardView 
            projects={projects} 
            onSelectProject={handleSelectProject}
            onAddProject={handleAddProject}
          />
        ) : (
          <ProjectDeepDiveView 
            project={selectedProject} 
            onUpdateProject={handleUpdateProject}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
};

export default App;
