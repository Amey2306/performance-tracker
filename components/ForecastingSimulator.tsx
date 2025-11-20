
import React, { useState, useEffect, useMemo } from 'react';
import type { Project, PlatformForecast } from '../types';
import { PlusIcon, TrashIcon, UploadIcon } from './Icons';

interface ForecastingSimulatorProps {
    project: Project;
    onForecastUpdate: (plan: PlatformForecast[] | null) => void;
    onCommitPlan?: (plan: PlatformForecast[]) => void;
}

const VENDORS = [
    "Google Search", "Google Demand Gen", "Google Display", "Google PMax",
    "Meta Main", "Meta PP", "99 Acres", "MagicBricks", "Housing.com", 
    "Taboola", "Outbrain", "Times of India"
];

const createNewPlatform = (name: string = ''): PlatformForecast => ({
    id: `new-${Date.now()}-${Math.random()}`,
    name: name,
    spends: 0,
    cpl: 0,
    leads: 0,
    leadToCapiPercent: 50, // Leads -> Appointments Proposed
    projectedCapi: 0,
    capiToApPercent: 40, // Capi -> Site Visits Done (AP)
    projectedAppointments: 0, 
    apToAdPercent: 100, // Usually AP is same as AD if defined strictly, but user prompts suggests conversion steps. 
    // Based on prompt: "AP = Ad * 2" implies 50% AD to AP ratio.
    // Let's stick to: Leads -> (Conv) -> Walkins.
    // The user said "AP = AD * 2". This means 2 APs result in 1 AD.
    // So we will calculate backwards or forwards.
    // Forward: Leads -> (L2W%) -> Walkins.
    projectedWalkins: 0,
});

