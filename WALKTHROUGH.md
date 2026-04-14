# Walkthrough Video Script & Guide

*This document serves as your guide/script for the required 10-15 minute video submission. It covers all the mandatory talking points.*

---

## 1. Introduction (1-2 mins)
- **You**: "Hi, I'm Dinesh. For this assessment, I built **TaskLift Pro**, an AI-powered task management product designed to solve the problem of quick brain-dumping. Instead of manually filling out tedious forms, users can casually type what's on their mind, and an AI extracts the core task, analyzes the urgency, and prioritizes it."
- **Demo**: Open the app. Type a vague prompt into the AI ChatBot on the right. (e.g., *"The database is going to crash in 2 hrs because it's full, help"*)
- **Show**: Watch the AI populate a parsed result with calculated effort, impact, and strategy. Click "Create Task" and see it hit the Priority Queue.
- **Show Tabs**: Click between "All", "Active", and "Done" tabs to show React state filtering.

## 2. Architecture & Structure (2-3 mins)
- **Frontend**: "The frontend is built with React and Vite. I chose a custom dark glassmorphism aesthetic using raw CSS instead of a heavy library like Tailwind to maintain full ownership over the visual tokens and micro-interactions."
- **Backend**: "The backend is a lightweight Python Flask API. It handles routing and direct connections to a PostgreSQL relational database."
- **Infrastructure**: "I containerized the entire stack. There's a `docker-compose.yml` that boots up three containers: Postgres, Flask, and React. This guarantees whoever checks out my code can run it immediately."

## 3. Key Technical Decisions (3-4 mins)
- **The AI Parse Endpoint**: Highlight `app.py`. "I utilized the Groq API running a Llama-3 model because of its ultra-low latency. I built defensive error handling here—sometimes LLMs return markdown blocks around JSON, so I added regex string sanitization before doing `json.loads()`."
- **The Strategy Pattern**: Highlight `services.py`. "To calculate task priority, I implemented the Strategy Pattern. The AI determines if a task is 'urgent', 'balanced', or 'roi'. Depending on that string, the backend uses a different mathematical formula to weigh Impact vs. Effort. This keeps my core function clean and makes it easy to add new algorithms later."
- **Layout**: "I went with a 3-column sticky CSS grid layout to keep the 'creation' components visible at all times while the user scrolls their task list."

## 4. AI Usage (2 mins)
- **How I used AI**: "I heavily utilized AI coding assistants, specifically Google's agentic tools. To keep the AI focused, I created a `claude.md` guidance file that dictated my technology stack and formatting rules. This prevented the AI from trying to over-engineer the app or inject unwanted frameworks like Tailwind."
- **Product Feature**: "The core feature of the app relies on LLMs. I used JSON mode prompting to enforce structured data returns so the Flask backend can easily parse the outputs into Postgres tables."

## 5. Risks & Mitigation (1-2 mins)
- **Risk 1: AI Hallucination/Format Breaking**: "LLMs can fail to return valid JSON. I handled this by implementing a `try/except` block on the backend that catches decode errors and returns gracefully to the user interface instead of crashing the server."
- **Risk 2: Secret Leaks**: "I used `python-dotenv` to ensure my Database UI and Groq keys are injected at runtime, preventing them from being committed into version control."

## 6. Extension Approach (1-2 mins)
- **Future Scale**: "If this were a production app, the first extension would be User Authentication (JWT) so multiple people could have their own task lists."
- **WebHooks**: "I'd want to add an email or Discord webhook integration in the backend so when an 'Urgent' task is parsed by the AI, the engineering team gets a notification."

---
*End video.*
