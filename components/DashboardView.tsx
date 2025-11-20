
import React, { useState, useMemo } from 'react';
import type { Project, ProjectStatus, WeeklyPerformancePoint } from '../types';
import { PlusIcon, XCircleIcon, TrashIcon, PencilIcon } from './Icons';

interface DashboardViewProps {
  projects: Project[];
  onSelectProject: (projectId: number) => void;
  onAddProject: (name: string, poc: string) => void;
  onDeleteProject: (projectId: number) => void;
  onEditProject: (projectId: number, name: string, poc: string) => void;
  onUpdateStatus: (projectId: number, status: ProjectStatus) => void;
  onUpdateProject: (project: Project) => void;
}

const PROJECT_STATUSES: ProjectStatus[] = ['Plan sent to BM', 'Plan approved', 'Will go live', 'Live', 'Paused', 'NA'];

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'Plan sent to BM': return 'bg-blue-500/20 text-blue-200 border border-blue-500/40';
        case 'Plan approved': return 'bg-teal-500/20 text-teal-200 border border-teal-500/40';
        case 'Will go live': return 'bg-orange-500/20 text-orange-200 border border-orange-500/40';
        case 'Live': return 'bg-green-500/20 text-green-200 border border-green-500/40';
        case 'Paused': return 'bg-red-500/20 text-red-200 border border-red-500/40';
        case 'NA': return 'bg-slate-700/50 text-slate-400 border border-slate-600';
        default: return 'bg-slate-700 text-slate-300';
    }
};

// Helper to parse "DD-MMM" format (e.g., "6-Oct") assuming current/next year context
const parseWeekDate = (dateStr: string): Date => {
    if (!dateStr || dateStr === 'Future') return new Date(2100, 0, 1);
    
    const [day, monthStr] = dateStr.split('-');
    const monthMap: {[key:string]: number} = { 
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 
    };
    
    const month = monthMap[monthStr];
    if (month === undefined) return new Date(); // Fallback

    // Simple logic: If month is Oct-Dec, assume 2025. If Jan-Sep, assume 2026 (Fiscal Year logic)
    // Adjust year based on your actual fiscal year needs. Defaulting to 2025 for the provided sample context.
    const year = (month >= 9) ? 2025 : 2026; 
    
    return new Date(year, month, parseInt(day));
};

