export interface PerformanceMetrics {
    leads: number;
    appointments: number; // AP
    walkins: number; // AD (Actual Demonstrations)
    spends: number;
}

// A single week's data point, mirroring the structure of the performance tracker
export interface WeeklyPerformancePoint {
    week: string;
    targets: PerformanceMetrics;
    cumulativeTargets: PerformanceMetrics;
    achieved: PerformanceMetrics;
    cumulativeAchieved: PerformanceMetrics;
}

export interface PlatformPerformance {
    name: string;
    spends: number;
    leads: number;
    appointments: number;
}

// Represents the initial plan for a platform for the quarter
export interface PlatformPlanTarget {
    name: string;
    budgetPercent: number; // e.g., 8 for 8%
    targetCPL: number;
    leads: number;
    spends: number;
    walkins: number;
    capi: number; // Forecasted appointments
    capiToAp: number; // Capi to AP conversion rate
    apToAd: number; // AP to AD conversion rate
}

export interface Project {
    id: number;
    poc: string;
    name: string;
    qtdBudget: {
        allInPlan: number;
        totalSpends: number;
    };
    qtdLeads: {
        overallTgt: number;
        achieved: number;
    };
    qtdAppointments: { // AP
        target: number;
        achieved: number;
    };
    qtdWalkins: { // AD
        target: number;
        achieved: number;
    };
    // The detailed weekly performance tracker data
    performanceData: WeeklyPerformancePoint[];
    // The initial plan for platforms for the whole quarter
    quarterlyPlatformPlan: PlatformPlanTarget[];
    // Snapshot of current platform performance for forecasting baseline
    currentPlatforms: PlatformPerformance[];
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
    recommendation: string; // This will now be the AI's analysis of the user's plan
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

// --- Forecasting Simulator Types ---

export interface PlatformForecast {
    id: string; // Unique ID for React keys, e.g., 'Google Search' or 'new-16_13_23'
    name: string;
    spends: number;
    cpl: number;
    leads: number;
    // Conversion rates and downstream metrics
    capiToApRate: number; // in percent
    projectedAppointments: number;
    apToAdRate: number; // in percent
    projectedWalkins: number;
}
