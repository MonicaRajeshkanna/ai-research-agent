from dotenv import load_dotenv
load_dotenv()  # must run before importing anything that needs API keys

from langchain.agents import create_agent
from src.tools import web_search

# The system prompt shapes how the agent behaves — it's the agent's "job description."
SYSTEM_PROMPT = (
    "You are a research assistant. When asked about a topic, use the web_search "
    "tool to find current, relevant information before answering. Base your answer "
    "on the search results, and always mention the source URLs you used."
)

# Build the agent: Gemini 3.6 Flash as the "brain", web_search as its one tool.
research_agent = create_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[web_search],
    system_prompt=SYSTEM_PROMPT,
)