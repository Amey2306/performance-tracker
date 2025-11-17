import React from 'react';
import { StrategicPlan, GapAnalysisItem, PlatformPlan } from '../types';
import { Dashboard } from './Dashboard';
import { LightbulbIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, TrendingUpIcon } from './Icons';

interface ForecastDisplayProps {
  plan: StrategicPlan;
}

const statusIndicator = (status: GapAnalysisItem['status']) => {
    const commonClasses = "flex items-center px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap";
    switch (status) {
        case 'On Track':
            return <span className={`${commonClasses} bg-green-900 text-green-300`}><CheckCircleIcon className="w-4 h-4 mr-1.5" /> {status}</span>;
        case 'At Risk':
            return <span className={`${commonClasses} bg-yellow-900 text-yellow-300`}><ExclamationIcon className="w-4 h-4 mr-1.5" /> {status}</span>;
        case 'Needs Attention':
            return <span className={`${commonClasses} bg-red-900 text-red-300`}><XCircleIcon className="w-4 h-4 mr-1.5" /> {status}</span>;
        default:
            return <span>{status}</span>;
    }
};

const GapAnalysisTable: React.FC<{ data: GapAnalysisItem[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/80">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Metric</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Target</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Achieved</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Gap</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-slate-700">
                {data.map(item => (
                    <tr key={item.metric}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-text-primary">{item.metric}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.target}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.achieved}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${item.gap.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{item.gap}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{statusIndicator(item.status)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PlatformPlanTable: React.FC<{ data: PlatformPlan[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
             <thead className="bg-slate-800/80">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Platform</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Recommended Budget</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Projected Leads</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Projected Appointments</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Projected CPL</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Projected CPA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Recommendation</th>
                </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-slate-700">
                 {data.map(item => (
                    <tr key={item.platformName}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-text-primary">{item.platformName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-green-400 font-semibold">₹{item.recommendedBudget.toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.projectedLeads}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.projectedAppointments}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.projectedCPL > 0 ? `₹${Math.round(item.projectedCPL).toLocaleString()}` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{item.projectedCPA > 0 ? `₹${Math.round(item.projectedCPA).toLocaleString()}` : 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-text-secondary whitespace-pre-wrap max-w-sm">{item.recommendation}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ plan }) => {
  return (
    <div className="space-y-12 mt-12">
        <h2 className="text-3xl font-bold text-center text-brand-light">AI Strategic Plan & Forecast</h2>
      
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-brand-secondary mb-3 flex items-center"><LightbulbIcon className="w-6 h-6 mr-2" /> AI Performance Summary</h3>
        <p className="text-text-secondary">{plan.performanceSummary}</p>
      </div>
      
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-brand-secondary mb-4">Gap Analysis (Most Recent Week)</h3>
        <GapAnalysisTable data={plan.gapAnalysis} />
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-brand-secondary mb-4 flex items-center"><TrendingUpIcon className="w-6 h-6 mr-2" /> Next Week Forecast</h3>
        <p className="text-text-secondary mb-4">{plan.nextWeekForecast.summary}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Projected Leads</p>
                <p className="text-2xl font-bold text-brand-light">{plan.nextWeekForecast.overallProjectedLeads}</p>
            </div>
             <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Projected Appointments</p>
                <p className="text-2xl font-bold text-brand-light">{plan.nextWeekForecast.overallProjectedAppointments}</p>
            </div>
             <div className="bg-background p-4 rounded-lg col-span-2 md:col-span-1">
                <p className="text-sm text-text-secondary">Required Budget</p>
                <p className="text-2xl font-bold text-brand-light">₹{plan.nextWeekForecast.requiredBudget.toLocaleString()}</p>
            </div>
        </div>
      </div>
            
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-brand-secondary mb-4 text-center">Platform-Wise Strategic Plan</h3>
        <PlatformPlanTable data={plan.platformSpecificPlan} />
      </div>

      <div className="border-t-2 border-brand-primary/20 pt-12">
        <h3 className="text-2xl font-bold text-center mb-6 text-brand-light">Strategic Plan Dashboard</h3>
        <Dashboard strategicPlan={plan} />
      </div>
    </div>
  );
};