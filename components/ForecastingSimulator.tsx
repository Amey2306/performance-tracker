import React, { useState, useEffect, useMemo } from 'react';
import type { Project, PlatformForecast } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface ForecastingSimulatorProps {
    project: Project;
    onForecastUpdate: (plan: PlatformForecast[] | null) => void;
}

const createNewPlatform = (): PlatformForecast => ({
    id: `new-${Date.now()}`,
    name: '',
    spends: 0,
    cpl: 0,
    leads: 0,
    capiToApRate: 30, // Default values
    projectedAppointments: 0,
    apToAdRate: 50,
    projectedWalkins: 0,
});

export const ForecastingSimulator: React.FC<ForecastingSimulatorProps> = ({ project, onForecastUpdate }) => {
    const [forecast, setForecast] = useState<PlatformForecast[]>([]);
    
    useEffect(() => {
        // Initialize forecast from the project's current platform performance
        const initialForecast = project.currentPlatforms.map(p => {
            const cpl = p.leads > 0 ? p.spends / p.leads : 0;
            const capiToApRate = p.leads > 0 ? (p.appointments / p.leads) * 100 : 30; // Use historical or default
            return {
                id: p.name,
                name: p.name,
                spends: p.spends,
                cpl: cpl,
                leads: p.leads,
                capiToApRate: capiToApRate,
                projectedAppointments: p.appointments,
                apToAdRate: 50, // Default, can't be derived from snapshot
                projectedWalkins: 0, // Default
            };
        });
        setForecast(initialForecast);
    }, [project]);

    useEffect(() => {
        // Debounce or directly call onForecastUpdate when forecast changes
        const isPlanValid = forecast.every(p => p.name && p.spends >= 0 && p.cpl >= 0 && p.leads >= 0);
        if (isPlanValid && forecast.length > 0) {
            onForecastUpdate(forecast);
        } else {
            onForecastUpdate(null);
        }
    }, [forecast, onForecastUpdate]);

    const handleUpdate = (id: string, field: keyof PlatformForecast, value: string | number) => {
        setForecast(prev => {
            const newForecast = [...prev];
            const index = newForecast.findIndex(p => p.id === id);
            if (index === -1) return prev;

            const platform = { ...newForecast[index] };
            let numericValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numericValue)) numericValue = 0;

            if (field === 'name') {
                 platform.name = String(value);
            } else {
                 platform[field as keyof PlatformForecast] = numericValue as never;
            }

            // Recalculate based on which field was changed
            if (field === 'spends' || field === 'cpl') {
                platform.leads = platform.cpl > 0 ? Math.round(platform.spends / platform.cpl) : 0;
            } else if (field === 'leads') {
                platform.cpl = platform.leads > 0 ? platform.spends / platform.leads : 0;
            }

            // Recalculate downstream metrics
            platform.projectedAppointments = Math.round(platform.leads * (platform.capiToApRate / 100));
            platform.projectedWalkins = Math.round(platform.projectedAppointments * (platform.apToAdRate / 100));
            
            newForecast[index] = platform;
            return newForecast;
        });
    };
    
    const addPlatform = () => {
        setForecast(prev => [...prev, createNewPlatform()]);
    };

    const removePlatform = (id: string) => {
        setForecast(prev => prev.filter(p => p.id !== id));
    };
    
    const totals = useMemo(() => {
        return forecast.reduce((acc, p) => {
            acc.spends += p.spends || 0;
            acc.leads += p.leads || 0;
            acc.appointments += p.projectedAppointments || 0;
            acc.walkins += p.projectedWalkins || 0;
            return acc;
        }, { spends: 0, leads: 0, appointments: 0, walkins: 0 });
    }, [forecast]);

    const totalCPL = totals.leads > 0 ? totals.spends / totals.leads : 0;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">Platform</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">Spends (₹)</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">CPL (₹)</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">Leads</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">AP</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-text-secondary uppercase">AD</th>
                            <th className="py-2 px-3 text-center text-xs font-medium text-text-secondary uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-slate-700">
                        {forecast.map(p => (
                            <tr key={p.id}>
                                <td className="p-2 whitespace-nowrap"><input type="text" value={p.name} onChange={e => handleUpdate(p.id, 'name', e.target.value)} className="w-40 p-1.5 bg-background border border-slate-600 rounded-md text-text-primary focus:ring-1 focus:ring-brand-secondary" /></td>
                                <td className="p-2 whitespace-nowrap"><input type="number" value={p.spends} onChange={e => handleUpdate(p.id, 'spends', e.target.value)} className="w-28 p-1.5 bg-background border border-slate-600 rounded-md text-text-primary focus:ring-1 focus:ring-brand-secondary" /></td>
                                <td className="p-2 whitespace-nowrap"><input type="number" value={Math.round(p.cpl)} onChange={e => handleUpdate(p.id, 'cpl', e.target.value)} className="w-24 p-1.5 bg-background border border-slate-600 rounded-md text-text-primary focus:ring-1 focus:ring-brand-secondary" /></td>
                                <td className="p-2 whitespace-nowrap"><input type="number" value={p.leads} onChange={e => handleUpdate(p.id, 'leads', e.target.value)} className="w-24 p-1.5 bg-background border border-slate-600 rounded-md text-text-primary focus:ring-1 focus:ring-brand-secondary" /></td>
                                <td className="p-2 whitespace-nowrap text-sm text-brand-light font-semibold">{p.projectedAppointments}</td>
                                <td className="p-2 whitespace-nowrap text-sm text-brand-light font-semibold">{p.projectedWalkins}</td>
                                <td className="p-2 whitespace-nowrap text-center">
                                    <button onClick={() => removePlatform(p.id)} className="text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-800/80">
                        <tr className="font-bold text-brand-light">
                             <td className="px-3 py-2 text-left text-sm uppercase">Total</td>
                             <td className="px-3 py-2 text-left text-sm">₹{totals.spends.toLocaleString()}</td>
                             <td className="px-3 py-2 text-left text-sm">₹{totalCPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                             <td className="px-3 py-2 text-left text-sm">{totals.leads.toLocaleString()}</td>
                             <td className="px-3 py-2 text-left text-sm">{totals.appointments.toLocaleString()}</td>
                             <td className="px-3 py-2 text-left text-sm">{totals.walkins.toLocaleString()}</td>
                             <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-4 flex justify-start">
                 <button onClick={addPlatform} className="flex items-center bg-brand-secondary/20 hover:bg-brand-secondary/40 text-brand-light font-semibold py-2 px-3 rounded-md transition duration-300 text-sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Platform
                </button>
            </div>
        </div>
    );
};
