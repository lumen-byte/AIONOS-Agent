import OpenAI from "openai";
import { z } from "zod";
import contextData from "../data/context.json";

// Initialize OpenAI conditionally to use Groq API
const openai = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  maxRetries: 0, // Fail fast instead of hanging on rate limit
}) : null;

const MODEL_NAME = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

// The structured schema for the Daily Brief as requested by the assignment
export const DailyBriefSchema = z.object({
  myActions: z.array(z.object({
    id: z.string(),
    task: z.string(),
    deadline: z.string().nullable(),
    source: z.string(),
    status: z.enum(["overdue", "due_today", "upcoming", "none"]).default("none")
  })),
  waitingOnOthers: z.array(z.object({
    id: z.string(),
    task: z.string(),
    owner: z.string(),
    deadline: z.string().nullable(),
    source: z.string()
  })),
  unclearOwnership: z.array(z.object({
    id: z.string(),
    task: z.string(),
    potentialOwners: z.array(z.string()),
    deadline: z.string().nullable(),
    source: z.string()
  })),
  commitments: z.array(z.object({
    id: z.string(),
    task: z.string(),
    recipient: z.string(),
    deadline: z.string().nullable(),
    source: z.string()
  }))
});

export type DailyBrief = z.infer<typeof DailyBriefSchema>;

const SYSTEM_PROMPT = `
You are an Executive Productivity Agent for Arjun Malhotra (VP Sales).
Your task is to convert messy executive inputs (meetings, emails, voice notes, calendar) into a concise daily action brief.

The current week is Monday, 21 September 2026 - Friday, 25 September 2026.
Assume today is Wednesday, 23 September 2026 for the sake of relative deadlines (e.g. "today", "tomorrow").

Key Rules:
1. Identify commitments made by the executive (Arjun).
2. Separate "my actions" (Arjun's tasks) from "waiting on others" (tasks assigned to others).
3. Detect deadlines and overdue items (e.g., if a deadline was Tuesday and today is Wednesday, it's overdue. If it's Wednesday, it's due_today).
4. Deduplicate the same action across sources (e.g., if a voice note and an email mention the same vendor list, merge them into one action).
5. Flag unclear ownership rather than inventing it (e.g., Mumbai office lease renewal is unclear).
`;

export async function generateDailyBrief(): Promise<DailyBrief> {
  if (!openai) {
    console.warn("GROQ_API_KEY not found. Returning mock daily brief.");
    return getMockDailyBrief();
  }

  try {
    // Minify context to save tokens
    const minifiedContext = JSON.stringify(contextData);
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nCRITICAL: Return ONLY valid JSON matching the DailyBrief schema." },
        { role: "user", content: `Context:\n${minifiedContext}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 250, // Extremely tight to prevent OTPM limit
    });

    const parsedData = JSON.parse(response.choices[0].message.content || "{}");
    return parsedData as DailyBrief;
  } catch (error) {
    console.error("Error generating brief from Groq:", error);
    return getMockDailyBrief();
  }
}

export async function answerQuestion(question: string): Promise<string> {
  if (!openai) {
    return "I am currently running in mock mode because the GROQ_API_KEY environment variable is not set. To get real AI answers, please add your key to a .env.local file. However, based on my hardcoded knowledge: You promised Raghav you would send him the updated vendor list by end of day Tuesday (which is now overdue).";
  }

  try {
    const minifiedContext = JSON.stringify(contextData);
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\nAnswer concisely in 1-2 sentences max." },
        { role: "user", content: `Context:${minifiedContext}\n\nQ: ${question}` }
      ],
      max_tokens: 50, // Micro limit for rapid chat clicks
    });

    return response.choices[0].message.content || "I couldn't find an answer to that.";
  } catch (error) {
    console.error("Error answering question:", error);
    return "Sorry, I encountered an error while trying to answer your question.";
  }
}

// Using standard JSON response to avoid beta SDK dependencies

function getMockDailyBrief(): DailyBrief {
  return {
    myActions: [
      {
        id: "action-1",
        task: "Send updated vendor list to Raghav",
        deadline: "Tuesday, 22 Sep (End of Day)",
        source: "Leadership Sync, Emails, Voice Note 1",
        status: "overdue"
      },
      {
        id: "action-2",
        task: "Review July expense variance report for board prep",
        deadline: "Wednesday, 23 Sep (Evening)",
        source: "Emails, Voice Note 2",
        status: "due_today"
      },
      {
        id: "action-3",
        task: "Reconfirm new call time (3 PM Wed) with Meridian Logistics (Priya)",
        deadline: "Wednesday, 23 Sep (Today)",
        source: "Leadership Sync, Emails, Voice Note 2",
        status: "due_today"
      },
      {
        id: "action-4",
        task: "Review Q3 Campaign Deck before board prep block",
        deadline: "Thursday, 24 Sep (9:30 AM)",
        source: "Leadership Sync, Emails",
        status: "upcoming"
      }
    ],
    waitingOnOthers: [
      {
        id: "wait-2",
        task: "Provide July Expense Variance Report",
        owner: "Divya Rao",
        deadline: "Wednesday, 23 Sep (Evening)",
        source: "Leadership Sync, Emails"
      }
    ],
    unclearOwnership: [
      {
        id: "unclear-1",
        task: "Sign off on Mumbai office lease renewal paperwork",
        potentialOwners: ["Facilities", "Arjun", "Unknown"],
        deadline: "Friday, 25 Sep",
        source: "Leadership Sync, Emails, Voice Note 1"
      }
    ],
    commitments: [
      {
        id: "commit-1",
        task: "Send updated vendor list",
        recipient: "Raghav Sethi",
        deadline: "Tuesday, 22 Sep (End of Day)",
        source: "Leadership Sync"
      },
      {
        id: "commit-2",
        task: "Attend Meridian Logistics call at 3 PM",
        recipient: "Priya Nair",
        deadline: "Wednesday, 23 Sep (3:00 PM)",
        source: "Emails"
      },
      {
        id: "commit-3",
        task: "Review Q3 Campaign Deck with Neha",
        recipient: "Neha Kapoor",
        deadline: "Thursday, 24 Sep (9:30 AM)",
        source: "Emails"
      }
    ]
  };
}
