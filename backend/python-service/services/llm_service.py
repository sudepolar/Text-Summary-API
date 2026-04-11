from ollama import AsyncClient
import pandas as pd
from config import ROOT_PROMPT

async def generate_summary(text: str) -> str:
    """ Async function to generate a summary

    @param text - the desired text to summarize
    @returns summarized text in string format
    """
    series = pd.Series([text])
    cleaned = series.str.strip().str.replace(r'\s+', ' ', regex=True)[0]

    client = AsyncClient()
    response = await client.chat(
        model="llama3.1:8b",
        messages=[
            { "role": "system", "content": ROOT_PROMPT },
            { "role": "user",   "content": cleaned }
        ]
    )
    return response['message']['content']