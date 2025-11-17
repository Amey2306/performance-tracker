import React, { useState, useMemo } from 'react';
import type { Project, StrategicPlan, PlatformForecast, PerformanceMetrics, WeeklyPerformancePoint } from '../types';
import { getStrategicPlan } from '../services/geminiService';
import { Loader } from './Loader';
import { ForecastDisplay } from './ForecastDisplay';
import { ForecastingSimulator } from './ForecastingSimulator';
import { WandIcon } from './Icons';

interface ProjectDeepDiveViewProps {
  project: Project;
}

const calculateRatios = (achieved: PerformanceMetrics) => {
    const { spends, leads, appointments, walkins } = achieved;
    const cpl = leads > 0 ? spends / leads : 0;
    const cpa = appointments > 0 ? spends / appointments : 0;
    const cpad = walkins > 0 ? spends / walkins : 0;
    const l2w = leads > 0 ? (walkins / leads) * 100 : 0;
    const l2ap = leads > 0 ? (appointments / leads) * 100 : 0;
    const ap2ad = appointments > 0 ? (walkins / appointments) * 100 : 0;
    
    return { cpl, cpa, cpad, l2w, l2ap, ap2ad };
};

const MetricRow: React.FC<{ metric: keyof PerformanceMetrics, data: WeeklyPerformancePoint[] }> = ({ metric, data }) => {
    const displayName = {
        leads: "Leads",
        appointments: "AP",
        walkins: "AD",
        spends: "Spends"
    };

    return (
        <>
            {/* Weekly */}
            <tr className="border-b border-slate-700">
                <td className="py-2 px-3 text-left text-sm font-medium text-text-primary sticky left-0 bg-surface z-10 row-span-2 border-r border-slate-700">{displayName[metric]}</td>
                <td className="py-2 px-3 text-left text-xs text-text-secondary">Weekly</td>
                {data.map(w => (
                    <td key={`${w.week}-w`} className="py-2 px-3 text-right text-sm text-text-secondary">
                        {metric === 'spends' ? '₹' : ''}{w.achieved[metric].toLocaleString()}
                    </td>
                ))}
            </tr>
            {/* Cumulative */}
            <tr className="border-b-2 border-slate-600">
                <td className="py-2 px-3 text-left text-xs text-brand-light">Cumulative</td>
                 {data.map(w => (
                    <td key={`${w.week}-c`} className="py-2 px-3 text-right text-sm font-semibold text-brand-light">
                        {metric === 'spends' ? '₹' : ''}{w.cumulativeAchieved[metric].toLocaleString()}
                    </td>
                ))}
            </tr>
        </>
    );
};