export const ForecastingSimulator: React.FC<ForecastingSimulatorProps> = ({ project, onForecastUpdate, onCommitPlan }) => {
    const [forecast, setForecast] = useState<PlatformForecast[]>([]);
    const [newVendorName, setNewVendorName] = useState(VENDORS[0]);

    useEffect(() => {
        // Initialize with current platforms if available, else empty
        if (project.currentPlatforms.length > 0) {
            const initialForecast = project.currentPlatforms.map(p => ({
                id: p.name,
                name: p.name,
                spends: p.spends,
                leads: p.leads,
                cpl: p.leads > 0 ? p.spends/p.leads : 0,
                leadToCapiPercent: 50, // Default
                projectedCapi: 0, 
                capiToApPercent: 40,
                projectedAppointments: p.appointments,
                apToAdPercent: 50,
                projectedWalkins: p.walkins,
            }));
            setForecast(initialForecast);
        }
    }, [project]);

    useEffect(() => {
        onForecastUpdate(forecast.length > 0 ? forecast : null);
    }, [forecast, onForecastUpdate]);

    const handleUpdate = (id: string, field: keyof PlatformForecast, value: string | number) => {
        setForecast(prev => {
            const newForecast = [...prev];
            const index = newForecast.findIndex(p => p.id === id);
            if (index === -1) return prev;

            const platform = { ...newForecast[index] };
            let num = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(num)) num = 0;

            // @ts-ignore
            platform[field] = num;

            // Logic: "Depends on how much leads / spends and CPl m going to achieve"
            // Primary Input: Spends & CPL -> Leads
            if (field === 'spends' || field === 'cpl') {
                platform.leads = platform.cpl > 0 ? Math.round(platform.spends / platform.cpl) : 0;
            } 
            // Alternative: Leads & CPL -> Spends
            else if (field === 'leads') {
                 platform.spends = Math.round(platform.leads * platform.cpl);
            }

            // Downstream Calculations
            // Leads -> Walkins using L2W% (derived from user prompt L2W column)
            // User prompt: "AD = Leads * Walkin %"
            // Let's assume user enters "Lead to Walkin %" effectively via the AP/AD funnel or directly.
            // To simplify for this simulation based on prompt:
            // Capi (Proposed) = Leads * %
            platform.projectedCapi = Math.round(platform.leads * (platform.leadToCapiPercent / 100));
            // AP (Done) = Capi * %
            platform.projectedAppointments = Math.round(platform.projectedCapi * (platform.capiToApPercent / 100));
            // AD (Walkin) = AP * % (User said AP = AD*2, so AD is 50% of AP)
            platform.projectedWalkins = Math.round(platform.projectedAppointments * (platform.apToAdPercent / 100));
            
            newForecast[index] = platform;
            return newForecast;
        });
    };

    const addVendor = () => {
        setForecast(prev => [...prev, createNewPlatform(newVendorName)]);
    };

    const removePlatform = (id: string) => {
        setForecast(prev => prev.filter(p => p.id !== id));
    };
    
    const totals = useMemo(() => forecast.reduce((acc, p) => ({
        spends: acc.spends + p.spends,
        leads: acc.leads + p.leads,
        appointments: acc.appointments + p.projectedAppointments,
        walkins: acc.walkins + p.projectedWalkins
    }), { spends: 0, leads: 0, appointments: 0, walkins: 0 }), [forecast]);

    const overallCPL = totals.leads > 0 ? totals.spends / totals.leads : 0;

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-text-secondary mb-4">Simulation Controls</h4>
                <div className="flex items-center gap-4">
                    <select 
                        value={newVendorName} 
                        onChange={(e) => setNewVendorName(e.target.value)}
                        className="bg-background border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-brand-secondary"
                    >
                        {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button onClick={addVendor} className="flex items-center bg-brand-secondary hover:bg-brand-primary text-white font-medium py-2 px-4 rounded transition">
                        <PlusIcon className="w-4 h-4 mr-2" /> Add Platform
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-700 rounded-lg shadow-lg">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-secondary uppercase">Platform</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-brand-secondary uppercase w-32">Budget (₹)</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-brand-secondary uppercase w-24">Exp. CPL</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-primary uppercase w-24">Leads</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-secondary uppercase w-24">Lead to Capi %</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-secondary uppercase w-24">Capi to AP %</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-primary uppercase w-20">AP (Site Visit)</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-text-secondary uppercase w-20">AP to AD %</th>
                            <th className="py-3 px-3 text-left text-xs font-bold text-green-400 uppercase w-20">AD (Walkin)</th>
                            <th className="py-3 px-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-slate-700 text-sm">
                        {forecast.map(p => (
                            <tr key={p.id} className="hover:bg-slate-800/50 transition">
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-2">
                                    <input type="number" value={p.spends} onChange={e => handleUpdate(p.id, 'spends', e.target.value)} className="w-full bg-background border border-slate-600 rounded px-2 py-1 text-white text-right" />
                                </td>
                                <td className="p-2">
                                    <input type="number" value={Math.round(p.cpl)} onChange={e => handleUpdate(p.id, 'cpl', e.target.value)} className="w-full bg-background border border-slate-600 rounded px-2 py-1 text-white text-right" />
                                </td>
                                <td className="p-2">
                                    <input type="number" value={p.leads} onChange={e => handleUpdate(p.id, 'leads', e.target.value)} className="w-full bg-background border border-slate-600 rounded px-2 py-1 text-brand-light font-bold text-right" />
                                </td>
                                 <td className="p-2">
                                    <input type="number" value={p.leadToCapiPercent} onChange={e => handleUpdate(p.id, 'leadToCapiPercent', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-text-secondary text-right" />
                                </td>
                                <td className="p-2">
                                    <input type="number" value={p.capiToApPercent} onChange={e => handleUpdate(p.id, 'capiToApPercent', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-text-secondary text-right" />
                                </td>
                                <td className="p-3 text-right font-semibold">{p.projectedAppointments}</td>
                                <td className="p-2">
                                    <input type="number" value={p.apToAdPercent} onChange={e => handleUpdate(p.id, 'apToAdPercent', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-text-secondary text-right" />
                                </td>
                                <td className="p-3 text-right font-bold text-green-400">{p.projectedWalkins}</td>
                                <td className="p-2 text-center">
                                    <button onClick={() => removePlatform(p.id)} className="text-red-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-900/80 font-bold text-brand-light">
                        <tr>
                            <td className="p-3 uppercase text-xs tracking-wider">Total Forecast</td>
                            <td className="p-3 text-right">₹{totals.spends.toLocaleString()}</td>
                            <td className="p-3 text-right">₹{Math.round(overallCPL).toLocaleString()}</td>
                            <td className="p-3 text-right">{totals.leads.toLocaleString()}</td>
                            <td colSpan={2}></td>
                            <td className="p-3 text-right">{totals.appointments.toLocaleString()}</td>
                            <td></td>
                            <td className="p-3 text-right text-green-400">{totals.walkins.toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {onCommitPlan && (
                <div className="flex justify-end pt-4">
                     <button 
                        onClick={() => onCommitPlan(forecast)} 
                        disabled={forecast.length === 0}
                        className="flex items-center bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Commit Plan to Next Week
                    </button>
                </div>
            )}
        </div>
    );
};
