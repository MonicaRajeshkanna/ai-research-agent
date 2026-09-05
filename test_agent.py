from dotenv import load_dotenv
load_dotenv()  # must run before importing the agent

from src.agent import research_agent


def run_agent(topic: str):
    print(f"\nUser query: {topic}")
    print("Agent started...\n")

    inputs = {"messages": [{"role": "user", "content": topic}]}

    try:
        for step in research_agent.stream(inputs, stream_mode="updates"):
            for node_name, node_output in step.items():
                messages = node_output.get("messages", [])
                for message in messages:
                    if getattr(message, "tool_calls", None):
                        for call in message.tool_calls:
                            query = call["args"].get("query", "")
                            print(f"→ Calling tool: {call['name']}")
                            print(f"→ Search query: {query}")

                    elif message.__class__.__name__ == "ToolMessage":
                        result_count = message.content.count("Title:")
                        print(f"→ Received {result_count} source(s) from search")

                    elif message.__class__.__name__ == "AIMessage" and message.content:
                        content = message.content
                        if isinstance(content, list):
                            content = "".join(
                                block.get("text", "") for block in content if isinstance(block, dict)
                            )
                        if content.strip():
                            print(f"\n=== FINAL ANSWER ===\n{content}\n")

    except Exception as e:
        error_text = str(e)

        if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text.upper():
            print("\n⚠ Rate limit reached (free-tier quota exceeded for now).")
            print("This means you've hit Gemini or Tavily's free request limit for the")
            print("current minute/day. Wait a bit and try again — no charges occur on the free tier.")

        elif "API_KEY" in error_text.upper() or "PERMISSION" in error_text.upper() or "401" in error_text or "403" in error_text:
            print("\n⚠ API key problem detected.")
            print("Check that GEMINI_API_KEY and TAVILY_API_KEY in your .env file are correct,")
            print("with no extra spaces or quotes.")

        elif "NOT_FOUND" in error_text.upper() or "404" in error_text:
            print("\n⚠ Model not found.")
            print("The Gemini model name may have changed or been retired. Check the current")
            print("model name in Google's documentation and update src/agent.py.")

        else:
            print(f"\n⚠ Unexpected error occurred: {error_text}")
            print("If this keeps happening, check your internet connection and try again.")
if __name__ == "__main__":
    # Run ONE topic at a time — comment/uncomment as needed, rather than looping
    # through all of them automatically. This keeps us in control of API usage
    # and avoids burning through the free tier unnecessarily.

    # run_agent("What are the latest developments in AI robotics?")
    # run_agent("Impact of AI on education")
    run_agent("Recent developments in renewable energy")
    # run_agent("Applications of machine learning in healthcare")