"""
OpenAI Provider — GPT-4o for vision + chat
Used for: scanner vision, advanced analysis, fallback
"""

import os
import httpx
from prompt import SYSTEM_PROMPT

OPENAI_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_VISION_URL = "https://api.openai.com/v1/chat/completions"
TIMEOUT = 20.0


async def generate_response(message: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise Exception("OPENAI_API_KEY missing")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 1024,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(OPENAI_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def analyze_image(image_base64: str, prompt: str) -> str:
    """Vision call — sends base64 image to GPT-4o vision."""
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise Exception("OPENAI_API_KEY missing")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }
    payload = {
        "model": "gpt-4o",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}",
                        "detail": "low"
                    }
                }
            ]
        }],
        "max_tokens": 512,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(OPENAI_VISION_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
