"""
OpenRouter Provider — General fallback using a free model
Used for: fallback when primary providers fail
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
TIMEOUT = 8.0

async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    key = os.getenv("OPENROUTER_API_KEY")
    if not key: raise Exception("OPENROUTER_API_KEY missing")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }
    payload = {
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
