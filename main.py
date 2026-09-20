from dotenv import load_dotenv
load_dotenv()  # must run before importing anything that needs API keys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.tools import collect_sources, clean_and_filter_sources
from src.report_generator import generate_report

app = FastAPI(title="AI Research Agent API")

# CORS: allows your frontend (running on a different address/port, e.g. Vercel)
# to actually call this API from a browser. Without this, browsers block the
# request by default as a security measure.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now, allow any origin — we'll tighten this on Day 6 for deployment
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str


@app.get("/")
def read_root():
    return {"status": "AI Research Agent API is running"}


@app.post("/research")
def research(request: ResearchRequest):
    topic = request.topic.strip()

    if not topic:
        return {"error": "Topic cannot be empty."}

    raw_sources = collect_sources(topic)
    final_sources = clean_and_filter_sources(raw_sources)
    report = generate_report(topic, final_sources)

    return report