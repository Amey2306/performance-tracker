
import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectDeepDiveView } from './components/ProjectDeepDiveView';
import { sampleProjects } from './data/sampleData';
import type { Project, ProjectStatus } from './types';

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
    if (selectedProject && selectedProject.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
  };

  const handleAddProject = (name: string, poc: string) => {
    const newProject: Project = {
      id: Date.now(), // Simple unique ID
      name,
      poc,
      status: 'NA',
      changeLogs: [],
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
        totalBudget: 0,
        receivedBudget: 0,
        otherSpends: 0,
        buffer: 0,
        lnUnitsTarget: 0
      },
      bookingActuals: {
        siteBVAchieved: 0,
        digitalBookings: 0,
        lnBookings: 0,
        digitalBVAchieved: 0,
        lnBVAchieved: 0
      },
      performanceData: [],
      currentPlatforms: []
    };

    setProjects([...projects, newProject]);
  };

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  const handleEditProject = (projectId: number, name: string, poc: string) => {
    setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, name, poc } : p
    ));
  };

  const handleUpdateProjectStatus = (projectId: number, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status } : p
    ));
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header 
        showBackButton={!!selectedProject} 
        onBack={handleBackToDashboard}
        projectName={selectedProject?.name}
      />
      {/* Main container - removed padding on mobile for full width feeling */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden md:container md:mx-auto p-0 md:p-8">
        {!selectedProject ? (
          <div className="p-4 md:p-0">
            <DashboardView 
              projects={projects} 
              onSelectProject={handleSelectProject}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
              onEditProject={handleEditProject}
              onUpdateStatus={handleUpdateProjectStatus}
              onUpdateProject={handleUpdateProject}
            />
          </div>
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
