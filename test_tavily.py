from dotenv import load_dotenv
from langchain_tavily import TavilySearch

# Load TAVILY_API_KEY (and GEMINI_API_KEY) from .env into the environment
load_dotenv()

# Create the Tavily search tool
# max_results controls how many web results come back
search_tool = TavilySearch(max_results=3)

# Run an actual web search
results = search_tool.invoke({"query": "latest advancements in artificial intelligence"})

# results["results"] is a list of dictionaries, one per web page found
for item in results["results"]:
    print("TITLE:", item["title"])
    print("URL:", item["url"])
    print("CONTENT SNIPPET:", item["content"][:200])  # first 200 characters only
    print("---")