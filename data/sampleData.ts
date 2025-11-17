import type { Project } from '../types';

export const sampleProjects: Project[] = [
  {
    id: 1,
    poc: 'Amey',
    name: 'Godrej City',
    qtdBudget: { allInPlan: 3064936, totalSpends: 1763767 },
    qtdLeads: { overallTgt: 1299, achieved: 893 },
    qtdAppointments: { target: 182, achieved: 116 },
    qtdWalkins: { target: 91, achieved: 79 },
    performanceData: [], // Simplified for this example
    quarterlyPlatformPlan: [],
    currentPlatforms: [
        { name: 'Google Search', spends: 200000, leads: 100, appointments: 15 },
        { name: 'Meta PP', spends: 250000, leads: 150, appointments: 20 },
        { name: 'MagicBricks', spends: 30000, leads: 20, appointments: 3 },
    ]
  },
  {
    id: 2,
    poc: 'Amey',
    name: 'Godrej Horizon',
    qtdBudget: { allInPlan: 6473143, totalSpends: 4165503 },
    qtdLeads: { overallTgt: 1524, achieved: 1559 },
    qtdAppointments: { target: 106, achieved: 86 },
    qtdWalkins: { target: 53, achieved: 30 },
    performanceData: [
        { week: '30-Sep - 06-Oct', targets: { leads: 38, appointments: 3, walkins: 2, spends: 137143 }, cumulativeTargets: { leads: 38, appointments: 3, walkins: 2, spends: 137143 }, achieved: { leads: 32, appointments: 6, walkins: 4, spends: 161829 }, cumulativeAchieved: { leads: 32, appointments: 6, walkins: 4, spends: 161829 } },
        { week: '07-Oct - 13-Oct', targets: { leads: 76, appointments: 8, walkins: 4, spends: 274286 }, cumulativeTargets: { leads: 114, appointments: 11, walkins: 6, spends: 411429 }, achieved: { leads: 218, appointments: 7, walkins: 3, spends: 323657 }, cumulativeAchieved: { leads: 250, appointments: 13, walkins: 7, spends: 485486 } },
        { week: '14-Oct - 20-Oct', targets: { leads: 69, appointments: 6, walkins: 3, spends: 246857 }, cumulativeTargets: { leads: 183, appointments: 18, walkins: 9, spends: 658286 }, achieved: { leads: 143, appointments: 16, walkins: 6, spends: 291291 }, cumulativeAchieved: { leads: 393, appointments: 29, walkins: 13, spends: 776777 } },
        { week: '21-Oct - 27-Oct', targets: { leads: 229, appointments: 11, walkins: 6, spends: 822857 }, cumulativeTargets: { leads: 411, appointments: 29, walkins: 15, spends: 1481143 }, achieved: { leads: 238, appointments: 12, walkins: 2, spends: 465349 }, cumulativeAchieved: { leads: 631, appointments: 41, walkins: 15, spends: 1242126 } },
        { week: '28-Oct - 03-Nov', targets: { leads: 229, appointments: 9, walkins: 8, spends: 822857 }, cumulativeTargets: { leads: 640, appointments: 38, walkins: 22, spends: 2304000 }, achieved: { leads: 224, appointments: 11, walkins: 7, spends: 747748 }, cumulativeAchieved: { leads: 855, appointments: 52, walkins: 22, spends: 1989874 } },
        { week: '04-Nov - 10-Nov', targets: { leads: 274, appointments: 24, walkins: 10, spends: 987429 }, cumulativeTargets: { leads: 914, appointments: 62, walkins: 32, spends: 3291429 }, achieved: { leads: 411, appointments: 18, walkins: 2, spends: 883886 }, cumulativeAchieved: { leads: 1266, appointments: 70, walkins: 24, spends: 2873760 } },
        { week: '11-Nov - 17-Nov', targets: { leads: 244, appointments: 8, walkins: 5, spends: 877714 }, cumulativeTargets: { leads: 1158, appointments: 70, walkins: 37, spends: 4169143 }, achieved: { leads: 140, appointments: 7, walkins: 2, spends: 589586 }, cumulativeAchieved: { leads: 1406, appointments: 77, walkins: 26, spends: 3463346 } },
        { week: '18-Nov - 24-Nov', targets: { leads: 183, appointments: 10, walkins: 5, spends: 658286 }, cumulativeTargets: { leads: 1341, appointments: 80, walkins: 42, spends: 4827429 }, achieved: { leads: 107, appointments: 6, walkins: 3, spends: 343980 }, cumulativeAchieved: { leads: 1513, appointments: 83, walkins: 29, spends: 3807326 } },
        { week: '25-Nov - 01-Dec', targets: { leads: 152, appointments: 5, walkins: 1, spends: 548571 }, cumulativeTargets: { leads: 1493, appointments: 85, walkins: 43, spends: 5376000 }, achieved: { leads: 46, appointments: 3, walkins: 1, spends: 128643 }, cumulativeAchieved: { leads: 1559, appointments: 86, walkins: 30, spends: 3935969 } },
        { week: '02-Dec - 08-Dec', targets: { leads: 30, appointments: 2, walkins: 1, spends: 109714 }, cumulativeTargets: { leads: 1524, appointments: 87, walkins: 44, spends: 5485714 }, achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeAchieved: { leads: 1559, appointments: 86, walkins: 30, spends: 3935969 } },
        { week: '09-Dec - 15-Dec', targets: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeTargets: { leads: 1524, appointments: 87, walkins: 44, spends: 5485714 }, achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeAchieved: { leads: 1559, appointments: 86, walkins: 30, spends: 3935969 } },
        { week: '16-Dec - 22-Dec', targets: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeTargets: { leads: 1524, appointments: 87, walkins: 44, spends: 5485714 }, achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeAchieved: { leads: 1559, appointments: 86, walkins: 30, spends: 3935969 } },
        { week: '23-Dec - 29-Dec', targets: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, cumulativeTargets: { leads: 1524, appointments: 87, walkins: 44, spends: 5485714 }, achieved: { leads: 0, appointments: 0, walkins: 0, spends: 229625 }, cumulativeAchieved: { leads: 1559, appointments: 86, walkins: 30, spends: 4165594 } },
    ],
    quarterlyPlatformPlan: [
      { name: 'Google Search', budgetPercent: 8, targetCPL: 4200, leads: 230, spends: 966000, walkins: 10, capi: 20, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Google Demand gen', budgetPercent: 18, targetCPL: 4200, leads: 18, spends: 77280, walkins: 4, capi: 4, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Google Display', budgetPercent: 10, targetCPL: 4200, leads: 23, spends: 96600, walkins: 2, capi: 2, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Google Pmax', budgetPercent: 5, targetCPL: 4200, leads: 12, spends: 48300, walkins: 2, capi: 1, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Meta main', budgetPercent: 14, targetCPL: 4200, leads: 32, spends: 135240, walkins: 6, capi: 2, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Meta PP', budgetPercent: 40, targetCPL: 4200, leads: 92, spends: 386400, walkins: 18, capi: 8, capiToAp: 0.35, apToAd: 0.50 },
      { name: '99 Acres', budgetPercent: 5, targetCPL: 4200, leads: 12, spends: 48300, walkins: 2, capi: 1, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Revspot', budgetPercent: 8, targetCPL: 4200, leads: 18, spends: 77280, walkins: 4, capi: 1, capiToAp: 0.35, apToAd: 0.50 },
      { name: 'Taboola', budgetPercent: 5, targetCPL: 4200, leads: 12, spends: 48300, walkins: 2, capi: 0, capiToAp: 0.35, apToAd: 0.50 },
    ],
    currentPlatforms: [
      { name: 'Google Search and VCC', spends: 18336, leads: 2, appointments: 1 },
      { name: 'Google Demand gen', spends: 15000, leads: 4, appointments: 1 },
      { name: 'Google Display', spends: 7426, leads: 5, appointments: 0 },
      { name: 'Meta main', spends: 68200, leads: 35, appointments: 2 },
      { name: 'Meta PP', spends: 93700, leads: 39, appointments: 2 },
      { name: '99 Acres', spends: 10000, leads: 5, appointments: 0 },
      { name: 'Revspot', spends: 0, leads: 0, appointments: 0 },
      { name: 'Taboola', spends: 0, leads: 0, appointments: 0 },
    ]
  },
  // Other projects simplified for brevity
  {
    id: 3,
    poc: 'Amey',
    name: 'Godrej Five Gardens',
    qtdBudget: { allInPlan: 590000, totalSpends: 182393 },
    qtdLeads: { overallTgt: 104, achieved: 50 },
    qtdAppointments: { target: 6, achieved: 6 },
    qtdWalkins: { target: 3, achieved: 3 },
    performanceData: [],
    quarterlyPlatformPlan: [],
    currentPlatforms: [
        { name: 'Google Pmax', spends: 40000, leads: 10, appointments: 1 },
        { name: 'Meta Main', spends: 47393, leads: 12, appointments: 1 },
    ]
  },
];
