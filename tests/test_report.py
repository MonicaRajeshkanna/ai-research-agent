from dotenv import load_dotenv
load_dotenv()  # must run before importing anything that needs API keys

import json
from src.tools import collect_sources, clean_and_filter_sources
from src.report_generator import generate_report

topic = "Impact of AI on Education"

raw_sources = collect_sources(topic)
final_sources = clean_and_filter_sources(raw_sources)
report = generate_report(topic, final_sources)

print(json.dumps(report, indent=2, ensure_ascii=False))