from dotenv import load_dotenv
load_dotenv()  # must run before importing anything that needs API keys

from src.tools import collect_sources, clean_and_filter_sources, save_research_data

topic = "Impact of AI on Education"

raw_sources = collect_sources(topic)
final_sources = clean_and_filter_sources(raw_sources)

print(f"Research topic: {topic}\n")
print(f"Raw sources collected: {len(raw_sources)}")
print(f"Sources after cleaning/filtering: {len(final_sources)}\n")

for i, source in enumerate(final_sources, start=1):
    print(f"{i}. {source['title']}")
    print(f"   Source: {source['source']}")
    print(f"   URL: {source['url']}")
    print(f"   Score: {source['score']}")
    print(f"   Content: {source['content'][:150]}...")
    print()
    saved_path = save_research_data(topic, final_sources)
print(f"Research data saved to: {saved_path}")