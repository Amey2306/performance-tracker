
import React, { useMemo } from 'react';
import { WeeklyPerformancePoint } from '../types';

interface PerformanceTrackerProps {
    data: WeeklyPerformancePoint[];
    onUpdate: (index: number, field: 'leads' | 'appointments' | 'walkins' | 'spends', value: number) => void;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ data, onUpdate }) => {
    
    const enrichedData = useMemo(() => {
        let cumTgt = { leads: 0, appointments: 0, walkins: 0, spends: 0, allInSpends: 0 };
        let cumAch = { leads: 0, appointments: 0, walkins: 0, spends: 0, allInSpends: 0 };
        
        return data.map((week, i) => {
            const tgtAllIn = week.targets.spends * 1.18;
            cumTgt.leads += week.targets.leads;
            cumTgt.appointments += week.targets.appointments;
            cumTgt.walkins += week.targets.walkins;
            cumTgt.spends += week.targets.spends;
            cumTgt.allInSpends += tgtAllIn;

            const achAllIn = week.achieved.spends * 1.18;
            cumAch.leads += week.achieved.leads;
            cumAch.appointments += week.achieved.appointments;
            cumAch.walkins += week.achieved.walkins;
            cumAch.spends += week.achieved.spends;
            cumAch.allInSpends += achAllIn;

            const startIdx = Math.max(0, i - 3);
            const rollingWindow = data.slice(startIdx, i + 1);
            const rollingSpends = rollingWindow.reduce((sum, item) => sum + (item.achieved?.spends || 0), 0);
            const rollingLeads = rollingWindow.reduce((sum, item) => sum + (item.achieved?.leads || 0), 0);
            const rollingCpl = rollingLeads > 0 ? rollingSpends / rollingLeads : 0;

            const safeRatio = (num: number, den: number) => den > 0 ? num / den : 0;

            return {
                ...week,
                targets: { ...week.targets, allInSpends: tgtAllIn },
                achieved: { ...week.achieved, allInSpends: achAllIn },
                cTargets: { ...cumTgt },
                cAchieved: { ...cumAch },
                ratios: {
                    cpl: safeRatio(week.achieved.spends, week.achieved.leads),
                    rollingCpl: rollingCpl,
                    cpap: safeRatio(week.achieved.spends, week.achieved.appointments),
                    cpad: safeRatio(week.achieved.spends, week.achieved.walkins),
                    l2w: safeRatio(week.achieved.walkins, week.achieved.leads) * 100,
                    l2ap: safeRatio(week.achieved.appointments, week.achieved.leads) * 100,
                },
                cRatios: {
                    cpl: safeRatio(cumAch.spends, cumAch.leads),
                    cpap: safeRatio(cumAch.spends, cumAch.appointments),
                    cpad: safeRatio(cumAch.spends, cumAch.walkins),
                    l2w: safeRatio(cumAch.walkins, cumAch.leads) * 100,
                    l2ap: safeRatio(cumAch.appointments, cumAch.leads) * 100,
                }
            };
        });
    }, [data]);

    const lastWeek = enrichedData.length > 0 ? enrichedData[enrichedData.length - 1] : null;
    const totalTargets = lastWeek ? lastWeek.cTargets : { leads:0, appointments:0, walkins:0, spends:0, allInSpends:0 };
    const totalAchieved = lastWeek ? lastWeek.cAchieved : { leads:0, appointments:0, walkins:0, spends:0, allInSpends:0 };

    const renderCell = (content: React.ReactNode, bgClass: string = 'bg-surface', align: string = 'text-right', border: boolean = true) => (
        <td className={`p-2 ${align} ${bgClass} text-xs whitespace-nowrap ${border ? 'border-r border-slate-600/50' : ''}`}>
            {content}
        </td>
    );

    const handleChange = (index: number, field: 'leads' | 'appointments' | 'walkins' | 'spends', valStr: string) => {
        const val = parseFloat(valStr) || 0;
        onUpdate(index, field, val);
    };

    if (data.length === 0) {
        return <div className="p-8 text-center text-text-secondary italic glass rounded-xl">Please configure Weekly Planning first to generate the tracker.</div>;
    }

    return (
        <div className="bg-surface/50 rounded-xl shadow-2xl overflow-hidden border border-slate-700 backdrop-blur-sm animate-fadeIn">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-text-secondary">
                            <th className="sticky left-0 z-20 p-3 text-left min-w-[150px] bg-slate-900 border-r border-slate-600 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">WOW Tracker</th>
                            <th className="sticky left-[150px] z-20 p-3 text-left min-w-[100px] bg-slate-900 border-r border-slate-600 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">Dates</th>
                            {enrichedData.map((w, i) => (
                                <th key={i} className="p-2 text-center min-w-[100px] border-r border-slate-600/50">
                                    <div className="text-[10px] uppercase tracking-widest text-text-secondary/80">{w.startDate}</div>
                                    <div className="font-bold text-brand-light text-sm">{w.endDate}</div>
                                </th>
                            ))}
                            <th className="p-3 min-w-[120px] bg-slate-900 font-bold text-white border-l border-slate-600">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* === TARGETS SECTION (BLUE) === */}
                        <tr><td rowSpan={10} className="sticky left-0 z-10 bg-blue-900/20 p-3 font-bold text-blue-300 border-r border-slate-600 align-top backdrop-blur-sm">Targets</td></tr>
                        
                        {/* Leads Target */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs font-medium text-blue-100 border-r border-slate-600 backdrop-blur-sm">Leads</td>
                            {enrichedData.map((w, i) => renderCell(w.targets.leads.toLocaleString(), 'bg-blue-900/5'))}
                            {renderCell(totalTargets.leads.toLocaleString(), 'bg-blue-900/20 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs text-blue-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. Leads</td>
                            {enrichedData.map((w, i) => renderCell(w.cTargets.leads.toLocaleString(), 'bg-blue-900/5 text-text-secondary'))}
                            {renderCell('-', 'bg-blue-900/20')}
                        </tr>

                         {/* AP Target */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs font-medium text-blue-100 border-r border-slate-600 backdrop-blur-sm">AP (Site Visit)</td>
                            {enrichedData.map((w, i) => renderCell(w.targets.appointments.toLocaleString(), 'bg-blue-900/5'))}
                            {renderCell(totalTargets.appointments.toLocaleString(), 'bg-blue-900/20 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs text-blue-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. AP</td>
                            {enrichedData.map((w, i) => renderCell(w.cTargets.appointments.toLocaleString(), 'bg-blue-900/5 text-text-secondary'))}
                            {renderCell('-', 'bg-blue-900/20')}
                        </tr>

                        {/* AD Target */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs font-medium text-blue-100 border-r border-slate-600 backdrop-blur-sm">AD (Walkin)</td>
                            {enrichedData.map((w, i) => renderCell(w.targets.walkins.toLocaleString(), 'bg-blue-900/5'))}
                            {renderCell(totalTargets.walkins.toLocaleString(), 'bg-blue-900/20 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs text-blue-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. AD</td>
                            {enrichedData.map((w, i) => renderCell(w.cTargets.walkins.toLocaleString(), 'bg-blue-900/5 text-text-secondary'))}
                            {renderCell('-', 'bg-blue-900/20')}
                        </tr>

                        {/* Spends Target */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs font-medium text-blue-100 border-r border-slate-600 backdrop-blur-sm">Region Spends</td>
                            {enrichedData.map((w, i) => renderCell(`₹${w.targets.spends.toLocaleString()}`, 'bg-blue-900/5'))}
                            {renderCell(`₹${totalTargets.spends.toLocaleString()}`, 'bg-blue-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs text-blue-200/60 border-r border-slate-600 backdrop-blur-sm">Total Region Spends</td>
                            {enrichedData.map((w, i) => renderCell(`₹${w.cTargets.spends.toLocaleString()}`, 'bg-blue-900/5 text-text-secondary'))}
                            {renderCell(`₹${totalTargets.spends.toLocaleString()}`, 'bg-blue-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs font-medium text-blue-100 border-r border-slate-600 backdrop-blur-sm">All-in Spends</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.targets.allInSpends).toLocaleString()}`, 'bg-blue-900/5'))}
                            {renderCell(`₹${Math.round(totalTargets.allInSpends).toLocaleString()}`, 'bg-blue-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-blue-900/10 p-2 text-xs text-blue-200/60 border-r border-slate-600 backdrop-blur-sm">Total All-in Spends</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.cTargets.allInSpends).toLocaleString()}`, 'bg-blue-900/5 text-text-secondary'))}
                            {renderCell(`₹${Math.round(totalTargets.allInSpends).toLocaleString()}`, 'bg-blue-900/20 font-bold')}
                        </tr>
                        <tr className="h-6 bg-background/50"><td colSpan={15}></td></tr>

                        {/* === ACHIEVED SECTION (YELLOW) === */}
                        <tr><td rowSpan={9} className="sticky left-0 z-10 bg-yellow-600/10 p-3 font-bold text-yellow-500 border-r border-slate-600 align-top backdrop-blur-sm">Achieved</td></tr>
                        
                        {/* Leads Achieved (Editable) */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/10 p-2 text-xs font-bold text-yellow-100 border-r border-slate-600 shadow-md backdrop-blur-sm">Leads (Editable)</td>
                            {enrichedData.map((w, i) => (
                                <td key={i} className="p-0 border-r border-slate-600/50 bg-yellow-900/10 hover:bg-yellow-900/30 transition-colors relative group">
                                    <input 
                                        type="number" 
                                        value={w.achieved.leads || ''} 
                                        placeholder="-"
                                        onChange={(e) => handleChange(i, 'leads', e.target.value)}
                                        className="w-full h-full bg-transparent text-right p-2 text-yellow-100 font-bold placeholder-slate-600 focus:outline-none focus:bg-yellow-900/50 focus:shadow-[inset_0_0_10px_rgba(234,179,8,0.2)] inset-0 transition-all"
                                    />
                                </td>
                            ))}
                            {renderCell(totalAchieved.leads.toLocaleString(), 'bg-yellow-600/10 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/5 p-2 text-xs text-yellow-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. Leads</td>
                            {enrichedData.map((w, i) => renderCell(w.cAchieved.leads.toLocaleString(), 'bg-yellow-600/5 text-text-secondary'))}
                            {renderCell('-', 'bg-yellow-600/10')}
                        </tr>

                        {/* AP Achieved (Editable) */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/10 p-2 text-xs font-bold text-yellow-100 border-r border-slate-600 shadow-md backdrop-blur-sm">AP (Editable)</td>
                            {enrichedData.map((w, i) => (
                                <td key={i} className="p-0 border-r border-slate-600/50 bg-yellow-900/10 hover:bg-yellow-900/30 transition-colors">
                                    <input 
                                        type="number" 
                                        value={w.achieved.appointments || ''} 
                                        placeholder="-"
                                        onChange={(e) => handleChange(i, 'appointments', e.target.value)}
                                        className="w-full h-full bg-transparent text-right p-2 text-yellow-100 font-bold placeholder-slate-600 focus:outline-none focus:bg-yellow-900/50 focus:shadow-[inset_0_0_10px_rgba(234,179,8,0.2)] inset-0 transition-all"
                                    />
                                </td>
                            ))}
                            {renderCell(totalAchieved.appointments.toLocaleString(), 'bg-yellow-600/10 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/5 p-2 text-xs text-yellow-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. AP</td>
                            {enrichedData.map((w, i) => renderCell(w.cAchieved.appointments.toLocaleString(), 'bg-yellow-600/5 text-text-secondary'))}
                            {renderCell('-', 'bg-yellow-600/10')}
                        </tr>

                        {/* AD Achieved (Editable) */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/10 p-2 text-xs font-bold text-yellow-100 border-r border-slate-600 shadow-md backdrop-blur-sm">AD (Editable)</td>
                            {enrichedData.map((w, i) => (
                                <td key={i} className="p-0 border-r border-slate-600/50 bg-yellow-900/10 hover:bg-yellow-900/30 transition-colors">
                                    <input 
                                        type="number" 
                                        value={w.achieved.walkins || ''} 
                                        placeholder="-"
                                        onChange={(e) => handleChange(i, 'walkins', e.target.value)}
                                        className="w-full h-full bg-transparent text-right p-2 text-yellow-100 font-bold placeholder-slate-600 focus:outline-none focus:bg-yellow-900/50 focus:shadow-[inset_0_0_10px_rgba(234,179,8,0.2)] inset-0 transition-all"
                                    />
                                </td>
                            ))}
                            {renderCell(totalAchieved.walkins.toLocaleString(), 'bg-yellow-600/10 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/5 p-2 text-xs text-yellow-200/60 border-r border-slate-600 backdrop-blur-sm">Cumm. AD</td>
                            {enrichedData.map((w, i) => renderCell(w.cAchieved.walkins.toLocaleString(), 'bg-yellow-600/5 text-text-secondary'))}
                            {renderCell('-', 'bg-yellow-600/10')}
                        </tr>

                        {/* Spends Achieved (Editable) */}
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/10 p-2 text-xs font-bold text-yellow-100 border-r border-slate-600 shadow-md backdrop-blur-sm">Region Spends (Edit)</td>
                            {enrichedData.map((w, i) => (
                                <td key={i} className="p-0 border-r border-slate-600/50 bg-yellow-900/10 hover:bg-yellow-900/30 transition-colors">
                                    <input 
                                        type="number" 
                                        value={w.achieved.spends || ''} 
                                        placeholder="-"
                                        onChange={(e) => handleChange(i, 'spends', e.target.value)}
                                        className="w-full h-full bg-transparent text-right p-2 text-yellow-100 font-bold placeholder-slate-600 focus:outline-none focus:bg-yellow-900/50 focus:shadow-[inset_0_0_10px_rgba(234,179,8,0.2)] inset-0 transition-all"
                                    />
                                </td>
                            ))}
                            {renderCell(`₹${totalAchieved.spends.toLocaleString()}`, 'bg-yellow-600/10 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-yellow-600/5 p-2 text-xs text-yellow-200/60 border-r border-slate-600 backdrop-blur-sm">Total Spends</td>
                            {enrichedData.map((w, i) => renderCell(`₹${w.cAchieved.spends.toLocaleString()}`, 'bg-yellow-600/5 text-text-secondary'))}
                            {renderCell(`₹${totalAchieved.spends.toLocaleString()}`, 'bg-yellow-600/10 font-bold')}
                        </tr>
                         <tr className="h-6 bg-background/50"><td colSpan={15}></td></tr>

                        {/* === RATIOS SECTION (RED) === */}
                        <tr><td rowSpan={6} className="sticky left-0 z-10 bg-red-900/20 p-3 font-bold text-red-300 border-r border-slate-600 align-top backdrop-blur-sm">Ratios</td></tr>
                        
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-100 border-r border-slate-600 shadow-md backdrop-blur-sm">CPL (Cost/Lead)</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.ratios.cpl).toLocaleString()}`, 'bg-red-900/5'))}
                            {renderCell(`₹${Math.round(totalAchieved.cpl || 0).toLocaleString()}`, 'bg-red-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-200/80 border-r border-slate-600 shadow-md border-l-4 border-l-red-500 backdrop-blur-sm">CPL (4wk Avg)</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.ratios.rollingCpl).toLocaleString()}`, 'bg-red-900/10 font-semibold text-red-200'))}
                            {renderCell(`₹${Math.round(totalAchieved.cpl || 0).toLocaleString()}`, 'bg-red-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-100 border-r border-slate-600 shadow-md backdrop-blur-sm">CPAP (Cost/AP)</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.ratios.cpap).toLocaleString()}`, 'bg-red-900/5'))}
                            {renderCell(`₹${Math.round(totalAchieved.cpap || 0).toLocaleString()}`, 'bg-red-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-100 border-r border-slate-600 shadow-md backdrop-blur-sm">CPAD (Cost/AD)</td>
                            {enrichedData.map((w, i) => renderCell(`₹${Math.round(w.ratios.cpad).toLocaleString()}`, 'bg-red-900/5'))}
                            {renderCell(`₹${Math.round(totalAchieved.cpad || 0).toLocaleString()}`, 'bg-red-900/20 font-bold')}
                        </tr>
                        <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-100 border-r border-slate-600 shadow-md backdrop-blur-sm">L2W %</td>
                            {enrichedData.map((w, i) => renderCell(`${w.ratios.l2w.toFixed(2)}%`, 'bg-red-900/5'))}
                             {renderCell(`${(totalAchieved.l2w || 0).toFixed(2)}%`, 'bg-red-900/20 font-bold')}
                        </tr>
                         <tr>
                            <td className="sticky left-[150px] z-10 bg-red-900/10 p-2 text-xs font-medium text-red-100 border-r border-slate-600 shadow-md backdrop-blur-sm">L2AP %</td>
                            {enrichedData.map((w, i) => renderCell(`${w.ratios.l2ap.toFixed(2)}%`, 'bg-red-900/5'))}
                             {renderCell(`${(totalAchieved.l2ap || 0).toFixed(2)}%`, 'bg-red-900/20 font-bold')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};