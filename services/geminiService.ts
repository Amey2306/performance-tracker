
import { GoogleGenAI, Type } from "@google/genai";
import type { StrategicPlan, Project, PlatformForecast } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const strategicPlanSchema = {
    type: Type.OBJECT,
    properties: {
        performanceSummary: { type: Type.STRING, description: "A brief, high-level summary of the campaign's historical performance, noting key trends and issues based on the provided weekly data." },
        gapAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    metric: { type: Type.STRING },
                    target: { type: Type.STRING, description: "The target for the most recent week." },
                    achieved: { type: Type.STRING, description: "The achieved value for the most recent week." },
                    gap: { type: Type.STRING, description: "The difference, e.g., '-15 leads' or '+250 CPL'." },
                    status: { type: Type.STRING, description: "'On Track', 'At Risk', or 'Needs Attention' based on the most recent week's performance." }
                },
                required: ["metric", "target", "achieved", "gap", "status"]
            }
        },
        nextWeekForecast: {
            type: Type.OBJECT,
            properties: {
                overallProjectedLeads: { type: Type.INTEGER },
                overallProjectedAppointments: { type: Type.INTEGER },
                requiredBudget: { type: Type.NUMBER, description: "The total budget from the user's forecast." },
                summary: { type: Type.STRING, description: "A short summary of the user's forecast for the next week." }
            },
            required: ["overallProjectedLeads", "overallProjectedAppointments", "requiredBudget", "summary"]
        },
        platformSpecificPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platformName: { type: Type.STRING },
                    recommendedBudget: { type: Type.NUMBER },
                    projectedLeads: { type: Type.INTEGER },
                    projectedAppointments: { type: Type.INTEGER },
                    projectedCPL: { type: Type.NUMBER },
                    projectedCPA: { type: Type.NUMBER },
                    recommendation: { type: Type.STRING, description: "Detailed strategic advice." }
                },
                required: ["platformName", "recommendedBudget", "projectedLeads", "projectedAppointments", "projectedCPL", "projectedCPA", "recommendation"]
            }
        }
    },
    required: ["performanceSummary", "gapAnalysis", "nextWeekForecast", "platformSpecificPlan"]
};

interface PlanOptions {
    forecastPlan: PlatformForecast[];
}

export const getStrategicPlan = async (project: Project, options: PlanOptions, isThinkingMode: boolean): Promise<StrategicPlan> => {
  const { forecastPlan } = options;
  const totalForecastBudget = forecastPlan.reduce((sum, p) => sum + p.spends, 0);

  // Extract Business Goals for context
  const { overallBV, ats, digitalUnitsTarget, targetCPL } = project.quarterlyBusinessPlan;

  const prompt = `
    You are a Senior Performance Marketing Director. Review the campaign plan for "${project.name}".

    **Business Goals (Quarterly):**
    - Overall Business Value Target: ${overallBV} Cr
    - ATS (Avg Ticket Size): ${ats} Cr
    - Digital Units Target: ${digitalUnitsTarget} Units
    - Target CPL: ₹${targetCPL}

    **Historical Performance (Week-over-Week):**
    \`\`\`json
    ${JSON.stringify(project.performanceData.slice(-4), null, 2)} 
    \`\`\`
    (Only showing last 4 weeks for brevity)

    **User's Proposed Media Plan for Next Week:**
    \`\`\`json
    ${JSON.stringify(forecastPlan.map(p => ({
        platform: p.name,
        budget: p.spends,
        cpl: p.cpl,
        leads: p.leads,
        appointments: p.projectedAppointments,
        walkins: p.projectedWalkins
    })), null, 2)}
    \`\`\`

    **Task:**
    1.  **Analyze Alignment:** Does this media plan put the project on track to hit the ${digitalUnitsTarget} Unit target? Consider the full funnel (Leads -> Appointments -> Walkins).
    2.  **Feasibility Check:** Is the CPL realistic given recent history? Are the conversion rates (Leads to AP, AP to AD) in the forecast optimistic or conservative compared to the Business Plan ratios?
    3.  **Recommendations:** Provide specific tactical advice per platform. If they are spending too much on a low-performing channel, call it out.

    Return the response strictly in JSON following the schema.
  `;

  const modelConfig = isThinkingMode 
    ? { model: "gemini-2.5-pro", config: { thinkingConfig: { thinkingBudget: 32768 } } }
    : { model: "gemini-2.5-flash", config: {} };

  try {
    const response = await ai.models.generateContent({
      model: modelConfig.model,
      contents: prompt,
      config: {
        ...modelConfig.config,
        responseMimeType: "application/json",
        responseSchema: strategicPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as StrategicPlan;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate strategic plan.");
  }
};
