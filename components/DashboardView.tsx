import React, { useState, useMemo } from 'react';
import type { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
  onSelectProject: (projectId: number) => void;
}

const StatCard: React.FC<{ title: string; value: string; percentage?: string; isCurrency?: boolean }> = ({ title, value, percentage, isCurrency }) => (
    <div className="bg-background p-4 rounded-lg">
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-brand-light">
            {isCurrency && '₹'}{value}
        </p>
        {percentage && <p className="text-sm text-green-400">{percentage} Delivery</p>}
    </div>
);


export const DashboardView: React.FC<DashboardViewProps> = ({ projects, onSelectProject }) => {
  const [selectedPoc, setSelectedPoc] = useState('All');

  const pocs = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.poc)))], [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedPoc === 'All') return projects;
    return projects.filter(p => p.poc === selectedPoc);
  }, [projects, selectedPoc]);

  const totals = useMemo(() => {
     return filteredProjects.reduce((acc, p) => {
        acc.allInPlan += p.qtdBudget.allInPlan;
        acc.totalSpends += p.qtdBudget.totalSpends;
        acc.leadsTgt += p.qtdLeads.overallTgt;
        acc.leadsAch += p.qtdLeads.achieved;
        acc.apptTgt += p.qtdAppointments.target;
        acc.apptAch += p.qtdAppointments.achieved;
        return acc;
    }, { allInPlan: 0, totalSpends: 0, leadsTgt: 0, leadsAch: 0, apptTgt: 0, apptAch: 0});
  }, [filteredProjects]);

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-brand-light mb-2">QTD Performance Dashboard</h2>
            <p className="text-text-secondary">High-level overview of all active projects. Click a project name for a detailed weekly deep-dive.</p>
        </div>

        <div className="bg-surface rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <StatCard title="Total Spends" value={totals.totalSpends.toLocaleString()} isCurrency />
                <StatCard title="Total Budget" value={totals.allInPlan.toLocaleString()} isCurrency />
                 <StatCard 
                    title="Leads" 
                    value={totals.leadsAch.toLocaleString()}
                    percentage={totals.leadsTgt > 0 ? ((totals.leadsAch / totals.leadsTgt) * 100).toFixed(2) + '%' : '0%'} 
                 />
                 <StatCard 
                    title="Appointments" 
                    value={totals.apptAch.toLocaleString()}
                    percentage={totals.apptTgt > 0 ? ((totals.apptAch / totals.apptTgt) * 100).toFixed(2) + '%' : '0%'}
                 />
            </div>
        </div>

        <div className="bg-surface rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
                <label htmlFor="poc-slicer" className="text-sm font-medium text-text-secondary mr-4">Filter by POC:</label>
                <select 
                    id="poc-slicer"
                    value={selectedPoc}
                    onChange={(e) => setSelectedPoc(e.target.value)}
                    className="bg-background border border-slate-600 rounded-md py-1 px-3 text-text-primary focus:ring-2 focus:ring-brand-secondary"
                >
                    {pocs.map(poc => <option key={poc} value={poc}>{poc}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            {['POC', 'Project', 'Total Spends', '% Spent', 'Leads', '% Delivery', 'Appointments', '% Delivery'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-slate-700">
                        {filteredProjects.map(p => {
                            const spendPercent = p.qtdBudget.allInPlan > 0 ? ((p.qtdBudget.totalSpends / p.qtdBudget.allInPlan) * 100).toFixed(2) + '%' : '0%';
                            const leadsPercent = p.qtdLeads.overallTgt > 0 ? ((p.qtdLeads.achieved / p.qtdLeads.overallTgt) * 100).toFixed(2) + '%' : '0%';
                            const apptPercent = p.qtdAppointments.target > 0 ? ((p.qtdAppointments.achieved / p.qtdAppointments.target) * 100).toFixed(2) + '%' : '0%';
                            return (
                                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{p.poc}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-brand-light">
                                        <button onClick={() => onSelectProject(p.id)} className="hover:underline">{p.name}</button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">₹{p.qtdBudget.totalSpends.toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{spendPercent}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">{p.qtdLeads.achieved.toLocaleString()} / {p.qtdLeads.overallTgt.toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{leadsPercent}</td>
                                     <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">{p.qtdAppointments.achieved.toLocaleString()} / {p.qtdAppointments.target.toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{apptPercent}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}