export const DashboardView: React.FC<DashboardViewProps> = ({ projects, onSelectProject, onAddProject, onDeleteProject, onEditProject, onUpdateStatus, onUpdateProject }) => {
  const [selectedPoc, setSelectedPoc] = useState('All');
  const [viewMode, setViewMode] = useState<'region' | 'agency'>('region'); // Region = Ex Tax, Agency = Incl Tax
  
  // Date Filter State
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form States
  const [projectName, setProjectName] = useState('');
  const [projectPoc, setProjectPoc] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const pocs = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.poc)))], [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedPoc === 'All') return projects;
    return projects.filter(p => p.poc === selectedPoc);
  }, [projects, selectedPoc]);

  const handleOpenAddModal = () => {
      setProjectName('');
      setProjectPoc('');
      setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Project, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setProjectName(p.name);
      setProjectPoc(p.poc);
      setEditingProjectId(p.id);
      setIsEditModalOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (projectName && projectPoc) {
          onAddProject(projectName, projectPoc);
          setIsAddModalOpen(false);
      }
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingProjectId && projectName && projectPoc) {
          onEditProject(editingProjectId, projectName, projectPoc);
          setIsEditModalOpen(false);
          setEditingProjectId(null);
      }
  };

  const handleBudgetEdit = (p: Project, field: 'receivedBudget' | 'otherSpends' | 'buffer', valStr: string) => {
      const val = parseFloat(valStr) || 0;
      const updatedProject = {
          ...p,
          quarterlyBusinessPlan: {
              ...p.quarterlyBusinessPlan,
              [field]: val
          }
      };
      onUpdateProject(updatedProject);
  };

  // Helper to filter weeks
  const getFilteredWeeks = (performanceData: WeeklyPerformancePoint[]) => {
      if (!filterStartDate && !filterEndDate) return performanceData;

      const start = filterStartDate ? new Date(filterStartDate) : new Date('2000-01-01');
      const end = filterEndDate ? new Date(filterEndDate) : new Date('2100-01-01');

      return performanceData.filter(week => {
          const weekStart = parseWeekDate(week.startDate);
          const weekEnd = parseWeekDate(week.endDate);
          // Check for overlap or containment
          return weekStart <= end && weekEnd >= start;
      });
  };

  const isFiltering = !!(filterStartDate || filterEndDate);

  // Improved Formatting
  const fmt = (val: number, decimals = 0) => val ? `₹${val.toLocaleString(undefined, { maximumFractionDigits: decimals })}` : '₹0';
  const fmtCr = (val: number) => val ? `₹${(val / 10000000).toFixed(2)} Cr` : '-';
  const fmtL = (val: number) => val ? `₹${(val / 100000).toFixed(2)} L` : '-';
  const fmtPct = (num: number, den: number) => den > 0 ? `${((num / den) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="space-y-6 relative animate-fadeIn pb-20 md:pb-0">
        {/* Mobile Heading */}
        <div className="block md:hidden mb-4">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">Projects</h2>
             <p className="text-xs text-text-secondary">QTD Overview</p>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="hidden md:block">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary drop-shadow-sm">QTD Dashboard</h2>
                <p className="text-text-secondary text-sm mt-1">Manage QTD budget, actuals, and status across all projects.</p>
            </div>
            
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                {/* Date Filter Slicer */}
                <div className="flex items-center justify-between gap-2 bg-surface/50 p-2 rounded-xl border border-slate-700/50 backdrop-blur-sm w-full md:w-auto">
                    <div className="flex gap-2 items-center">
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-text-secondary mb-1">From</label>
                            <input 
                                type="date" 
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-brand-secondary w-28 md:w-auto"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-text-secondary mb-1">To</label>
                            <input 
                                type="date" 
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-brand-secondary w-28 md:w-auto"
                            />
                        </div>
                    </div>
                    {(filterStartDate || filterEndDate) && (
                        <button 
                            onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                            className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 bg-surface/50 p-2 rounded-xl border border-slate-700/50 backdrop-blur-sm w-full md:w-auto overflow-x-auto">
                    {/* View Mode Tabs */}
                    <div className="flex bg-slate-900/80 p-1 rounded-lg whitespace-nowrap">
                        <button 
                            onClick={() => setViewMode('region')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-300 ${viewMode === 'region' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-text-secondary hover:text-white'}`}
                        >
                            Region
                        </button>
                        <button 
                            onClick={() => setViewMode('agency')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-300 ${viewMode === 'agency' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-text-secondary hover:text-white'}`}
                        >
                            Agency
                        </button>
                    </div>

                    <div className="flex items-center border-l border-slate-700 pl-4 whitespace-nowrap">
                        <label htmlFor="poc-slicer" className="text-sm font-medium text-text-secondary mr-2">POC:</label>
                        <select 
                            id="poc-slicer"
                            value={selectedPoc}
                            onChange={(e) => setSelectedPoc(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded py-1.5 px-2 text-sm text-white outline-none focus:ring-1 focus:ring-brand-secondary hover:border-brand-secondary transition-colors"
                        >
                            {pocs.map(poc => <option key={poc} value={poc}>{poc}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleOpenAddModal}
                        className="hidden md:flex items-center bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-secondary hover:to-brand-primary text-white px-5 py-2 rounded-lg shadow-lg text-sm font-bold transition-all transform hover:scale-105"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
             {filteredProjects.map((p) => {
                  const qbp = p.quarterlyBusinessPlan;
                  const filteredWeeks = getFilteredWeeks(p.performanceData);
                  const rawPerfSpends = filteredWeeks.reduce((s, w) => s + w.achieved.spends, 0);
                  const totalAchLeads = filteredWeeks.reduce((s, w) => s + w.achieved.leads, 0);
                  const taxFactor = viewMode === 'agency' ? 1.18 : 1.0;
                  const perfSpends = rawPerfSpends * taxFactor;
                  const otherSpends = qbp.otherSpends || 0;
                  const totalSpends = perfSpends + otherSpends;
                  const achCPL = totalAchLeads > 0 ? perfSpends / totalAchLeads : 0;

                 return (
                    <div key={p.id} className="bg-surface/80 border border-slate-700 rounded-xl p-4 shadow-lg active:scale-[0.99] transition-transform" onClick={() => onSelectProject(p.id)}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">{p.name}</h3>
                                <p className="text-xs text-text-secondary mt-1">POC: {p.poc}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(p.status)}`}>
                                {p.status}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-slate-900/50 p-2 rounded">
                                <p className="text-[10px] text-text-secondary uppercase">Total Spend</p>
                                <p className="text-sm font-bold text-white">{fmtL(totalSpends)}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded">
                                <p className="text-[10px] text-text-secondary uppercase">Leads</p>
                                <p className="text-sm font-bold text-yellow-400">{totalAchLeads}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded">
                                <p className="text-[10px] text-text-secondary uppercase">CPL</p>
                                <p className="text-sm font-bold text-red-300">{fmt(achCPL)}</p>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-slate-700/50 pt-2 gap-3">
                             <button 
                                onClick={(e) => handleOpenEditModal(p, e)}
                                className="text-xs text-text-secondary flex items-center gap-1 p-1"
                             >
                                 <PencilIcon className="w-3 h-3" /> Edit
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                                className="text-xs text-red-400 flex items-center gap-1 p-1"
                             >
                                 <TrashIcon className="w-3 h-3" /> Delete
                             </button>
                        </div>
                    </div>
                 )
             })}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block bg-surface/30 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto max-w-full custom-scrollbar">
                <table className="border-collapse w-full text-xs text-center">
                    <thead className="bg-slate-900/90 text-text-secondary">
                        {/* Top Group Headers */}
                        <tr>
                            <th colSpan={3} className="p-3 border-r border-slate-700 sticky left-0 glass-header z-30 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">Project Info</th>
                            <th colSpan={8} className="p-3 border-r border-slate-700 bg-blue-900/40 text-blue-200 font-bold uppercase tracking-wider">Budget ({viewMode === 'agency' ? 'Incl. Tax' : 'Excl. Tax'})</th>
                            <th colSpan={4} className="p-3 border-r border-slate-700 bg-yellow-900/40 text-yellow-200 font-bold uppercase tracking-wider">Leads</th>
                            <th colSpan={4} className="p-3 border-r border-slate-700 bg-green-900/40 text-green-200 font-bold uppercase tracking-wider">AD (Walkins)</th>
                            <th colSpan={4} className="p-3 border-r border-slate-700 bg-purple-900/40 text-purple-200 font-bold uppercase tracking-wider">AP (Site Visits)</th>
                            <th colSpan={8} className="p-3 border-r border-slate-700 bg-red-900/40 text-red-200 font-bold uppercase tracking-wider">Ratios</th>
                            <th colSpan={14} className="p-3 bg-orange-900/40 text-orange-200 font-bold uppercase tracking-wider">Booking / Sales</th>
                        </tr>
                        {/* Column Headers */}
                        <tr className="text-[10px] uppercase tracking-wider font-semibold border-b border-slate-700 text-text-secondary">
                            {/* Project Info */}
                            <th className="p-2 min-w-[90px] sticky left-0 glass-header z-20 border-r border-slate-700">POC</th>
                            <th className="p-2 min-w-[140px] sticky left-[90px] glass-header z-20 border-r border-slate-700">Project</th>
                            <th className="p-2 min-w-[110px] sticky left-[230px] glass-header z-20 border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">Status</th>

                            {/* Budget */}
                            <th className="p-2 min-w-[90px] bg-blue-900/10">{isFiltering ? 'Planned (Range)' : (viewMode === 'agency' ? 'All-in Planned' : 'Planned Budget')}</th>
                            <th className="p-2 min-w-[90px] bg-blue-900/10 text-blue-200">Received (Edit)</th>
                            <th className="p-2 min-w-[90px] bg-blue-900/10">Perf Spends</th>
                            <th className="p-2 min-w-[80px] bg-blue-900/10 text-blue-200">Other (Edit)</th>
                            <th className="p-2 min-w-[80px] bg-blue-900/10 text-blue-200">Buffer (Edit)</th>
                            <th className="p-2 min-w-[90px] bg-blue-900/10 font-bold text-white">Total Spends</th>
                            <th className="p-2 min-w-[60px] bg-blue-900/10">% Spent</th>
                            <th className="p-2 min-w-[90px] bg-blue-900/10">Pending</th>

                            {/* Leads */}
                            <th className="p-2 min-w-[60px] bg-yellow-900/10">{isFiltering ? 'Target (Range)' : 'Target'}</th>
                            <th className="p-2 min-w-[60px] bg-yellow-900/10">Tgt till Date</th>
                            <th className="p-2 min-w-[60px] bg-yellow-900/10 text-white">Achieved</th>
                            <th className="p-2 min-w-[60px] bg-yellow-900/10">% Del</th>

                            {/* AD */}
                            <th className="p-2 min-w-[60px] bg-green-900/10">{isFiltering ? 'Target (Range)' : 'Target'}</th>
                            <th className="p-2 min-w-[60px] bg-green-900/10">Tgt till Date</th>
                            <th className="p-2 min-w-[60px] bg-green-900/10 text-white">Achieved</th>
                            <th className="p-2 min-w-[60px] bg-green-900/10">% Del</th>

                            {/* AP */}
                            <th className="p-2 min-w-[60px] bg-purple-900/10">{isFiltering ? 'Target (Range)' : 'Target'}</th>
                            <th className="p-2 min-w-[60px] bg-purple-900/10">Tgt till Date</th>
                            <th className="p-2 min-w-[60px] bg-purple-900/10 text-white">Achieved</th>
                            <th className="p-2 min-w-[60px] bg-purple-900/10">L2AP %</th>

                            {/* Ratios */}
                            <th className="p-2 min-w-[70px] bg-red-900/10">Tgt CPL</th>
                            <th className="p-2 min-w-[70px] bg-red-900/10 font-bold text-white">Ach CPL</th>
                            <th className="p-2 min-w-[70px] bg-red-900/10">Tgt CPW</th>
                            <th className="p-2 min-w-[70px] bg-red-900/10 font-bold text-white">Ach CPW</th>
                            <th className="p-2 min-w-[60px] bg-red-900/10">Tgt LTW%</th>
                            <th className="p-2 min-w-[60px] bg-red-900/10 font-bold text-white">Ach LTW%</th>
                            <th className="p-2 min-w-[60px] bg-red-900/10">Tgt WTB%</th>
                            <th className="p-2 min-w-[60px] bg-red-900/10 font-bold text-white">Ach WTB%</th>

                            {/* Bookings */}
                            <th className="p-2 min-w-[70px] bg-orange-900/10">Target BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10">Site BV Ach</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10">Tgt Digi Units</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10">Tgt LN Units</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10 text-white">Ach Digi Units</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10">Ach LN Units</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10 text-white">Ach Total Units</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10">Tgt Digi BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10">Tgt LN BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10 text-white">Ach Digi BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10">Ach LN BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10 text-white">Ach Total BV</th>
                            <th className="p-2 min-w-[70px] bg-orange-900/10">ATS</th>
                            <th className="p-2 min-w-[60px] bg-orange-900/10">Ach COM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-[11px]">
                        {filteredProjects.map((p, idx) => {
                            const qbp = p.quarterlyBusinessPlan;
                            const bAct = p.bookingActuals || { siteBVAchieved:0, digitalBookings:0, lnBookings:0, digitalBVAchieved:0, lnBVAchieved:0 };
                            
                            // --- FILTERING LOGIC ---
                            const filteredWeeks = getFilteredWeeks(p.performanceData);
                            
                            // --- Aggregates from Weekly Performance (Base/Region Values) ---
                            const rawPerfSpends = filteredWeeks.reduce((s, w) => s + w.achieved.spends, 0);
                            const totalAchLeads = filteredWeeks.reduce((s, w) => s + w.achieved.leads, 0);
                            const totalAchWalkins = filteredWeeks.reduce((s, w) => s + w.achieved.walkins, 0);
                            const totalAchAP = filteredWeeks.reduce((s, w) => s + w.achieved.appointments, 0);
                            
                            // Targets Till Date (Aggregated based on filter)
                            const totalTgtLeadsTD = filteredWeeks.reduce((s, w) => s + w.targets.leads, 0);
                            const totalTgtWalkinsTD = filteredWeeks.reduce((s, w) => s + w.targets.walkins, 0);
                            const totalTgtAPTD = filteredWeeks.reduce((s, w) => s + w.targets.appointments, 0);
                            const totalTgtSpendsTD = filteredWeeks.reduce((s, w) => s + w.targets.spends, 0);

                            // --- VIEW LOGIC (Tax Handling) ---
                            const taxFactor = viewMode === 'agency' ? 1.18 : 1.0;
                            
                            // If Filtering: Planned Budget = Sum of Targets for that period. If Not: Total Q Budget.
                            const plannedBudget = isFiltering 
                                ? totalTgtSpendsTD * taxFactor 
                                : qbp.totalBudget * taxFactor;

                            const perfSpends = rawPerfSpends * taxFactor;
                            
                            // Editable Fields (Static inputs, not filtered by date)
                            const received = qbp.receivedBudget || 0;
                            const otherSpends = qbp.otherSpends || 0;
                            const buffer = qbp.buffer || 0;
                            
                            const totalSpends = perfSpends + otherSpends;
                            const pendingBudget = received - totalSpends;

                            // --- Ratios (Calculated on Filtered Data) ---
                            const achCPL = totalAchLeads > 0 ? perfSpends / totalAchLeads : 0;
                            const achCPW = totalAchWalkins > 0 ? perfSpends / totalAchWalkins : 0;
                            const achLTW = totalAchLeads > 0 ? (totalAchWalkins / totalAchLeads) * 100 : 0;
                            const achWTB = totalAchWalkins > 0 ? (bAct.digitalBookings / totalAchWalkins) * 100 : 0;
                            const l2ap = totalAchLeads > 0 ? (totalAchAP / totalAchLeads) * 100 : 0;

                            // --- Bookings (Static / Not tracked weekly yet) ---
                            const achTotalUnits = bAct.digitalBookings + bAct.lnBookings;
                            const tgtDigiBV = (qbp.overallBV * (qbp.digitalContributionPercent/100));
                            const tgtLNBV = qbp.overallBV - tgtDigiBV; 
                            const achTotalBV = bAct.digitalBVAchieved + bAct.lnBVAchieved;
                            const achCOM = achTotalBV > 0 ? (totalSpends / 10000000) / achTotalBV : 0; 

                            // Determine what Target to show (Full Q or Filtered Slice)
                            const displayLeadsTarget = isFiltering ? totalTgtLeadsTD : qbp.leadsTarget;
                            const displayWalkinsTarget = isFiltering ? totalTgtWalkinsTD : qbp.walkinsTarget;
                            // AP Target not strictly defined in Q Plan, so we use TD sum
                            const displayAPTarget = totalTgtAPTD;

                            return (
                                <tr key={p.id} className="hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 animate-fadeIn" style={{animationDelay: `${idx * 50}ms`}}>
                                    {/* Project Info */}
                                    <td className="p-3 sticky left-0 glass z-10 text-left font-medium truncate max-w-[90px] border-r border-slate-700">{p.poc}</td>
                                    <td className="p-3 sticky left-[90px] glass z-10 text-left font-bold text-brand-secondary truncate max-w-[140px] cursor-pointer hover:text-brand-primary transition-colors border-r border-slate-700" onClick={() => onSelectProject(p.id)}>{p.name}</td>
                                    <td className="p-3 sticky left-[230px] glass z-10 border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
                                         <div className="flex flex-col gap-1">
                                             <select 
                                                value={p.status}
                                                onChange={(e) => onUpdateStatus(p.id, e.target.value as ProjectStatus)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-md border-none outline-none cursor-pointer w-full appearance-none text-center transition-all ${getStatusColor(p.status)}`}
                                            >
                                                {PROJECT_STATUSES.map(s => <option key={s} value={s} className="bg-surface text-text-primary">{s}</option>)}
                                            </select>
                                            <div className="flex justify-center mt-1 gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                                <PencilIcon className="w-3 h-3 cursor-pointer hover:text-brand-secondary" onClick={() => handleOpenEditModal(p)} />
                                                <TrashIcon className="w-3 h-3 cursor-pointer text-red-400 hover:text-red-300" onClick={() => onDeleteProject(p.id)} />
                                            </div>
                                         </div>
                                    </td>

                                    {/* Budget */}
                                    <td className={`p-2 border-r border-slate-700/50 ${isFiltering ? 'text-blue-300 font-medium' : ''}`}>{fmtL(plannedBudget)}</td>
                                    
                                    <td className="p-0 border-r border-slate-700/50 bg-blue-900/5 hover:bg-blue-900/20 transition-colors relative group">
                                        <input 
                                            type="number" 
                                            value={received || ''} 
                                            onChange={(e) => handleBudgetEdit(p, 'receivedBudget', e.target.value)}
                                            placeholder="-"
                                            className="w-full h-full text-center bg-transparent p-2 outline-none text-blue-100 font-medium placeholder-slate-600 focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </td>

                                    <td className="p-2 border-r border-slate-700/50 font-medium">{fmtL(perfSpends)}</td>
                                    
                                    <td className="p-0 border-r border-slate-700/50 bg-blue-900/5 hover:bg-blue-900/20 transition-colors">
                                        <input 
                                            type="number" 
                                            value={otherSpends || ''} 
                                            onChange={(e) => handleBudgetEdit(p, 'otherSpends', e.target.value)}
                                            placeholder="-"
                                            className="w-full h-full text-center bg-transparent p-2 outline-none text-blue-100 font-medium placeholder-slate-600 focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </td>

                                    <td className="p-0 border-r border-slate-700/50 bg-blue-900/5 hover:bg-blue-900/20 transition-colors">
                                        <input 
                                            type="number" 
                                            value={buffer || ''} 
                                            onChange={(e) => handleBudgetEdit(p, 'buffer', e.target.value)}
                                            placeholder="-"
                                            className="w-full h-full text-center bg-transparent p-2 outline-none text-blue-100 font-medium placeholder-slate-600 focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </td>

                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{fmtL(totalSpends)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtPct(totalSpends, received)}</td>
                                    <td className="p-2 border-r border-slate-700/50 text-text-secondary">{fmtL(pendingBudget)}</td>

                                    {/* Leads */}
                                    <td className="p-2 border-r border-slate-700/50">{displayLeadsTarget}</td>
                                    <td className="p-2 border-r border-slate-700/50">{totalTgtLeadsTD}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-medium text-white">{totalAchLeads}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtPct(totalAchLeads, displayLeadsTarget)}</td>

                                    {/* AD */}
                                    <td className="p-2 border-r border-slate-700/50">{displayWalkinsTarget}</td>
                                    <td className="p-2 border-r border-slate-700/50">{totalTgtWalkinsTD}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-medium text-white">{totalAchWalkins}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtPct(totalAchWalkins, displayWalkinsTarget)}</td>

                                    {/* AP */}
                                    <td className="p-2 border-r border-slate-700/50 text-xs">{isFiltering ? displayAPTarget : '-'}</td>
                                    <td className="p-2 border-r border-slate-700/50">{totalTgtAPTD}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-medium text-white">{totalAchAP}</td>
                                    <td className="p-2 border-r border-slate-700/50">{l2ap.toFixed(1)}%</td>

                                    {/* Ratios */}
                                    <td className="p-2 border-r border-slate-700/50">{fmt(qbp.targetCPL * taxFactor)}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-red-200">{fmt(achCPL)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtL((plannedBudget)/displayWalkinsTarget)}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{fmtL(achCPW)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{qbp.leadToWalkinRatio}%</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{achLTW.toFixed(1)}%</td>
                                    <td className="p-2 border-r border-slate-700/50">{qbp.walkinToBookingRatio}%</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{achWTB.toFixed(1)}%</td>

                                    {/* Bookings */}
                                    <td className="p-2 border-r border-slate-700/50">{fmtCr(qbp.overallBV)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtCr(bAct.siteBVAchieved)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{qbp.digitalUnitsTarget}</td>
                                    <td className="p-2 border-r border-slate-700/50">{qbp.lnUnitsTarget}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-orange-200">{bAct.digitalBookings}</td>
                                    <td className="p-2 border-r border-slate-700/50">{bAct.lnBookings}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{achTotalUnits}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtCr(tgtDigiBV)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtCr(tgtLNBV)}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-orange-200">{fmtCr(bAct.digitalBVAchieved)}</td>
                                    <td className="p-2 border-r border-slate-700/50">{fmtCr(bAct.lnBVAchieved)}</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{fmtCr(achTotalBV)}</td>
                                    <td className="p-2 border-r border-slate-700/50 text-text-secondary">{qbp.ats} Cr</td>
                                    <td className="p-2 border-r border-slate-700/50 font-bold text-white">{fmtPct(achCOM*100, 100)}</td>
                                </tr>
                            );
                        })}
                        {filteredProjects.length === 0 && (
                            <tr><td colSpan={35} className="p-8 text-center text-text-secondary italic">No projects found. Add a new project to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
         
        {/* Add/Edit Project Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md border border-slate-600 animate-slideUp">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                        <h3 className="text-lg font-bold text-brand-light">{isEditModalOpen ? 'Edit Project' : 'Add New Project'}</h3>
                        <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-text-secondary hover:text-white transition-colors">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={isEditModalOpen ? handleSubmitEdit : handleSubmitAdd} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                            <input 
                                type="text" 
                                required
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. Godrej Woods"
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">POC Name</label>
                            <input 
                                type="text" 
                                required
                                value={projectPoc}
                                onChange={(e) => setProjectPoc(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full bg-background border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="pt-4 flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="px-4 py-2 rounded-lg text-text-secondary hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-secondary hover:to-brand-primary text-white font-bold shadow-lg transition-all transform hover:scale-105"
                            >
                                {isEditModalOpen ? 'Save Changes' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Floating Action Button (Mobile Only) */}
        <button 
            onClick={handleOpenAddModal}
            className="md:hidden fixed bottom-6 right-6 bg-brand-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 animate-slideUp active:scale-90 transition-transform"
        >
            <PlusIcon className="w-8 h-8" />
        </button>
    </div>
  );
};
