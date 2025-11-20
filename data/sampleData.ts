
import type { Project } from '../types';

export const sampleProjects: Project[] = [
  {
    id: 2,
    poc: 'Amey',
    name: 'Godrej Horizon',
    status: 'Live',
    changeLogs: [],
    quarterlyBusinessPlan: {
        overallBV: 350, // 350 Cr
        digitalContributionPercent: 12.5,
        ats: 7, // 7 Cr
        walkinToBookingRatio: 6.0,
        leadToWalkinRatio: 3.0,
        targetCPL: 4819,
        
        receivedBudget: 14000000,
        otherSpends: 500000,
        buffer: 200000,

        // Pre-calculated for initial state (will be dynamic in UI)
        digitalUnitsTarget: 5, 
        lnUnitsTarget: 1,
        walkinsTarget: 83, 
        leadsTarget: 2778,
        totalBudget: 13386111
    },
    bookingActuals: {
        siteBVAchieved: 12.5,
        digitalBookings: 2,
        lnBookings: 1,
        digitalBVAchieved: 14.0,
        lnBVAchieved: 7.0
    },
    performanceData: [
        { 
            weekLabel: "W1", startDate: "01-Oct", endDate: "05-Oct", 
            targets: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, 
            achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 } 
        },
        { 
            weekLabel: "W2", startDate: "06-Oct", endDate: "12-Oct", 
            targets: { leads: 0, appointments: 0, walkins: 0, spends: 0 }, 
            achieved: { leads: 32, appointments: 4, walkins: 2, spends: 0 } 
        },
        { 
            weekLabel: "W3", startDate: "13-Oct", endDate: "19-Oct", 
            targets: { leads: 194, appointments: 12, walkins: 6, spends: 933333 }, 
            achieved: { leads: 218, appointments: 3, walkins: 1, spends: 470434 } 
        },
        { 
            weekLabel: "W4", startDate: "20-Oct", endDate: "26-Oct", 
            targets: { leads: 222, appointments: 13, walkins: 7, spends: 1066667 }, 
            achieved: { leads: 143, appointments: 6, walkins: 2, spends: 403870 } 
        },
        { 
            weekLabel: "W5", startDate: "27-Oct", endDate: "02-Nov", 
            targets: { leads: 306, appointments: 15, walkins: 8, spends: 1466667 }, 
            achieved: { leads: 238, appointments: 2, walkins: 2, spends: 465349 } 
        },
        { 
            weekLabel: "W6", startDate: "03-Nov", endDate: "09-Nov", 
            targets: { leads: 306, appointments: 15, walkins: 8, spends: 1466667 }, 
            achieved: { leads: 228, appointments: 2, walkins: 3, spends: 1757063 } 
        },
        { 
            weekLabel: "W7", startDate: "10-Nov", endDate: "16-Nov", 
            targets: { leads: 361, appointments: 18, walkins: 9, spends: 1733333 }, 
            achieved: { leads: 248, appointments: 3, walkins: 1, spends: 713591 } 
        },
        { 
            weekLabel: "W8", startDate: "17-Nov", endDate: "23-Nov", 
            targets: { leads: 361, appointments: 20, walkins: 10, spends: 1733333 }, 
            achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 } 
        },
         { 
            weekLabel: "W9", startDate: "24-Nov", endDate: "30-Nov", 
            targets: { leads: 361, appointments: 20, walkins: 10, spends: 1733333 }, 
            achieved: { leads: 0, appointments: 0, walkins: 0, spends: 0 } 
        }
    ],
    currentPlatforms: [
      { name: 'Google Search', spends: 18336, leads: 2, appointments: 1, walkins: 0 },
      { name: 'Google Demand Gen', spends: 15000, leads: 4, appointments: 1, walkins: 0 },
      { name: 'Meta Main', spends: 68200, leads: 35, appointments: 2, walkins: 1 },
      { name: 'Meta PP', spends: 93700, leads: 39, appointments: 2, walkins: 0 },
      { name: '99 Acres', spends: 10000, leads: 5, appointments: 0, walkins: 0 },
    ]
  }
];
