# TaskLift Pro 🚀
**Associate Software Engineer Assessment Submission**

*Live Deployment*: [TaskLift Pro Vercel App](https://better-assigned.vercel.app)

---

## 📖 Overview
TaskLift Pro is an AI-powered, full-stack task management application built to solve the friction of task tracking. Instead of manually filling out tedious forms, users dump their raw thoughts into the AI ChatBot. The AI instantly parses the input to calculate urgency, return on investment (ROI), effort, and strategy, before piping the structured data into a dynamic priority queue.

## 🛠️ Technology Stack
* **Frontend**: React (Vite) with a bespoke CSS dark-glassmorphism UI.
* **Backend**: Python + Flask RESTful API.
* **Database**: PostgreSQL 14 (Hosted on Render).
* **AI Provider**: Groq API (`llama-3.3-70b-versatile`) for ultra-low latency prompt engineering.
* **Infrastructure**: `docker-compose` containerization enabling instant local E2E replication.

---

## 🎯 Architecture & Key Technical Decisions

This project was built explicitly to fulfill the core evaluation criteria of the assessment, prioritizing readable structural boundaries and interface safety.

### 1. Strategy Pattern for Dynamic Scoring 
*(`Simplicity` / `Change Resilience`)*
Rather than polluting the route handlers with heavy conditional business logic, the backend implements a Strategy Pattern inside `services.py`. When the AI marks a task as `urgent`, `balanced`, or `roi`, the appropriate mathematical formula calculates the priority score transparently without affecting the overall service flow.

### 2. Defensive LLM Parsing & State Validation
*(`Interface Safety` / `Correctness`)*
LLMs inherently hallucinate or wrap JSON payloads in Markdown. The `/parse-task` endpoint protects system integrity via robust string sanitization and Pydantic-like defensive dictionary bounds-checking before persisting to Postgres. If an invalid format is caught, the Flask server emits a `422` or `502` status code gracefully instead of encountering a fatal server crash.

### 3. Comprehensive Middleware Observability
*(`Observability` / `Structure`)*
A custom `middleware.py` intercepts all incoming traffic to measure processing times, explicitly logging slow computations and capturing real-time network states.

### 4. Deterministic Local Deployment
*(`Change Resilience`)*
By configuring a complete `docker-compose.yml` along with explicit `requirements.txt` constraints and multi-stage `Dockerfiles`, the environment avoids the "it works on my machine" problem, guaranteeing 1-click boot reliability across teams.

---

## 🤖 AI Usage & Guidance Strategy
AI agentic workflows were heavily utilized to accelerate structural coding and UI scaffolding.

**Guidance**: To prevent the AI from generating "clever" but brittle code, explicit constraints were fed to the agents via the `claude.md` file checked into this repo. This file strictly banned the use of bloated utility libraries (like Tailwind) and strictly enforced defensive typing rules.

**Verification**: All AI-assisted algorithms specifically regulating task priority logic were rigorously audited and verified via Pytest (`tests/test_services.py`).

---

## 🚀 Run Locally (1-Click)
Ensure Docker is installed on your local machine.

```bash
# 1. Clone the repository
git clone https://github.com/Dg0276/BETTER-ASSIGNED.git
cd BETTER-ASSIGNED

# 2. Add your Groq API Key
# (Create a .env file locally with GROQ_API_KEY=your_key)

# 3. Spin up the Database, Backend API, and Frontend Vite Server
docker-compose up --build
```
* **Frontend UI**: `http://localhost:5173`
* **Flask API**: `http://localhost:5001`
*(Note: Empty PostgreSQL tables are automatically generated on first boot).*
