import ollama
import pandas as pd
from config import ROOT_PROMPT

async def generate_summary(text: str) -> str:
    """ Async function to generate a summary

    @param text - the desired text to summarize
    @returns summarized text in string format
    """
    series = pd.Series([text])
    cleaned = series.str.strip().str.replace(r'\s+', ' ', regex=True)[0]

    response = ollama.chat(
        model="llama3.16",
        messages=[
            { "role": "system", "content": ROOT_PROMPT },
            { "role": "user",   "content": cleaned }
        ]
    )
    return response['message']['content']