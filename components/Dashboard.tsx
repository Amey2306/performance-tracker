import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StrategicPlan } from '../types';

interface DashboardProps {
  strategicPlan: StrategicPlan;
}

const COLORS = ['#3b82f6', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#a3e635', '#4ade80', '#2dd4bf', '#60a5fa'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-2 border border-slate-600 rounded-md shadow-lg">
        <p className="label font-bold text-brand-light">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
           <p key={index} style={{ color: pld.fill }}>{`${pld.name}: ₹${pld.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ strategicPlan }) => {

  const budgetComparisonData = strategicPlan.platformSpecificPlan.map(plan => {
    return {
      name: plan.platformName,
      'Recommended Budget': plan.recommendedBudget,
    };
  });

  const leadDistributionData = strategicPlan.platformSpecificPlan
    .filter(p => p.projectedLeads > 0)
    .map(plan => ({
      name: plan.platformName,
      value: plan.projectedLeads,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="bg-surface rounded-xl shadow-lg p-6 h-96 lg:col-span-3">
        <h4 className="text-lg font-semibold text-brand-light mb-4">Recommended Budget Allocation</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={budgetComparisonData} margin={{ top: 5, right: 20, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} fontSize={12} angle={-25} textAnchor="end" />
            <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} />
            <Legend wrapperStyle={{ color: '#f8fafc', paddingTop: '20px' }} />
            <Bar dataKey="Recommended Budget" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6 h-96 lg:col-span-2">
        <h4 className="text-lg font-semibold text-brand-light mb-4">Projected Lead Distribution</h4>
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                 <Pie
                    data={leadDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                 >
                    {leadDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={''} />
                    ))}
                 </Pie>
                 <Tooltip formatter={(value: number, name: string) => [`${value} leads`, name]} />
                 <Legend />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};