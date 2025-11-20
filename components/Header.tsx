
import React from 'react';
import { ChartBarIcon, ArrowLeftIcon } from './Icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
  projectName?: string;
}

export const Header: React.FC<HeaderProps> = ({ showBackButton, onBack, projectName }) => {
  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-slate-700/50 shadow-md sticky top-0 z-50 safe-top">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center w-full">
          {showBackButton ? (
            <button 
                onClick={onBack} 
                className="mr-3 p-1 -ml-1 rounded-full hover:bg-slate-700/50 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          ) : (
            <div className="mr-3 p-1.5 bg-brand-primary/10 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-brand-secondary" />
            </div>
          )}
          <h1 className="text-lg md:text-2xl font-bold text-text-primary tracking-tight truncate">
            {showBackButton && projectName ? (
              <span className="flex flex-col md:flex-row md:items-center leading-tight">
                <span className="text-[10px] md:text-sm text-text-secondary font-normal md:mr-2 uppercase tracking-wider">Project</span>
                {projectName}
              </span>
            ) : (
              <>
                Performance <span className="text-brand-secondary">Command Center</span>
              </>
            )}
          </h1>
        </div>
      </div>
    </header>
  );
};
