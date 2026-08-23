# python-agent folder mein test_llm.py banao
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os

load_dotenv()
llm = ChatGroq(model="openai/gpt-oss-20b", api_key=os.getenv("GROQ_API_KEY"))
res = llm.invoke([HumanMessage(content="Say hello in one line")])
print(f"Response: '{res.content}'")
print(f"Length: {len(res.content)}")