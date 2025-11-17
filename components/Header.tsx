import React from 'react';
import { ChartBarIcon, ArrowLeftIcon } from './Icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
  projectName?: string;
}

export const Header: React.FC<HeaderProps> = ({ showBackButton, onBack, projectName }) => {
  return (
    <header className="bg-surface/80 backdrop-blur-sm shadow-md p-4 sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <button onClick={onBack} className="mr-4 text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          ) : (
            <ChartBarIcon className="w-8 h-8 text-brand-secondary mr-3" />
          )}
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            {showBackButton && projectName ? (
              <>
                <span className="hidden md:inline text-text-secondary font-normal">Project: </span>{projectName}
              </>
            ) : (
              <>
                Performance Marketing <span className="text-brand-secondary">Command Center</span>
              </>
            )}
          </h1>
        </div>
      </div>
    </header>
  );
};