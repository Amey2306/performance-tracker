
import React from 'react';
import { QuarterlyBusinessPlan } from '../types';
import { SaveIcon } from './Icons';

interface QuarterlyPlanProps {
    plan: QuarterlyBusinessPlan;
    onUpdate: (newPlan: QuarterlyBusinessPlan) => void;
    onBack: () => void;
}

export const QuarterlyPlan: React.FC<QuarterlyPlanProps> = ({ plan, onUpdate, onBack }) => {
    
    const handleChange = (field: keyof QuarterlyBusinessPlan, value: string) => {
        const numVal = parseFloat(value) || 0;
        const updatedPlan = { ...plan, [field]: numVal };

        // Recalculate Funnel Automatically
        // 1. Digital Revenue Target (Cr) = Overall BV * (Digital Contribution % / 100)
        const digitalRevenue = updatedPlan.overallBV * (updatedPlan.digitalContributionPercent / 100);
        
        // 2. Digital Units = Digital Revenue / ATS
        // Guard against divide by zero
        const digitalUnits = updatedPlan.ats > 0 ? digitalRevenue / updatedPlan.ats : 0;
        
        // 3. Walkins (AD) = Digital Units / (WTB% / 100)
        const wtbDecimal = (updatedPlan.walkinToBookingRatio || 1) / 100;
        const walkins = digitalUnits / wtbDecimal;
        
        // 4. Leads = Walkins / (LTW% / 100)
        const ltwDecimal = (updatedPlan.leadToWalkinRatio || 1) / 100;
        const leads = walkins / ltwDecimal;
        
        // 5. Budget = Leads * CPL
        const budget = leads * updatedPlan.targetCPL;

        onUpdate({
            ...updatedPlan,
            digitalUnitsTarget: Math.round(digitalUnits * 100) / 100,
            walkinsTarget: Math.round(walkins),
            leadsTarget: Math.round(leads),
            totalBudget: Math.round(budget)
        });
    };

    const formatCurrency = (val: number) => {
        if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
        return val.toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: Strategic Inputs */}
                <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-brand-light mb-4 border-b border-slate-700 pb-2">1. Strategic Inputs (Edit Me)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-brand-secondary uppercase tracking-wider mb-1">Overall Project BV (Cr)</label>
                            <input 
                                type="number" 
                                value={plan.overallBV} 
                                onChange={(e) => handleChange('overallBV', e.target.value)}
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-secondary focus:outline-none font-bold text-lg"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">Total Project Business Value Target</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-brand-secondary uppercase tracking-wider mb-1">Avg. Ticket Size (Cr)</label>
                            <input 
                                type="number" 
                                value={plan.ats} 
                                onChange={(e) => handleChange('ats', e.target.value)}
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-secondary focus:outline-none font-bold text-lg"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">Cost per Unit</p>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-brand-secondary uppercase tracking-wider mb-1">Digital Contribution (%)</label>
                            <input 
                                type="number" 
                                value={plan.digitalContributionPercent} 
                                onChange={(e) => handleChange('digitalContributionPercent', e.target.value)}
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-secondary focus:outline-none font-bold text-lg"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">% of Sales from Digital</p>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-brand-secondary uppercase tracking-wider mb-1">Target CPL (₹)</label>
                            <input 
                                type="number" 
                                value={plan.targetCPL} 
                                onChange={(e) => handleChange('targetCPL', e.target.value)}
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-secondary focus:outline-none font-bold text-lg"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">Planned Cost Per Lead</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Funnel Ratios */}
                <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-brand-light mb-4 border-b border-slate-700 pb-2">2. Conversion Assumptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background p-4 rounded-lg border border-slate-600">
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Lead to Walk-in (LTW %)</label>
                            <div className="flex items-center">
                                <input 
                                    type="number" 
                                    value={plan.leadToWalkinRatio} 
                                    onChange={(e) => handleChange('leadToWalkinRatio', e.target.value)}
                                    className="w-24 bg-slate-800 border border-slate-500 rounded px-3 py-2 text-white font-bold focus:ring-1 focus:ring-brand-secondary"
                                />
                                <span className="ml-2 text-lg font-bold">%</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">Benchmarks: 2% - 5%</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-slate-600">
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Walk-in to Booking (WTB %)</label>
                            <div className="flex items-center">
                                <input 
                                    type="number" 
                                    value={plan.walkinToBookingRatio} 
                                    onChange={(e) => handleChange('walkinToBookingRatio', e.target.value)}
                                    className="w-24 bg-slate-800 border border-slate-500 rounded px-3 py-2 text-white font-bold focus:ring-1 focus:ring-brand-secondary"
                                />
                                <span className="ml-2 text-lg font-bold">%</span>
                            </div>
                             <p className="text-xs text-text-secondary mt-2">Benchmarks: 5% - 10%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Calculated Targets */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-brand-secondary/30">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="bg-brand-secondary w-2 h-8 mr-3 rounded-full"></span>
                    3. Derived Quarterly Targets (Auto-Calculated)
                </h3>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center">
                        <thead>
                            <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-slate-600/50">
                                <th className="px-6 py-3 text-left">Metric</th>
                                <th className="px-6 py-3">Formula Logic</th>
                                <th className="px-6 py-3 text-right">Target Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm">
                            <tr>
                                <td className="px-6 py-4 text-left font-medium text-brand-light">Digital Revenue</td>
                                <td className="px-6 py-4 text-text-secondary text-xs">Overall BV * Digital %</td>
                                <td className="px-6 py-4 text-right font-bold text-white text-lg">₹{formatCurrency(plan.overallBV * (plan.digitalContributionPercent / 100) * 10000000)}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-left font-medium text-brand-light">Digital Units</td>
                                <td className="px-6 py-4 text-text-secondary text-xs">Revenue / ATS</td>
                                <td className="px-6 py-4 text-right font-bold text-brand-secondary text-2xl">{plan.digitalUnitsTarget}</td>
                            </tr>
                             <tr>
                                <td className="px-6 py-4 text-left font-medium text-text-primary">Walk-ins Required (AD)</td>
                                <td className="px-6 py-4 text-text-secondary text-xs">Units / WTB%</td>
                                <td className="px-6 py-4 text-right font-bold text-white text-xl">{plan.walkinsTarget.toLocaleString()}</td>
                            </tr>
                             <tr>
                                <td className="px-6 py-4 text-left font-medium text-text-primary">Leads Required</td>
                                <td className="px-6 py-4 text-text-secondary text-xs">Walk-ins / LTW%</td>
                                <td className="px-6 py-4 text-right font-bold text-white text-xl">{plan.leadsTarget.toLocaleString()}</td>
                            </tr>
                             <tr className="bg-brand-secondary/10">
                                <td className="px-6 py-4 text-left font-bold text-white">Total Estimated Budget</td>
                                <td className="px-6 py-4 text-text-secondary text-xs">Leads * Target CPL</td>
                                <td className="px-6 py-4 text-right font-bold text-green-400 text-2xl">₹{plan.totalBudget.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700">
                <button 
                    onClick={onBack}
                    className="flex items-center bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all hover:scale-105"
                >
                    <SaveIcon className="w-5 h-5 mr-2" />
                    Save Plan & Back to Dashboard
                </button>
            </div>
        </div>
    );
};
