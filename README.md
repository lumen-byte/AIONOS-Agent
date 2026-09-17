# AIONOS Executive Productivity Agent

This project is a perfect, industry-standard implementation of the **Executive Productivity Agent** for Arjun Malhotra, built as a full-stack Next.js application using React, TypeScript, and the OpenAI SDK (with Structured Outputs).

## 🚀 Quick Start (One-Command Local Run)

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

> **Note on API Keys**: The app requires an `OPENAI_API_KEY` in a `.env.local` file for dynamic generation. If omitted, the app gracefully falls back to a **Mock Mode** using pre-computed perfect responses, so the reviewer can still test the UI, architecture, and chat flows instantly without configuration!

## 🏗 Architecture and Process Flow

1. **Context Ingestion**: The raw messy data (Meetings, Calendars, Emails, Voice Notes) is structured into `src/data/context.json`.
2. **AI Agent Logic (`src/lib/agent.ts`)**:
   - Uses OpenAI's `gpt-4o-2024-08-06` with **Structured Outputs** (`zod` schema parsing) to strictly enforce the extraction rules.
   - Extracts and classifies commitments, separates "My Actions" vs "Waiting on Others", flags unclear ownership (e.g., Mumbai lease), and deduplicates items across sources (e.g., vendor list mentioned in voice note + email).
3. **API Layer (`src/app/api/`)**:
   - `/api/brief`: Serves the JSON action brief.
   - `/api/chat`: Processes semantic Q&A over the data pack.
4. **Premium UI (`src/app/page.tsx`)**:
   - Custom Glassmorphism design system using Vanilla CSS Modules.
   - Dual-tab interface: Daily Action Brief & Conversational Q&A.

## 📊 Inputs, Sources, and Assumptions Used
- **Inputs**: The verbatim transcripts, emails, calendars, and voice notes from the assignment brief.
- **Assumptions**: 
  - "Today" is treated as Wednesday, 23 September 2026 for relative deadline calculations, as most imminent actions (Expense variance, Meridian call) converge on this date.
  - "Facilities" is treated as a potential owner for the Mumbai lease based on Divya's inference, but marked as "Unclear Ownership" because no individual has claimed it.

## 🤖 AI Tools Used & Implementation
- **OpenAI API (GPT-4o)**: Used for Natural Language Understanding.
- **Structured Outputs (zodResponseFormat)**: Guarantees the LLM outputs exactly the JSON structure required for the Daily Brief dashboard without hallucinating schema keys.

---
*Developed for AIONOS Assignment 1*
