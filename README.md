
## How To Run Backend Locally

1. Open 2 terminals

2. Terminal 1 - Node
npm run dev

3. Terminal 2 - Python
cd python-service
source venv/Scripts/activate
uvicorn main:app --reload --port 5001

4. Download/pull ollama llama3.1:8b

5. Run ollama

command: ollama run llama3.1

