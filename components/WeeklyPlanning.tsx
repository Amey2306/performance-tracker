
import React, { useState, useEffect, useMemo } from 'react';
import { QuarterlyBusinessPlan, WeeklyPerformancePoint } from '../types';
import { SaveIcon, PencilIcon } from './Icons';

interface WeeklyPlanningProps {
    quarterlyPlan: QuarterlyBusinessPlan;
    currentData: WeeklyPerformancePoint[];
    onSave: (newData: WeeklyPerformancePoint[]) => void;
}

interface WeeklyPlanRow {
    id: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    distributionPercent: number; // % of Total Quarterly Volume (Leads/Spends %)
    ltwPercent: number; // Lead to Walkin % (AD %) for this specific week
    spendFactor: number; // "Spend" row in Excel (1 or 0 usually)
}

export const WeeklyPlanning: React.FC<WeeklyPlanningProps> = ({ quarterlyPlan, currentData, onSave }) => {
    const [quarterStartDate, setQuarterStartDate] = useState('2025-10-06'); 
    const [weeks, setWeeks] = useState<WeeklyPlanRow[]>([]);

    useEffect(() => {
        generateWeeks(quarterStartDate);
    }, []);

    const generateWeeks = (startDateStr: string) => {
        const start = new Date(startDateStr);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
        
        const monday = new Date(start);
        monday.setDate(diff);

        const newWeeks: WeeklyPlanRow[] = [];
        let currentMonday = new Date(monday);

        for (let i = 0; i < 13; i++) {
            const sunday = new Date(currentMonday);
            sunday.setDate(currentMonday.getDate() + 6);

            newWeeks.push({
                id: i,
                startDate: currentMonday.toISOString().split('T')[0],
                endDate: sunday.toISOString().split('T')[0],
                distributionPercent: i < 12 ? (100 / 12) : 0, 
                ltwPercent: quarterlyPlan.leadToWalkinRatio || 3.0, 
                spendFactor: i < 12 ? 1 : 0 
            });

            currentMonday.setDate(currentMonday.getDate() + 7);
        }
        setWeeks(newWeeks);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuarterStartDate(e.target.value);
        generateWeeks(e.target.value);
    };

    const handleWeekChange = (index: number, field: keyof WeeklyPlanRow, value: number) => {
        const updated = [...weeks];
        // @ts-ignore
        updated[index][field] = value;
        setWeeks(updated);
    };

    // --- Calculations ---
    const calculatedData = useMemo(() => {
        let cumLeads = 0;
        let cumAP = 0;
        let cumAD = 0;
        let cumSpends = 0;
        let cumAllIn = 0;

        return weeks.map(week => {
            const leads = Math.round(quarterlyPlan.leadsTarget * (week.distributionPercent / 100) * week.spendFactor);
            const ad = Math.round(leads * (week.ltwPercent / 100));
            const ap = ad * 2;
            const spends = Math.round(quarterlyPlan.totalBudget * (week.distributionPercent / 100) * week.spendFactor);
            const allInSpends = Math.round(spends * 1.18);

            cumLeads += leads;
            cumAP += ap;
            cumAD += ad;
            cumSpends += spends;
            cumAllIn += allInSpends;

            return {
                ...week,
                leads,
                ap,
                ad,
                spends,
                allInSpends,
                cLeads: cumLeads,
                cAP: cumAP,
                cAD: cumAD,
                cSpends: cumSpends,
                cAllIn: cumAllIn
            };
        });
    }, [weeks, quarterlyPlan]);

    const totalDist = weeks.reduce((sum, w) => sum + w.distributionPercent, 0);

    const handleSave = () => {
        const performancePoints: WeeklyPerformancePoint[] = calculatedData
            .map((w, i) => {
                const formatDate = (d: string) => {
                    const date = new Date(d);
                    return `${date.getDate()}-${date.toLocaleString('default', { month: 'short' })}`;
                };
                const existingAchieved = currentData[i]?.achieved || { leads: 0, appointments: 0, walkins: 0, spends: 0 };

                return {
                    weekLabel: `W${i + 1}`,
                    startDate: formatDate(w.startDate),
                    endDate: formatDate(w.endDate),
                    targets: {
                        leads: w.leads,
                        appointments: w.ap,
                        walkins: w.ad,
                        spends: w.spends
                    },
                    achieved: existingAchieved
                };
            });

        onSave(performancePoints);
    };

    const renderRow = (label: string, dataKey: string, isCurrency = false, isCumulative = false, isInput = false, inputField?: keyof WeeklyPlanRow) => (
        <tr className={`${isCumulative ? 'bg-slate-800/30 text-xs text-text-secondary' : 'border-t border-slate-700/50'} ${isInput ? 'bg-brand-dark/10' : 'hover:bg-slate-800/20'} transition-colors`}>
            <td className={`sticky left-0 z-10 p-2 text-left border-r border-slate-700 
                ${isCumulative ? 'pl-6' : 'pl-3 font-medium text-text-primary'} 
                ${isInput ? 'font-bold text-brand-secondary flex items-center justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]' : ''}
                bg-surface`
            }>
                <span>{label}</span>
                {isInput && <PencilIcon className="w-3 h-3 text-text-secondary" />}
            </td>
            {calculatedData.map((w, i) => (
                <td key={w.id} className={`p-2 text-right border-r border-slate-700/50 ${w.spendFactor === 0 ? 'opacity-30' : ''}`}>
                    {isInput && inputField ? (
                        <input 
                            type="number" 
                            value={isInput ? (Math.round((w[inputField] as number) * 100) / 100) : 0}
                            onChange={(e) => handleWeekChange(i, inputField, parseFloat(e.target.value))}
                            className="w-full text-right bg-transparent font-bold focus:outline-none hover:bg-slate-700/50 rounded px-1 transition-colors focus:text-brand-primary"
                        />
                    ) : (
                        <span className={isInput ? 'font-bold' : ''}>
                            {/* @ts-ignore */}
                            {isCurrency ? '₹' : ''}
                            {/* @ts-ignore */}
                            {isCurrency && w[dataKey] > 99999 ? (w[dataKey]/100000).toFixed(2) + 'L' : w[dataKey].toLocaleString()}
                            {isInput ? '%' : ''}
                        </span>
                    )}
                </td>
            ))}
            <td className="p-2 text-right font-bold bg-slate-900/50">
                 {isInput ? (
                    <span className={Math.abs(totalDist - 100) > 0.1 && inputField === 'distributionPercent' ? 'text-red-400' : 'text-green-400'}>
                        {/* @ts-ignore */}
                        {inputField === 'distributionPercent' ? Math.round(totalDist) + '%' : '-'}
                    </span>
                 ) : (
                    <span>
                        {isCurrency ? '₹' : ''}
                        {/* @ts-ignore */}
                        {isCurrency ? (calculatedData.reduce((a,b) => a + b[dataKey], 0)/10000000).toFixed(2) + 'Cr' : calculatedData.reduce((a,b) => a + b[dataKey], 0).toLocaleString()}
                    </span>
                 )}
            </td>
        </tr>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
             <div className="bg-surface/50 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-brand-light">Week-on-Week (WOW) Planning</h3>
                        <p className="text-text-secondary text-xs mt-1">
                            Configure weekly distribution. Dates auto-align to Monday-Sunday.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-background p-2 rounded border border-slate-700 shadow-inner">
                        <label className="text-xs text-text-secondary uppercase font-bold">Quarter Start:</label>
                        <input 
                            type="date" 
                            value={quarterStartDate} 
                            onChange={handleDateChange}
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-brand-secondary outline-none transition-shadow"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-700 custom-scrollbar">
                    <table className="min-w-max text-sm">
                        <thead className="bg-slate-900/90 text-text-secondary font-semibold">
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-900 p-3 text-left min-w-[140px] border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">WOW Metrics</th>
                                {calculatedData.map((w, i) => (
                                    <th key={w.id} className={`p-2 min-w-[90px] text-center border-r border-slate-700/50 ${w.spendFactor === 0 ? 'opacity-50' : ''}`}>
                                        <div className="text-[10px] uppercase tracking-wider text-text-secondary">{w.startDate.slice(8)} - {w.endDate.slice(8)}</div>
                                        <div className="text-brand-light font-bold">{w.endDate.slice(5,7) === w.startDate.slice(5,7) ? w.startDate.toLocaleString('default', {month:'short'}) : 'Month'}</div>
                                    </th>
                                ))}
                                <th className="p-3 min-w-[100px] bg-slate-900 text-white text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface">
                            {/* Leads Section */}
                            {renderRow('Leads', 'leads')}
                            {renderRow('Cumul. Leads', 'cLeads', false, true)}
                            
                            {/* AP Section */}
                            {renderRow('AP (AD*2)', 'ap')}
                            {renderRow('Cumul. AP', 'cAP', false, true)}

                            {/* AD Section */}
                            {renderRow('AD', 'ad')}
                            {renderRow('Cumul. AD', 'cAD', false, true)}

                            {/* Spends Section */}
                            {renderRow('Region Spends', 'spends', true)}
                            {renderRow('Total Region Spends', 'cSpends', true, true)}

                            {/* All-in Spends Section */}
                            {renderRow('All-in Spends', 'allInSpends', true)}
                            {renderRow('Total All-in Spends', 'cAllIn', true, true)}

                            {/* DIVIDER */}
                            <tr className="bg-slate-900 h-2"><td colSpan={15}></td></tr>

                            {/* INPUTS / DRIVERS */}
                            {renderRow('Spends / Leads %', 'distributionPercent', false, false, true, 'distributionPercent')}
                            {renderRow('AD (Walkin) %', 'ltwPercent', false, false, true, 'ltwPercent')}
                            
                            {/* Editable Spend Factor */}
                            <tr className="border-t border-slate-700 bg-brand-dark/20">
                                <td className="sticky left-0 z-10 bg-surface p-3 font-bold text-text-secondary border-r border-slate-700 flex justify-between items-center shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
                                    <span>Spend (Active)</span>
                                    <PencilIcon className="w-3 h-3 text-text-secondary" />
                                </td>
                                {calculatedData.map((w, i) => (
                                    <td key={w.id} className="p-2 text-center border-r border-slate-700/50">
                                        <input 
                                            type="number" 
                                            value={w.spendFactor} 
                                            onChange={(e) => handleWeekChange(i, 'spendFactor', parseFloat(e.target.value))}
                                            className="w-full text-center bg-transparent font-bold text-white focus:outline-none hover:bg-slate-700/50 rounded px-1 transition-colors"
                                        />
                                    </td>
                                ))}
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        onClick={handleSave}
                        className="flex items-center bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <SaveIcon className="w-5 h-5 mr-2" />
                        Save Plan to Tracker
                    </button>
                </div>
            </div>
        </div>
    );
};