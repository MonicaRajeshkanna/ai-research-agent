# AI Research Agent

An AI agent that takes a research topic, searches the web, and generates a structured, cited research report — built entirely on free-tier infrastructure.

**Live demo:** https://ai-research-agent-gamma-nine.vercel.app

## How it works

1. User enters a research topic in the web app
2. The backend searches the web using Tavily
3. Search results are cleaned, deduplicated, and filtered
4. Google Gemini synthesizes the sources into a structured report (summary, key findings, conclusion)
5. The report is returned with real, clickable source citations

## Tech stack

- **Frontend:** React + Vite (TanStack Start), deployed on Vercel
- **Backend:** FastAPI, deployed on Render
- **AI Agent:** LangChain + LangGraph
- **LLM:** Google Gemini (free tier)
- **Web Search:** Tavily (free tier)

## Project structure
ai-research-agent/
├── frontend/ # React frontend
├── src/
│ ├── agent.py # LangChain/LangGraph research agent
│ ├── tools.py # Web search tool + source collection/cleaning
│ ├── prompts.py # Prompt templates
│ └── report_generator.py # Structured report generation
├── tests/ # Test scripts for each component
├── main.py # FastAPI backend entrypoint
└── requirements.txt


## Running locally

**Backend:**
```bash
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
# Create a .env file with GEMINI_API_KEY and TAVILY_API_KEY
python -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Notes

This project was built entirely on free-tier services (Gemini, Tavily, Render, Vercel) at zero cost. The backend runs on Render's free tier, which spins down after inactivity — the first request after a period of inactivity may take 30-60 seconds to respond while the server wakes up.