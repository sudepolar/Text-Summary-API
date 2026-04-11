const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL ?? 'http://localhost:5001';

/**
 * Communicates with the llm client
 * @param text - The text that will be summarized
 * @returns The summary of text in string format
 */
export async function summariseText(text: string): Promise<string> {
  const response = await fetch(`${LLM_SERVICE_URL}/summarise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error(`LLM service error: ${response.status}`);

  const data = await response.json();
  return data.summary;
}