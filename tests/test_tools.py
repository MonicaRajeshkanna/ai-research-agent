from dotenv import load_dotenv
load_dotenv()  # must run BEFORE importing anything that needs the API keys

from src.tools import web_search

result = web_search.invoke({"query": "latest developments in AI robotics"})
print(result)