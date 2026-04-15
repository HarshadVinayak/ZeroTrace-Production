"""
Mistral Provider — via OpenRouter (free tier)
Used for: structured habit plans, routines, organized outputs
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MISTRAL_URL = "https://openrouter.ai/api/v1/chat/completions"
TIMEOUT = 8.0


async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    }
    payload = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(MISTRAL_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
