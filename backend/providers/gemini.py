"""
Gemini Provider — Google's reasoning model
Used for: analysis, bill scanning, impact estimation
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
TIMEOUT = 8.0


async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": f"SYSTEM: {system_prompt}\n\nUSER: {message}"}]
        }],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1024,
        },
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
