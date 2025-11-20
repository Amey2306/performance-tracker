
export interface PerformanceMetrics {
    leads: number;
    appointments: number; // AP (Site Visits Done)
    walkins: number; // AD (Actual Demonstrations/Walkins)
    spends: number;
    allInSpends?: number; // New: Including Tax
}

export interface WeeklyPerformancePoint {
    startDate: string;
    endDate: string;
    weekLabel: string; // e.g., "Week 1"
    targets: PerformanceMetrics;
    achieved: PerformanceMetrics;
    // Cumulative values are calculated on the fly or stored for caching
    cumulativeTargets?: PerformanceMetrics;
    cumulativeAchieved?: PerformanceMetrics;
}

export interface QuarterlyBusinessPlan {
    overallBV: number; // Business Value in Cr
    digitalContributionPercent: number; // e.g., 12.5
    ats: number; // Avg Ticket Size in Cr
    
    // Conversion Ratios (in %)
    walkinToBookingRatio: number; // WTB
    leadToWalkinRatio: number; // LTW
    
    // Cost Assumptions
    targetCPL: number;
    
    // Budget Details (New)
    receivedBudget: number;
    otherSpends: number;
    buffer: number;

    // Computed Targets (Quarterly Totals)
    digitalUnitsTarget: number;
    lnUnitsTarget: number; // Legacy/Non-Digital Units
    walkinsTarget: number; // AD
    leadsTarget: number;
    totalBudget: number; // All-in Planned Budget
}

export interface BookingActuals {
    siteBVAchieved: number;
    digitalBookings: number;
    lnBookings: number;
    digitalBVAchieved: number;
    lnBVAchieved: number;
}

export interface PlatformPerformance {
    name: string;
    spends: number;
    leads: number;
    appointments: number; // AP
    walkins: number; // AD
}

// Represents the detailed forecast for a specific platform for a specific week
export interface PlatformForecast {
    id: string;
    name: string;
    spends: number;
    cpl: number;
    leads: number;
    
    // Funnel Rates
    leadToCapiPercent: number; // % of leads that become "Connects/Appointments Proposed"
    capiToApPercent: number; // % of Capi that become AP (Site Visits)
    apToAdPercent: number; // % of AP that become AD (Walkins)
    
    // Calculated Downstream
    projectedCapi: number;
    projectedAppointments: number; // AP
    projectedWalkins: number; // AD
}

export interface ChangeLogEntry {
    id: string;
    date: string;
    description: string;
    user?: string;
}

export type ProjectStatus = 'Plan sent to BM' | 'Plan approved' | 'Will go live' | 'Live' | 'Paused' | 'NA';

export interface Project {
    id: number;
    poc: string;
    name: string;
    status: ProjectStatus;
    
    // The Strategic Business Plan
    quarterlyBusinessPlan: QuarterlyBusinessPlan;
    
    // Sales/Booking Performance (New)
    bookingActuals: BookingActuals;

    // The Week-on-Week Tracker
    performanceData: WeeklyPerformancePoint[];
    
    // Snapshot of current platform performance for forecasting baseline
    currentPlatforms: PlatformPerformance[];

    // History of changes
    changeLogs: ChangeLogEntry[];
}

// --- AI Service Related Types ---

export interface GapAnalysisItem {
    metric: string;
    target: string;
    achieved: string;
    gap: string;
    status: 'On Track' | 'At Risk' | 'Needs Attention';
}

export interface PlatformPlan {
    platformName: string;
    recommendedBudget: number;
    projectedLeads: number;
    projectedAppointments: number;
    projectedCPL: number;
    projectedCPA: number;
    recommendation: string; 
}

export interface StrategicPlan {
    performanceSummary: string;
    gapAnalysis: GapAnalysisItem[];
    nextWeekForecast: {
        overallProjectedLeads: number;
        overallProjectedAppointments: number;
        requiredBudget: number;
        summary: string;
    };
    platformSpecificPlan: PlatformPlan[];
}
