import os
from dotenv import load_dotenv

load_dotenv()

ROOT_PROMPT = os.getenv("ROOT_PROMPT", "Summarise the following report clearly and concisely.")
OLLAMA_URL  = os.getenv("OLLAMA_URL", "http://localhost:11434")
PORT        = int(os.getenv("PYTHON_PORT", 5001))