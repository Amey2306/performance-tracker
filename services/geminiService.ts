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
                    recommendation: { type: Type.STRING, description: "This is the most important part. Act as a consultant. Analyze the user's choice for this platform. Is their projected CPL realistic compared to historical data? Is the budget allocation wise? Provide brief, insightful, actionable commentary and advice on their plan for this specific platform." }
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

  const prompt = `
    You are an expert Performance Marketing Analyst and Consultant. Your task is to analyze the historical campaign data for the project "${project.name}" and provide expert feedback on the user-generated forecast for the upcoming week.

    **Historical Performance Tracker Data (Week-over-Week):**
    This data shows weekly targets, cumulative targets, weekly achieved, and cumulative achieved values.
    \`\`\`json
    ${JSON.stringify(project.performanceData, null, 2)}
    \`\`\`

    **Initial Quarterly Platform-level Plan:**
    This was the original strategic plan for each platform. Use this as a baseline for what was initially intended.
    \`\`\`json
    ${JSON.stringify(project.quarterlyPlatformPlan, null, 2)}
    \`\`\`

    **User's Forecast for Next Week:**
    The user has created the following forecast. You need to analyze it.
    \`\`\`json
    ${JSON.stringify(forecastPlan.map(p => ({
        platformName: p.name,
        budget: p.spends,
        projectedCPL: p.cpl,
        projectedLeads: p.leads,
        projectedAppointments: p.projectedAppointments
    })), null, 2)}
    \`\`\`

    **Your Task:**
    Generate a JSON response that follows the schema.

    1.  **Performance Summary:** Write a brief summary analyzing the historical trends from the performance tracker. Are spends increasing? Is CPL improving or worsening? Are they consistently hitting targets?
    2.  **Gap Analysis:** Based on the **most recent week's data** from the performance tracker, compare the 'target' vs. 'achieved' metrics for Leads, Spends, and Appointments. Calculate the gap and assign a status.
    3.  **Next Week's Forecast Summary:** Summarize the user's plan. The 'requiredBudget' in your response MUST be ${totalForecastBudget}. The projected leads and appointments must also match the totals from the user's plan.
    4.  **Platform-Specific Strategic Plan Analysis (CRITICAL):**
        *   For each platform in the user's forecast, you MUST take their numbers (budget, leads, appointments) directly.
        *   Your main job is to write the **recommendation**. Act as a senior consultant reviewing this plan.
        *   **Analyze Feasibility:** Is the projected CPL for a platform realistic given its historical performance (you can derive historical CPL from the weekly tracker data)? For example, if Google Search has a historical CPL of ₹9,000, and the user forecasts a CPL of ₹2,000, you must flag this as highly optimistic and explain why.
        *   **Strategic Allocation:** Does the budget allocation make sense? Are they over-investing in underperforming channels or starving proven winners?
        *   **Provide Actionable Advice:** Give specific, actionable advice for each platform. Example: "The projected CPL of ₹4,200 for Google Search is aggressive compared to the recent average of ₹9,168. To achieve this, consider focusing on high-intent keywords and optimizing landing pages." or "Allocating 40% of the budget to Meta PP is a sound strategy given its consistent performance and lower CPL."

    Your response MUST be a single JSON object that adheres strictly to the provided schema. The values for budget, leads, and appointments in the platform plan MUST be the same as the user's input. Your unique contribution is the analysis and the 'recommendation' text.
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
    const parsedPlan = JSON.parse(jsonText) as StrategicPlan;

    // Ensure the AI hasn't hallucinated different numbers for the plan
    // Merge the AI's recommendation with the user's plan to be safe
    parsedPlan.platformSpecificPlan = parsedPlan.platformSpecificPlan.map(aiPlanItem => {
        const userPlanItem = forecastPlan.find(p => p.name === aiPlanItem.platformName);
        const projectedCPA = userPlanItem?.projectedAppointments && userPlanItem.projectedAppointments > 0 
            ? (userPlanItem.spends / userPlanItem.projectedAppointments) 
            : 0;
        return {
            ...aiPlanItem, // This has the AI's recommendation
            recommendedBudget: userPlanItem?.spends ?? 0,
            projectedLeads: userPlanItem?.leads ?? 0,
            projectedAppointments: userPlanItem?.projectedAppointments ?? 0,
            projectedCPL: userPlanItem?.cpl ?? 0,
            projectedCPA: projectedCPA,
        };
    });

    return parsedPlan;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get strategic plan from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the strategic plan.");
  }
};
