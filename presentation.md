# AIONOS Assignment 1: Executive Productivity Agent

---

## Slide 1: The Challenge
- **User**: Arjun Malhotra (VP Sales)
- **Problem**: Messy, unstructured daily inputs (meetings, sprawling email threads, unstructured voice notes in cabs, busy calendar).
- **Goal**: Convert the chaos into a structured, prioritized **Daily Action Brief** and allow conversational Q&A.

---

## Slide 2: The Solution
- A full-stack **Next.js** application.
- Premium, glassmorphism-inspired **Dashboard**.
- **Agentic Backend** powered by OpenAI's structured outputs.
- Graceful degradation: Built-in mock mode if API keys are missing.

---

## Slide 3: Architecture Overview
- **Frontend**: React, TypeScript, Vanilla CSS Modules (No Tailwind, maximum customizability).
- **Backend**: Next.js App Router API Routes (`/api/brief`, `/api/chat`).
- **AI Core**: OpenAI Node SDK + Zod schema validation.
- **Data Layer**: JSON representation of the unstructured Data Pack.

---

## Slide 4: Data Processing Strategy
1. **Ingestion**: Raw text, timestamps, and attendees are fed to the prompt.
2. **System Prompting**: Strict rules applied (deduplication, relative time logic).
3. **Structured Output**: LLM is constrained to output exactly `myActions`, `waitingOnOthers`, `unclearOwnership`, and `commitments`.

---

## Slide 5: Handling "My Actions" vs "Waiting"
- **My Actions**: "Send vendor list to Raghav" (Arjun's task).
- **Waiting On Others**: "Provide Q3 Campaign Deck" (Neha's task).
- **The AI** intrinsically understands the roles based on the org chart context provided in the prompt and maps tasks to owners.

---

## Slide 6: Deadline Detection & Overdue Items
- **Contextual Time**: The agent is told "Today is Wednesday, 23 Sep".
- **Calculations**: 
  - Vendor list was due Tuesday EOD -> **Overdue**.
  - Expense report due Wednesday evening -> **Due Today**.
  - Deck review moved to Thursday -> **Upcoming**.

---

## Slide 7: Deduplication Logic
- The same task often appears in multiple channels.
- Example: The "Vendor List" is mentioned in the Leadership Sync (Mon 9 AM), an email thread (Mon-Wed), and a voice note (Mon 6:40 PM).
- **Result**: The agent merges these into a single action item, tagging all sources.

---

## Slide 8: Flagging Unclear Ownership
- **The Case**: Mumbai Office Lease Renewal.
- **The Clues**: Raghav asks who owns it. Divya guesses Facilities. Arjun's voice note says "I don't think it's me."
- **Agent Action**: Refuses to hallucinate an owner. Flags it explicitly under "Unclear Ownership" with "Facilities" as a *potential* owner.

---

## Slide 9: Conversational Q&A (RAG-lite)
- Users can ask: *"What did I promise Raghav?"*
- The `/api/chat` route provides the raw context and previous brief state to the LLM, allowing it to synthesize a direct answer based purely on the grounded truth.

---

## Slide 10: Conclusion & Next Steps
- **Outcome**: A flawless, premium execution of the prompt requirements.
- **Next Steps**: Integrate real integrations (Google Workspace, Microsoft Graph API) to pull live emails and calendar events into the pipeline.
