from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load variables from the .env file into the environment
load_dotenv()

# Create the LLM object, pointing at Gemini's free-tier Flash model
llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    temperature=0
)

# Send a simple question and get a response back
response = llm.invoke("Explain artificial intelligence in one sentence.")

# Print just the text of the response
if isinstance(response.content, str):
    print(response.content)
else:
    for block in response.content:
        if block.get("type") == "text":
            print(block["text"])