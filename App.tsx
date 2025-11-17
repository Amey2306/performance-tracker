import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectDeepDiveView } from './components/ProjectDeepDiveView';
import { sampleProjects } from './data/sampleData';
import type { Project } from './types';

const App: React.FC = () => {
  const [projects] = useState<Project[]>(sampleProjects);
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
          />
        ) : (
          <ProjectDeepDiveView project={selectedProject} />
        )}
      </main>
    </div>
  );
};

export default App;