# TaskLift Pro (AI-Powered Task Management)
*Deployed via Docker & Python/React Stack for Better Software Assessment*

## Overview
TaskLift Pro is a modern, full-stack application that transforms vague, natural-language brain-dumps into structured, prioritized tasks. It utilizes an AI parsing layer to automatically deduce a task's Title, Description, Impact, Effort, and Priority Strategy.

## Tech Stack
- **Frontend**: React (Vite) styled with a custom dark glassmorphism UI system.
- **Backend**: Python + Flask. REST API architecture.
- **Database**: PostgreSQL 14.
- **AI Integration**: Groq API (running `llama-3.3-70b-versatile`) for ultra-low latency prompt parsing.
- **Infrastructure**: Dockerized (Frontend, Backend, DB) via `docker-compose.yml` for true 1-click deployment.

## Key Technical Decisions
1. **Design Pattern (Strategy)**: The backend employs a Strategy Pattern in `services.py` to calculate task prioritization scores dynamically. It supports `balanced`, `urgent`, and `roi` (Return on Investment) algorithms to score Tasks.
2. **AI Error Handling & Sanitization**: The `/parse-task` endpoint implements proactive string cleaning and defensive dict lookups to handle Edge Cases (e.g. LLaMA returning markdown blocks or truncated JSON) securely without crashing the server.
3. **Environment Security**: Sensitive keys (`GROQ_API_KEY`) and URIs (`DATABASE_URL`) are abstracted via `python-dotenv` avoiding credential leaks.
4. **Local E2E Deployment via Docker**: Instead of messy manual setups, the entire stack (Postgres + Flask + React) was containerized into a `docker-compose.yml` configuration. This guarantees a deterministic execution environment across any machine.

## Run Locally (1-Click)
Ensure Docker is installed.
```bash
# Spin up Database, Backend API, and Frontend Vite Server
docker-compose up --build
```
- Frontend runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5001`

*Note: You must have a `.env` file at the root or inject `GROQ_API_KEY` into your environment.*

## AI Guidance Files
AI agentic workflows were driven using `claude.md` as contextual boundaries outlining our specific architectural constraints and acceptable tech stacks.