export const ProjectDeepDiveView: React.FC<ProjectDeepDiveViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'plan' | 'simulator'>('performance');
  
  const [forecastPlan, setForecastPlan] = useState<PlatformForecast[] | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StrategicPlan | null>(null);
  
  const handleGeneratePlan = async () => {
    if (!forecastPlan || forecastPlan.length === 0) {
        setError("Please build a forecast in the simulator first.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
        const result = await getStrategicPlan(project, { forecastPlan }, isThinkingMode);
        setPlan(result);
    } catch(e: any) {
        setError(e.message || "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!project) return null;
  
  return (
    <div className="space-y-8">
        <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('performance')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'performance' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                    }`}
                >
                    Performance Tracker
                </button>
                <button
                    onClick={() => setActiveTab('plan')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'plan' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                    }`}
                >
                    Quarterly Plan
                </button>
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'simulator' ? 'border-brand-secondary text-brand-secondary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                    }`}
                >
                    Forecasting Simulator
                </button>
            </nav>
        </div>

        {activeTab === 'performance' && (
            <div className="space-y-8">
                 <h2 className="text-3xl font-bold text-brand-light">Performance Tracker</h2>
                
                {/* Targets Table */}
                <div className="bg-surface rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Targets</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                             <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-text-primary sticky left-0 bg-surface z-10 w-24">Metric</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-text-primary w-24">Type</th>
                                    {project.performanceData.map(w => <th key={w.week} className="py-2 px-3 text-right text-sm font-semibold text-text-secondary whitespace-nowrap">{w.week}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {(['leads', 'appointments', 'walkins', 'spends'] as const).map(metric => (
                                     <React.Fragment key={metric}>
                                        <tr className="border-b border-slate-800">
                                            <td rowSpan={2} className="py-3 px-3 capitalize font-medium border-r border-slate-700 sticky left-0 bg-surface z-10">{metric === 'appointments' ? 'AP' : metric === 'walkins' ? 'AD' : metric}</td>
                                            <td className="py-2 px-3 text-xs text-text-secondary">Weekly</td>
                                            {project.performanceData.map(w => <td key={w.week} className="py-2 px-3 text-right text-text-secondary">{metric === 'spends' ? '₹' : ''}{w.targets[metric].toLocaleString()}</td>)}
                                        </tr>
                                        <tr className="border-b border-slate-700">
                                            <td className="py-2 px-3 text-xs text-brand-light">Cumulative</td>
                                            {project.performanceData.map(w => <td key={w.week} className="py-2 px-3 text-right font-semibold text-brand-light">{metric === 'spends' ? '₹' : ''}{w.cumulativeTargets[metric].toLocaleString()}</td>)}
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Achieved Table */}
                <div className="bg-surface rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Achieved</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-text-primary sticky left-0 bg-surface z-10 w-24">Metric</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-text-primary w-24">Type</th>
                                    {project.performanceData.map(w => <th key={w.week} className="py-2 px-3 text-right text-sm font-semibold text-text-secondary whitespace-nowrap">{w.week}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {(['leads', 'appointments', 'walkins', 'spends'] as const).map(metric => (
                                     <MetricRow key={metric} metric={metric} data={project.performanceData} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Ratios Table */}
                <div className="bg-surface rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Ratios (Based on Weekly Achieved)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-text-primary sticky left-0 bg-surface z-10">Ratio</th>
                                    {project.performanceData.map(w => <th key={w.week} className="py-2 px-3 text-right text-sm font-semibold text-text-secondary whitespace-nowrap">{w.week}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {['cpl', 'cpa', 'cpad', 'l2w', 'l2ap', 'ap2ad'].map(ratioKey => (
                                    <tr key={ratioKey} className="border-b border-slate-800">
                                        <td className="py-2 px-3 font-medium text-text-primary uppercase sticky left-0 bg-surface z-10">{ratioKey}</td>
                                        {project.performanceData.map(w => {
                                            const ratios = calculateRatios(w.achieved);
                                            const value = ratios[ratioKey as keyof typeof ratios];
                                            const isCurrency = ['cpl', 'cpa', 'cpad'].includes(ratioKey);
                                            const isPercent = ['l2w', 'l2ap', 'ap2ad'].includes(ratioKey);
                                            return (
                                                <td key={w.week} className="py-2 px-3 text-right text-text-secondary">
                                                    {isCurrency && '₹'}{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    {isPercent && value.toFixed(2) + '%'}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        )}

        {activeTab === 'plan' && (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-brand-light mb-2">Quarterly Plan Overview</h2>
                    <p className="text-text-secondary">High-level targets and initial platform strategy for the entire quarter.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="bg-surface p-4 rounded-lg shadow-lg">
                        <p className="text-sm text-text-secondary">QTD Budget Plan</p>
                        <p className="text-2xl font-bold text-brand-light">₹{project.qtdBudget.allInPlan.toLocaleString()}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-lg shadow-lg">
                        <p className="text-sm text-text-secondary">QTD Leads Target</p>
                        <p className="text-2xl font-bold text-brand-light">{project.qtdLeads.overallTgt.toLocaleString()}</p>
                    </div>
                     <div className="bg-surface p-4 rounded-lg shadow-lg">
                        <p className="text-sm text-text-secondary">QTD AP Target</p>
                        <p className="text-2xl font-bold text-brand-light">{project.qtdAppointments.target.toLocaleString()}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-lg shadow-lg">
                        <p className="text-sm text-text-secondary">QTD AD Target</p>
                        <p className="text-2xl font-bold text-brand-light">{project.qtdWalkins.target.toLocaleString()}</p>
                    </div>
                </div>

                 {project.quarterlyPlatformPlan.length > 0 ? (
                    <div className="bg-surface rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Platform-Level Target Plan</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-700 text-sm text-text-secondary">
                                        <th className="py-2 px-3 text-left">Platform</th>
                                        <th className="py-2 px-3 text-right">Budget %</th>
                                        <th className="py-2 px-3 text-right">Target CPL</th>
                                        <th className="py-2 px-3 text-right">Leads</th>
                                        <th className="py-2 px-3 text-right">Spends</th>
                                        <th className="py-2 px-3 text-right">Appointments</th>
                                        <th className="py-2 px-3 text-right">Walk-ins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.quarterlyPlatformPlan.map(p => (
                                        <tr key={p.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="py-2 px-3 font-medium text-text-primary">{p.name}</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">{p.budgetPercent}%</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">₹{p.targetCPL.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">{p.leads.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">₹{p.spends.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">{p.capi.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-text-secondary">{p.walkins.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </div>
        )}

        {activeTab === 'simulator' && (
             <div className="space-y-8">
                <div className="bg-surface rounded-xl shadow-lg p-6 border-t-4 border-brand-primary">
                    <h2 className="text-3xl font-bold text-brand-light mb-2">Forecasting Simulator</h2>
                    <p className="text-text-secondary mb-6">Build your plan for the next week. The AI will then analyze your strategy.</p>
                    
                    <ForecastingSimulator project={project} onForecastUpdate={setForecastPlan} />

                    <div className="flex items-center justify-between my-6 pt-6 border-t border-slate-700">
                        <label htmlFor="thinking-mode" className="font-medium text-text-primary flex items-center">
                            Enable Thinking Mode 
                            <span className="ml-2 text-xs font-normal bg-brand-dark text-brand-light px-2 py-0.5 rounded-full">Uses gemini-2.5-pro for deeper analysis</span>
                        </label>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="thinking-mode" className="sr-only peer" checked={isThinkingMode} onChange={(e) => setIsThinkingMode(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </div>
                    </div>

                    <button
                        onClick={handleGeneratePlan}
                        disabled={isLoading || !forecastPlan || forecastPlan.length === 0}
                        className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        <WandIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Generating Analysis...' : 'Generate Strategic Analysis'}
                    </button>
                    {!forecastPlan || forecastPlan.length === 0 && <p className="text-center text-xs text-text-secondary mt-2">Create a forecast above to enable analysis.</p>}
                </div>
                
                {error && (
                    <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                        <p><strong>Analysis Failed:</strong> {error}</p>
                    </div>
                )}

                {isLoading && <div className="mt-12"><Loader /></div>}

                {plan && !isLoading && <ForecastDisplay plan={plan} />}
            </div>
        )}
    </div>
  );
};
