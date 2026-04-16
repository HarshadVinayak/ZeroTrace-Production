"""
SambaNova Provider
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

SAMBANOVA_URL = "https://api.sambanova.ai/v1/chat/completions"
TIMEOUT = 8.0

async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    key = os.getenv("SAMBANOVA_API_KEY")
    if not key: raise Exception("SAMBANOVA_API_KEY missing")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }
    payload = {
        "model": "Meta-Llama-3.1-70B-Instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(SAMBANOVA_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
