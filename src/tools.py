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