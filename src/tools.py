from langchain_tavily import TavilySearch
from langchain_core.tools import tool

# Create the underlying Tavily search client once, reused by the tool function.
# max_results=3 keeps each search small — good for staying well within the free tier.
_search_client = TavilySearch(max_results=3)


@tool
def web_search(query: str) -> str:
    """Search the internet for current information on a given topic or question.
    Use this when you need up-to-date facts, news, or details that may not be
    part of your training knowledge. Returns titles, URLs, and short content
    snippets from relevant web pages."""
    results = _search_client.invoke({"query": query})

    if not results.get("results"):
        return "No search results were found for this query."

    formatted = []
    for item in results["results"]:
        formatted.append(
            f"Title: {item['title']}\nURL: {item['url']}\nContent: {item['content'][:500]}"
        )
    return "\n\n".join(formatted)
from urllib.parse import urlparse


def _extract_source_name(url: str) -> str:
    """Turn a URL like 'https://corp.kaltura.com/blog/...' into just 'corp.kaltura.com'."""
    try:
        return urlparse(url).netloc
    except Exception:
        return "unknown"


def collect_sources(topic: str) -> list[dict]:
    """Search the web for a topic and return a clean, structured list of sources.

    Unlike web_search (which returns a formatted string for the agent to read),
    this returns real Python dictionaries — meant for our own processing code,
    not for feeding directly to an LLM.

    Returns an empty list if the search fails for any reason, rather than crashing.
    """
    try:
        raw_response = _search_client.invoke({"query": topic})
    except Exception as e:
        error_text = str(e)

        if "429" in error_text or "RATE" in error_text.upper():
            print("⚠ Tavily rate limit reached. Wait a bit before trying again.")
        elif "API_KEY" in error_text.upper() or "401" in error_text or "403" in error_text:
            print("⚠ Tavily API key problem. Check TAVILY_API_KEY in your .env file.")
        else:
            print(f"⚠ Web search failed: {error_text}")

        return []  # return an empty list so the rest of the pipeline doesn't crash

    raw_results = raw_response.get("results", [])

    sources = []
    for item in raw_results:
        sources.append({
            "title": item.get("title", "").strip(),
            "url": item.get("url", "").strip(),
            "content": item.get("content", "").strip(),
            "source": _extract_source_name(item.get("url", "")),
            "score": item.get("score", 0.0),
        })

    return sources
import re


def clean_and_filter_sources(sources: list[dict]) -> list[dict]:
    """Take raw collected sources and return a clean, deduplicated list.

    - Drops sources missing a title, URL, or content (broken/useless entries).
    - Removes duplicate URLs, keeping only the first occurrence.
    - Collapses extra whitespace in content (light cleaning, not rewriting).
    """
    seen_urls = set()
    cleaned = []

    for source in sources:
        title = source.get("title", "")
        url = source.get("url", "")
        content = source.get("content", "")

        # Filter: skip if any essential field is missing/empty
        if not title or not url or not content:
            continue

        # Filter: skip if we've already seen this exact URL
        if url in seen_urls:
            continue
        seen_urls.add(url)

        # Clean: collapse multiple spaces/newlines into a single space
        cleaned_content = re.sub(r"\s+", " ", content).strip()

        cleaned.append({
            "title": title,
            "url": url,
            "content": cleaned_content,
            "source": source.get("source", "unknown"),
            "score": source.get("score", 0.0),
        })

    return cleaned
import json
from pathlib import Path


def save_research_data(topic: str, sources: list[dict]) -> str:
    """Save collected research sources to a JSON file in the reports/ folder.

    Returns the file path that was written to.
    """
    Path("reports").mkdir(exist_ok=True)  # create reports/ if it somehow doesn't exist

    data = {
        "topic": topic,
        "source_count": len(sources),
        "sources": sources,
    }

    file_path = Path("reports") / "research_data.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return str(file_path)