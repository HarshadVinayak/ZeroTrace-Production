"""
Cerebras Provider — Experimental / last-resort backup
Used for: final fallback if all other providers are down
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"
TIMEOUT = 8.0

async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    key = os.getenv("CEREBRAS_API_KEY")
    if not key: raise Exception("CEREBRAS_API_KEY missing")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }
    payload = {
        "model": "llama3.1-8b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(CEREBRAS_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
