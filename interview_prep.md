# Interview Preparation Guide: Executive Productivity Agent

This guide prepares you for the 15-minute demo and defence of your project. As a "10+ years experienced Full-Stack and AI Developer", you need to answer questions confidently, explaining your architectural choices and AI techniques.

## General Tips
- **Be Confident**: You chose this tech stack because it's industry standard.
- **Own the Trade-offs**: If they ask why you didn't use a vector database (like Pinecone), say "For this scale of daily context, passing the JSON directly in the context window is far more reliable and cost-effective than chunking and embedding, which could lose crucial cross-thread references."
- **Focus on the UI/UX**: Emphasize that an AI agent is only as good as its interface. You built a custom glassmorphism UI from scratch to make it feel premium.

---

## Technical Q&A

### Q1: Why did you choose Next.js and React for this assignment instead of a Python framework like Streamlit?
**Your Answer**: "While Streamlit is great for quick data science prototypes, I wanted to deliver a production-ready, consumer-grade application. Next.js provides a robust Full-Stack architecture where I can securely handle API routes (masking the OpenAI keys) while delivering a highly responsive, custom-styled frontend. It perfectly bridges the gap between AI logic and exceptional UX."

### Q2: How did you handle the AI hallucinating or returning the wrong JSON structure?
**Your Answer**: "I utilized OpenAI's latest **Structured Outputs** feature with Zod schema validation (`zodResponseFormat`). Instead of just prompting the model to 'return JSON', this guarantees at the API level that the LLM will return an object matching my exact TypeScript interfaces (commitments, myActions, waitingOnOthers, etc.). This eliminates JSON parsing errors and hallucinated keys entirely."

### Q3: How did you solve the deduplication problem?
**Your Answer**: "Deduplication across different mediums (a voice note vs. an email) is traditionally very hard for classic NLP. I solved this by leveraging the LLM's semantic understanding. By feeding the entire daily context into the prompt and explicitly instructing the model to merge semantic duplicates, it successfully correlated the 'Vendor List' mentioned in the Monday meeting, the email thread, and Arjun's voice note into a single actionable item with multiple sources."

### Q4: How does the agent know what is 'Overdue' versus 'Upcoming'?
**Your Answer**: "Time is relative in LLMs. I injected a 'grounding timestamp' into the System Prompt, telling the model explicitly that 'Today is Wednesday, 23 Sep 2026'. This allows the model to logically deduce that a task due on Tuesday is 'Overdue', and a task due on Thursday is 'Upcoming'. This temporal grounding is crucial for productivity agents."

### Q5: The prompt asked you not to invent ownership if it was unclear. How did you implement that?
**Your Answer**: "I created a specific category in my data schema called `unclearOwnership`. Instead of forcing the AI to choose an owner, I prompted it to flag tasks where the owner is ambiguous (like the Mumbai lease, which Divya guessed was Facilities, but Arjun denied owning). This builds trust with the user by surfacing ambiguity rather than confidently lying."

### Q6: What would you do differently if you had 2 weeks instead of 6 hours?
**Your Answer**: "I would implement live integrations using OAuth. I'd connect the Microsoft Graph API or Google Workspace API to pull emails and calendar events in real-time. I would also implement an event-driven architecture using Webhooks, so the daily brief updates dynamically as new emails arrive, rather than being a static daily generation. Finally, I'd add a Vector DB for long-term memory, so the agent remembers promises made weeks ago."

---

## Demo Script (15 Minutes)

1. **Introduction (2 mins)**: Explain the problem. Executives are bombarded with unstructured data.
2. **Architecture (3 mins)**: Walk through the Next.js setup. Show them the `context.json` (the raw data) and explain how it represents the API payloads you'd get from Gmail/Outlook.
3. **The Agent Logic (4 mins)**: Show `src/lib/agent.ts`. Highlight the `zod` schema and explain Structured Outputs.
4. **UI Demo (4 mins)**: 
   - Show the Daily Brief. Point out how the "Vendor List" was deduplicated. 
   - Point out the "Mumbai Lease" under Unclear Ownership.
   - Go to the Chat tab and ask: "What did I promise Raghav?" to show conversational recall.
5. **Conclusion (2 mins)**: Recap how this proves your ability to turn messy business problems into sleek, production-ready AI products.
