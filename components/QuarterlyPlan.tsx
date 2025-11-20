
import React, { useState } from 'react';
import { QuarterlyBusinessPlan, BookingActuals } from '../types';
import { SaveIcon } from './Icons';

interface QuarterlyPlanProps {
    plan: QuarterlyBusinessPlan;
    bookingActuals?: BookingActuals; 
    onUpdate: (newPlan: QuarterlyBusinessPlan, newBookings?: BookingActuals) => void;
    onBack: () => void;
}

export const QuarterlyPlan: React.FC<QuarterlyPlanProps> = ({ plan, bookingActuals, onUpdate, onBack }) => {
    const [currentBookingActuals, setCurrentBookingActuals] = useState<BookingActuals>(bookingActuals || {
        siteBVAchieved: 0,
        digitalBookings: 0,
        lnBookings: 0,
        digitalBVAchieved: 0,
        lnBVAchieved: 0
    });

    const handleChange = (field: keyof QuarterlyBusinessPlan, value: string) => {
        const numVal = parseFloat(value) || 0;
        const updatedPlan = { ...plan, [field]: numVal };

        // Recalculate Funnel Automatically
        const digitalRevenue = updatedPlan.overallBV * (updatedPlan.digitalContributionPercent / 100);
        const digitalUnits = updatedPlan.ats > 0 ? digitalRevenue / updatedPlan.ats : 0;
        const wtbDecimal = (updatedPlan.walkinToBookingRatio || 1) / 100;
        const walkins = digitalUnits / wtbDecimal;
        const ltwDecimal = (updatedPlan.leadToWalkinRatio || 1) / 100;
        const leads = walkins / ltwDecimal;
        const budget = leads * updatedPlan.targetCPL;

        onUpdate({
            ...updatedPlan,
            digitalUnitsTarget: Math.round(digitalUnits * 100) / 100,
            walkinsTarget: Math.round(walkins),
            leadsTarget: Math.round(leads),
            totalBudget: Math.round(budget)
        }, currentBookingActuals);
    };

    const handleBookingChange = (field: keyof BookingActuals, value: string) => {
        const numVal = parseFloat(value) || 0;
        const updatedBookings = { ...currentBookingActuals, [field]: numVal };
        setCurrentBookingActuals(updatedBookings);
        onUpdate(plan, updatedBookings);
    };

    const formatCurrency = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        return `₹${val.toLocaleString()}`;
    };

    const InputField = ({ label, value, onChange, type = "number", prefix = "" }: any) => (
        <div className="relative group">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 group-focus-within:text-brand-secondary transition-colors">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">{prefix}</span>}
                <input 
                    type={type} 
                    value={value} 
                    onChange={onChange} 
                    className={`w-full bg-background border border-slate-600 rounded-lg ${prefix ? 'pl-8' : 'px-3'} py-2 text-white font-medium focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all shadow-inner`} 
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1: Strategic Inputs */}
                <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700 hover:shadow-brand-secondary/5 transition-shadow duration-300">
                    <h3 className="text-lg font-bold text-brand-light mb-4 border-b border-slate-700 pb-2 flex items-center">
                        <span className="bg-brand-primary/20 text-brand-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span> 
                        Strategic Inputs
                    </h3>
                    <div className="space-y-4">
                        <InputField label="Overall Project BV (Cr)" value={plan.overallBV} onChange={(e:any) => handleChange('overallBV', e.target.value)} prefix="₹" />
                        <InputField label="Avg. Ticket Size (ATS) (Cr)" value={plan.ats} onChange={(e:any) => handleChange('ats', e.target.value)} prefix="₹" />
                        <InputField label="Digital Contribution (%)" value={plan.digitalContributionPercent} onChange={(e:any) => handleChange('digitalContributionPercent', e.target.value)} />
                        <InputField label="Target CPL (₹)" value={plan.targetCPL} onChange={(e:any) => handleChange('targetCPL', e.target.value)} prefix="₹" />
                        <div className="grid grid-cols-2 gap-4">
                             <InputField label="LTW %" value={plan.leadToWalkinRatio} onChange={(e:any) => handleChange('leadToWalkinRatio', e.target.value)} />
                             <InputField label="WTB %" value={plan.walkinToBookingRatio} onChange={(e:any) => handleChange('walkinToBookingRatio', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Budget Details */}
                <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700 hover:shadow-brand-secondary/5 transition-shadow duration-300">
                    <h3 className="text-lg font-bold text-brand-light mb-4 border-b border-slate-700 pb-2 flex items-center">
                        <span className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                        Budget & Legacy
                    </h3>
                    <div className="space-y-4">
                        <InputField label="Received Budget (₹)" value={plan.receivedBudget} onChange={(e:any) => handleChange('receivedBudget', e.target.value)} prefix="₹" />
                        <InputField label="Other Spends (₹)" value={plan.otherSpends} onChange={(e:any) => handleChange('otherSpends', e.target.value)} prefix="₹" />
                        <InputField label="Buffer Amount (₹)" value={plan.buffer} onChange={(e:any) => handleChange('buffer', e.target.value)} prefix="₹" />
                        <InputField label="Legacy/Non-Digital Unit Tgt" value={plan.lnUnitsTarget} onChange={(e:any) => handleChange('lnUnitsTarget', e.target.value)} />
                    </div>
                </div>

                {/* Section 3: Booking Actuals */}
                 <div className="bg-surface rounded-xl shadow-lg p-6 border border-slate-700 hover:shadow-brand-secondary/5 transition-shadow duration-300">
                    <h3 className="text-lg font-bold text-brand-light mb-4 border-b border-slate-700 pb-2 flex items-center">
                        <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                        Booking Actuals (QTD)
                    </h3>
                     <div className="space-y-4">
                        <InputField label="Site BV Achieved (Cr)" value={currentBookingActuals.siteBVAchieved} onChange={(e:any) => handleBookingChange('siteBVAchieved', e.target.value)} prefix="₹" />
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Digital Bookings" value={currentBookingActuals.digitalBookings} onChange={(e:any) => handleBookingChange('digitalBookings', e.target.value)} />
                            <InputField label="Legacy Bookings" value={currentBookingActuals.lnBookings} onChange={(e:any) => handleBookingChange('lnBookings', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <InputField label="Digital BV (Cr)" value={currentBookingActuals.digitalBVAchieved} onChange={(e:any) => handleBookingChange('digitalBVAchieved', e.target.value)} prefix="₹" />
                             <InputField label="Legacy BV (Cr)" value={currentBookingActuals.lnBVAchieved} onChange={(e:any) => handleBookingChange('lnBVAchieved', e.target.value)} prefix="₹" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Derived Targets */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 border border-brand-secondary/30 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-secondary/10 rounded-full blur-xl"></div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center relative z-10">
                    <span className="w-2 h-2 bg-brand-secondary rounded-full mr-2 animate-pulse"></span>
                    Calculated Quarterly Targets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center relative z-10">
                    <div className="bg-surface/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700">
                        <p className="text-xs text-text-secondary uppercase font-semibold">Digital Revenue</p>
                        <p className="text-xl font-bold text-brand-light mt-1">{formatCurrency(plan.overallBV * (plan.digitalContributionPercent / 100) * 10000000)}</p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700">
                        <p className="text-xs text-text-secondary uppercase font-semibold">Digital Units</p>
                        <p className="text-xl font-bold text-brand-secondary mt-1">{plan.digitalUnitsTarget}</p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700">
                        <p className="text-xs text-text-secondary uppercase font-semibold">Walk-ins (AD)</p>
                        <p className="text-xl font-bold text-white mt-1">{plan.walkinsTarget}</p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700">
                        <p className="text-xs text-text-secondary uppercase font-semibold">Leads</p>
                        <p className="text-xl font-bold text-white mt-1">{plan.leadsTarget}</p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg backdrop-blur-sm border border-green-500/30 bg-green-900/10">
                        <p className="text-xs text-text-secondary uppercase font-semibold">Planned Budget</p>
                        <p className="text-xl font-bold text-green-400 mt-1">{formatCurrency(plan.totalBudget)}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700">
                <button 
                    onClick={onBack}
                    className="flex items-center bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                    <SaveIcon className="w-5 h-5 mr-2" />
                    Save Plan & Back
                </button>
            </div>
        </div>
    );
};