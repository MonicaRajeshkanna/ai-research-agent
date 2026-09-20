import json
import time
from dotenv import load_dotenv
load_dotenv()  # must run before importing anything that needs API keys

from langchain_google_genai import ChatGoogleGenerativeAI
from src.prompts import REPORT_GENERATION_PROMPT

# Separate, dedicated model instance just for report writing —
# not the same object as the agent's model, since this has a different job
# (one-shot structured writing, not tool-calling).
_report_llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0.3)


def _format_sources_for_prompt(sources: list[dict]) -> str:
    """Turn our list of source dicts into readable text for the prompt."""
    blocks = []
    for i, source in enumerate(sources, start=1):
        blocks.append(
            f"Source {i}: {source['title']}\n"
            f"URL: {source['url']}\n"
            f"Content: {source['content'][:800]}"
        )
    return "\n\n".join(blocks)


def generate_report(topic: str, sources: list[dict]) -> dict:
    """Generate a structured report from cleaned sources. Returns a dict with
    title, summary, key_findings, conclusion, and the original sources attached."""

    if not sources:
        return {
            "title": f"Report on {topic}",
            "summary": "No sources were found for this topic, so a report could not be generated.",
            "key_findings": [],
            "conclusion": "Try a different or more specific topic.",
            "sources": [],
        }

    sources_text = _format_sources_for_prompt(sources)
    prompt = REPORT_GENERATION_PROMPT.format(topic=topic, sources_text=sources_text)

    response =     response = None
    last_error = None
    for attempt in range(3):
        try:
            response = _report_llm.invoke(prompt)
            break
        except Exception as e:
            last_error = e
            error_text = str(e)
            if "503" in error_text or "UNAVAILABLE" in error_text.upper():
                print(f"⚠ Gemini temporarily overloaded (attempt {attempt + 1}/3). Retrying in 5s...")
                time.sleep(5)
                continue
            else:
                raise  # not a transient error — don't retry, let it fail normally

    if response is None:
        return {
            "title": f"Report on {topic}",
            "summary": "Gemini's servers were temporarily overloaded and the report could not be generated. Please try again shortly.",
            "key_findings": [],
            "conclusion": str(last_error) if last_error else "Unknown error.",
            "sources": sources,
        }

    # Extract plain text from the response, handling both plain-string and
    # structured list-of-blocks content (same pattern as Day 2's test_agent.py).
    content = response.content
    if isinstance(content, list):
        content = "".join(
            block.get("text", "") for block in content if isinstance(block, dict)
        )

    # Gemini sometimes wraps JSON in ```json ... ``` fences despite instructions —
    # strip those out before parsing, just in case.
    content = content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        report = json.loads(content)
    except json.JSONDecodeError:
        # Fallback: if Gemini didn't return valid JSON, don't crash —
        # wrap the raw text so the caller still gets something usable.
        report = {
            "title": f"Report on {topic}",
            "summary": content[:500],
            "key_findings": [],
            "conclusion": "Report format could not be fully parsed.",
        }

    report["sources"] = sources
    return report