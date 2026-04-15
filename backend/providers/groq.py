"""
Groq Provider — Fast inference via Llama 3.3 70B
Used for: short queries, chat, quick answers
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
TIMEOUT = 8.0


async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
