
import React, { useState, useMemo } from 'react';
import type { Project } from '../types';
import { PlusIcon, XCircleIcon } from './Icons';

interface DashboardViewProps {
  projects: Project[];
  onSelectProject: (projectId: number) => void;
  onAddProject: (name: string, poc: string) => void;
}

const StatCard: React.FC<{ title: string; value: string; percentage?: string; isCurrency?: boolean }> = ({ title, value, percentage, isCurrency }) => (
    <div className="bg-background p-4 rounded-lg border border-slate-700/50">
        <p className="text-sm text-text-secondary mb-1">{title}</p>
        <p className="text-2xl font-bold text-brand-light">
            {isCurrency && '₹'}{value}
        </p>
        {percentage && <p className="text-xs font-medium text-green-400 mt-1">{percentage} Delivery</p>}
    </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ projects, onSelectProject, onAddProject }) => {
  const [selectedPoc, setSelectedPoc] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPoc, setNewProjectPoc] = useState('');

  const pocs = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.poc)))], [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedPoc === 'All') return projects;
    return projects.filter(p => p.poc === selectedPoc);
  }, [projects, selectedPoc]);

  const totals = useMemo(() => {
     return filteredProjects.reduce((acc, p) => {
        // Aggregate Actuals from Performance Data
        const actuals = p.performanceData.reduce((sum, week) => ({
            spends: sum.spends + week.achieved.spends,
            leads: sum.leads + week.achieved.leads,
            appointments: sum.appointments + week.achieved.appointments,
            walkins: sum.walkins + week.achieved.walkins,
        }), { spends: 0, leads: 0, appointments: 0, walkins: 0 });

        // Aggregate Targets from Quarterly Plan
        const plan = p.quarterlyBusinessPlan;
        
        // We rely on the Business Plan for high level targets if available, 
        // otherwise fall back to sum of weekly targets if plan is 0 (e.g. incomplete setup)
        const weeklyTargetSum = p.performanceData.reduce((sum, week) => ({
            leads: sum.leads + week.targets.leads,
            walkins: sum.walkins + week.targets.walkins,
            appointments: sum.appointments + week.targets.appointments
        }), { leads: 0, walkins: 0, appointments: 0 });

        const targetBudget = plan.totalBudget || 0;
        const targetLeads = plan.leadsTarget || weeklyTargetSum.leads;
        const targetWalkins = plan.walkinsTarget || weeklyTargetSum.walkins;
        const targetAppts = weeklyTargetSum.appointments; // AP usually derived weekly

        acc.allInPlan += targetBudget;
        acc.totalSpends += actuals.spends;
        acc.leadsTgt += targetLeads;
        acc.leadsAch += actuals.leads;
        acc.walkinsTgt += targetWalkins;
        acc.walkinsAch += actuals.walkins;
        acc.apptTgt += targetAppts; 
        acc.apptAch += actuals.appointments;
        return acc;
    }, { allInPlan: 0, totalSpends: 0, leadsTgt: 0, leadsAch: 0, walkinsTgt: 0, walkinsAch: 0, apptTgt: 0, apptAch: 0});
  }, [filteredProjects]);

  const handleCreateProject = (e: React.FormEvent) => {
      e.preventDefault();
      if (newProjectName && newProjectPoc) {
          onAddProject(newProjectName, newProjectPoc);
          setNewProjectName('');
          setNewProjectPoc('');
          setIsModalOpen(false);
      }
  };

  const formatCurrency = (val: number) => {
      if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
      return val.toLocaleString();
  };

  const formatNumber = (val: number) => {
      if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
      return val.toLocaleString();
  };

  return (
    <div className="space-y-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-brand-light mb-2">QTD Performance Dashboard</h2>
                <p className="text-text-secondary">High-level overview of all active projects. Click a project name for a detailed weekly deep-dive.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg shadow-lg transition-colors font-semibold"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Project
            </button>
        </div>

        <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Overall Portfolio Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <StatCard title="Actual Spends" value={formatCurrency(totals.totalSpends)} isCurrency />
                <StatCard title="Total Budget" value={formatCurrency(totals.allInPlan)} isCurrency />
                 <StatCard 
                    title="Leads" 
                    value={formatNumber(totals.leadsAch)}
                    percentage={totals.leadsTgt > 0 ? ((totals.leadsAch / totals.leadsTgt) * 100).toFixed(1) + '%' : '0%'} 
                 />
                 <StatCard 
                    title="Walkins (AD)" 
                    value={formatNumber(totals.walkinsAch)}
                    percentage={totals.walkinsTgt > 0 ? ((totals.walkinsAch / totals.walkinsTgt) * 100).toFixed(1) + '%' : '0%'}
                 />
                 <StatCard 
                    title="Appointments (AP)" 
                    value={formatNumber(totals.apptAch)}
                    percentage={totals.apptTgt > 0 ? ((totals.apptAch / totals.apptTgt) * 100).toFixed(1) + '%' : '0%'}
                 />
            </div>
        </div>

        <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700">
            <div className="flex items-center mb-6 justify-between">
                <h3 className="text-lg font-bold text-brand-light">Project Performance</h3>
                <div className="flex items-center">
                    <label htmlFor="poc-slicer" className="text-sm font-medium text-text-secondary mr-3">Filter by POC:</label>
                    <select 
                        id="poc-slicer"
                        value={selectedPoc}
                        onChange={(e) => setSelectedPoc(e.target.value)}
                        className="bg-background border border-slate-600 rounded-md py-1 px-3 text-text-primary focus:ring-1 focus:ring-brand-secondary outline-none"
                    >
                        {pocs.map(poc => <option key={poc} value={poc}>{poc}</option>)}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">POC</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Project</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Spends (Act / Tgt)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">% Spent</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Leads (Act / Tgt)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">% Del</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">AD (Act / Tgt)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">% Del</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-slate-700">
                        {filteredProjects.map(p => {
                            const actuals = p.performanceData.reduce((sum, week) => ({
                                spends: sum.spends + week.achieved.spends,
                                leads: sum.leads + week.achieved.leads,
                                appointments: sum.appointments + week.achieved.appointments,
                                walkins: sum.walkins + week.achieved.walkins,
                            }), { spends: 0, leads: 0, appointments: 0, walkins: 0 });
                            
                            const plan = p.quarterlyBusinessPlan;
                            
                            const targetBudget = plan.totalBudget > 0 ? plan.totalBudget : p.performanceData.reduce((s, w) => s + w.targets.spends, 0);
                            const targetLeads = plan.leadsTarget > 0 ? plan.leadsTarget : p.performanceData.reduce((s, w) => s + w.targets.leads, 0);
                            const targetWalkins = plan.walkinsTarget > 0 ? plan.walkinsTarget : p.performanceData.reduce((s, w) => s + w.targets.walkins, 0);

                            const spendPercent = targetBudget > 0 ? ((actuals.spends / targetBudget) * 100).toFixed(1) + '%' : '0%';
                            const leadsPercent = targetLeads > 0 ? ((actuals.leads / targetLeads) * 100).toFixed(1) + '%' : '0%';
                            const walkinsPercent = targetWalkins > 0 ? ((actuals.walkins / targetWalkins) * 100).toFixed(1) + '%' : '0%';
                            
                            return (
                                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary font-medium">{p.poc}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-brand-light">
                                        <button onClick={() => onSelectProject(p.id)} className="hover:text-brand-secondary hover:underline transition-all">{p.name}</button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">
                                        {formatCurrency(actuals.spends)} <span className="text-text-secondary text-xs">/ {formatCurrency(targetBudget)}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{spendPercent}</td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                                        {actuals.leads.toLocaleString()} <span className="text-text-secondary font-normal text-xs">/ {targetLeads.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{leadsPercent}</td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                                        {actuals.walkins.toLocaleString()} <span className="text-text-secondary font-normal text-xs">/ {targetWalkins.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{walkinsPercent}</td>
                                </tr>
                            )
                        })}
                        {filteredProjects.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">No projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Add Project Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md border border-slate-700 animate-fadeIn">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h3 className="text-lg font-bold text-brand-light">Add New Project</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                            <input 
                                type="text" 
                                required
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. Godrej Woods"
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-secondary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">POC Name</label>
                            <input 
                                type="text" 
                                required
                                value={newProjectPoc}
                                onChange={(e) => setNewProjectPoc(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-secondary outline-none"
                            />
                        </div>
                        <div className="pt-4 flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-text-secondary hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold shadow-lg transition-colors"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}
