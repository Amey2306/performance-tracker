
import React, { useState, useEffect } from 'react';
import type { Project, StrategicPlan, PlatformForecast, QuarterlyBusinessPlan, WeeklyPerformancePoint, ChangeLogEntry } from '../types';
import { getStrategicPlan } from '../services/geminiService';
import { Loader } from './Loader';
import { ForecastDisplay } from './ForecastDisplay';
import { ForecastingSimulator } from './ForecastingSimulator';
import { QuarterlyPlan } from './QuarterlyPlan';
import { PerformanceTracker } from './PerformanceTracker';
import { WeeklyPlanning } from './WeeklyPlanning';
import { WandIcon, ClockIcon, XCircleIcon } from './Icons';

interface ProjectDeepDiveViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack: () => void;
}

export const ProjectDeepDiveView: React.FC<ProjectDeepDiveViewProps> = ({ project, onUpdateProject, onBack }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'weekly' | 'performance' | 'simulator'>('plan');
  
  // State for Quarterly Plan
  const [businessPlan, setBusinessPlan] = useState<QuarterlyBusinessPlan>(project.quarterlyBusinessPlan);
  
  // State for Performance Data
  const [performanceData, setPerformanceData] = useState<WeeklyPerformancePoint[]>(project.performanceData);

  // State for Forecast
  const [forecastPlan, setForecastPlan] = useState<PlatformForecast[] | null>(null);
  
  // AI State
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StrategicPlan | null>(null);

  // Log State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  useEffect(() => {
    // When project prop changes, sync state, but maintain tab if reasonable or reset
    setBusinessPlan(project.quarterlyBusinessPlan);
    setPerformanceData(project.performanceData);
    
    // Only if switching to a completely different project ID (not just an update) do we reset tab
    // In this app structure, onBack resets selection, so this effect runs on mount mainly.
    setForecastPlan(null); 
    setPlan(null); 
  }, [project]);

  const createLogEntry = (description: string): ChangeLogEntry => ({
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      description,
      user: 'User' // Can be dynamic if auth is added
  });

  const handleCommitForecast = (forecast: PlatformForecast[]) => {
      const totals = forecast.reduce((acc, p) => ({
          leads: acc.leads + p.leads,
          appointments: acc.appointments + p.projectedAppointments,
          walkins: acc.walkins + p.projectedWalkins,
          spends: acc.spends + p.spends
      }), { leads: 0, appointments: 0, walkins: 0, spends: 0 });

      // Add new week
      const nextWeekNum = performanceData.length + 1;
      const newWeek = {
          weekLabel: `W${nextWeekNum} (Forecast)`,
          startDate: "Future",
          endDate: "Week",
          targets: totals,
          achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 }
      };
      
      const newPerformanceData = [...performanceData, newWeek];
      setPerformanceData(newPerformanceData);
      
      // Persist to App State
      onUpdateProject({
        ...project,
        performanceData: newPerformanceData,
        changeLogs: [createLogEntry("Committed new forecast to Performance Tracker"), ...project.changeLogs]
      });

      setActiveTab('performance');
      alert("Forecast committed as a new week target in Performance Tracker.");
  };

  const handleBusinessPlanUpdate = (newPlan: QuarterlyBusinessPlan) => {
    setBusinessPlan(newPlan);
    // Persist to App State
    onUpdateProject({
        ...project,
        quarterlyBusinessPlan: newPlan,
        changeLogs: [createLogEntry("Updated Quarterly Strategic Plan"), ...project.changeLogs]
    });
  };

  const handleWeeklyPlanSave = (newData: WeeklyPerformancePoint[]) => {
      setPerformanceData(newData);
      // Persist to App State
      onUpdateProject({
          ...project,
          performanceData: newData,
          changeLogs: [createLogEntry("Updated Weekly Plan & Distribution"), ...project.changeLogs]
      });
      setActiveTab('performance');
  };

  const handlePerformanceUpdate = (index: number, field: 'leads' | 'appointments' | 'walkins' | 'spends', value: number) => {
      const newData = [...performanceData];
      if (newData[index]) {
          newData[index] = {
              ...newData[index],
              achieved: {
                  ...newData[index].achieved,
                  [field]: value
              }
          };
          setPerformanceData(newData);
          onUpdateProject({
              ...project,
              performanceData: newData
              // Note: We don't log every cell edit to avoid spamming logs
          });
      }
  };

  const handlePerformanceBulkUpdate = (newData: WeeklyPerformancePoint[]) => {
      setPerformanceData(newData);
      onUpdateProject({
          ...project,
          performanceData: newData,
          changeLogs: [createLogEntry("Bulk uploaded Performance Tracker data from Excel"), ...project.changeLogs]
      });
      alert("Performance data updated successfully from Excel.");
  };

  const handleGenerateAIAnalysis = async () => {
    if (!forecastPlan || forecastPlan.length === 0) return;
    setIsLoading(true);
    setError(null);
    
    // Construct a context object that includes the business goals
    const projectContext = {
        ...project,
        quarterlyBusinessPlan: businessPlan,
        performanceData: performanceData
    };

    try {
        const result = await getStrategicPlan(projectContext, { forecastPlan }, isThinkingMode);
        setPlan(result);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header Actions (Logs) */}
        <div className="flex justify-end px-4 md:px-0">
            <button 
                onClick={() => setIsLogModalOpen(true)}
                className="flex items-center text-sm font-medium text-text-secondary hover:text-brand-secondary transition-colors"
            >
                <ClockIcon className="w-4 h-4 mr-2" />
                View Change Logs
            </button>
        </div>

        {/* Navigation Tabs - Scrollable on mobile */}
        <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur-xl pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent border-b border-slate-800 md:border-none">
            <div className="flex overflow-x-auto space-x-1 bg-slate-800/50 p-1 rounded-lg w-full md:w-fit no-scrollbar snap-x snap-mandatory">
                 {(['plan', 'weekly', 'performance', 'simulator'] as const).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 snap-center px-6 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === tab 
                            ? 'bg-brand-secondary text-white shadow-lg' 
                            : 'text-text-secondary hover:text-white hover:bg-slate-700'
                        }`}
                     >
                        {tab === 'plan' && 'Quarterly Plan'}
                        {tab === 'weekly' && 'Weekly Planning'}
                        {tab === 'performance' && 'Performance Tracker'}
                        {tab === 'simulator' && 'Simulator'}
                     </button>
                 ))}
            </div>
        </div>

        <div className="min-h-[600px] pb-12 px-4 md:px-0">
            {activeTab === 'plan' && (
                <div className="space-y-6 animate-fadeIn">
                     <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-light">Quarterly Strategic Plan</h2>
                        <p className="text-text-secondary mt-1 text-sm md:text-base">Define overall business value targets and derive unit goals based on conversion ratios.</p>
                    </div>
                    <QuarterlyPlan 
                        plan={businessPlan} 
                        onUpdate={handleBusinessPlanUpdate} 
                        onBack={onBack}
                    />
                </div>
            )}

            {activeTab === 'weekly' && (
                <div className="space-y-6 animate-fadeIn">
                    <WeeklyPlanning 
                        quarterlyPlan={businessPlan} 
                        currentData={performanceData}
                        onSave={handleWeeklyPlanSave}
                    />
                </div>
            )}

            {activeTab === 'performance' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                         <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-light">Performance Tracker</h2>
                            <p className="text-text-secondary mt-1 text-sm md:text-base">Week-on-Week analysis of Targets vs Achieved. Yellow cells are editable inputs.</p>
                        </div>
                    </div>
                    <PerformanceTracker 
                        data={performanceData} 
                        onUpdate={handlePerformanceUpdate}
                        onBulkUpdate={handlePerformanceBulkUpdate}
                    />
                </div>
            )}

            {activeTab === 'simulator' && (
                <div className="space-y-8 animate-fadeIn">
                     <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-light">Forecasting Simulator</h2>
                        <p className="text-text-secondary mt-1 text-sm md:text-base">Build your weekly media plan by platform. Optimize for budget and CPL to hit lead targets.</p>
                    </div>
                    
                    <ForecastingSimulator 
                        project={project} 
                        onForecastUpdate={setForecastPlan} 
                        onCommitPlan={handleCommitForecast}
                    />

                    {/* AI Analysis Section */}
                    <div className="border-t border-slate-700 pt-8 mb-12">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                             <h3 className="text-xl md:text-2xl font-bold text-brand-light flex items-center">
                                <WandIcon className="w-6 h-6 mr-3 text-brand-secondary" />
                                AI Strategic Advisor
                             </h3>
                             <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg">
                                <span className="text-sm text-text-secondary">Thinking Mode</span>
                                <input 
                                    type="checkbox" 
                                    checked={isThinkingMode} 
                                    onChange={e => setIsThinkingMode(e.target.checked)}
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-500 text-brand-secondary focus:ring-brand-secondary" 
                                />
                             </div>
                        </div>
                        
                        <button
                            onClick={handleGenerateAIAnalysis}
                            disabled={isLoading || !forecastPlan}
                            className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                        >
                            {isLoading ? 'Analyzing Scenario...' : 'Analyze Forecast with AI'}
                        </button>

                        {error && <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-800">{error}</div>}
                        {isLoading && <div className="mt-8"><Loader /></div>}
                        {plan && !isLoading && <div className="mt-8"><ForecastDisplay plan={plan} /></div>}
                    </div>
                </div>
            )}
        </div>

        {/* LOGS MODAL */}
        {isLogModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg border border-slate-600 animate-slideUp flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                        <h3 className="text-lg font-bold text-brand-light flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2 text-brand-secondary" /> Change Logs
                        </h3>
                        <button onClick={() => setIsLogModalOpen(false)} className="text-text-secondary hover:text-white transition-colors">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                        {project.changeLogs && project.changeLogs.length > 0 ? (
                            project.changeLogs.map((log) => (
                                <div key={log.id} className="flex items-start space-x-3 border-b border-slate-700/50 pb-3 last:border-0">
                                    <div className="mt-1 bg-brand-secondary/20 p-1.5 rounded-full">
                                        <ClockIcon className="w-3 h-3 text-brand-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{log.description}</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{log.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-text-secondary italic">No changes recorded yet.</div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
