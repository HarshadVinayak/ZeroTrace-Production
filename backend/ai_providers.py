"""
ZeroTrace multi-provider transport layer.
Tries providers in a stable order and falls back safely if they fail.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, List, Tuple

from providers import cerebras, gemini, groq, openrouter, sambanova
from providers import openai_provider

logger = logging.getLogger("zerotrace.providers")

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in {"1", "true", "yes", "on"}

PROVIDER_MODULES = {
    "Groq": groq,
    "Gemini": gemini,
    "OpenAI": openai_provider,
    "OpenRouter": openrouter,
    "Cerebras": cerebras,
    "SambaNova": sambanova,
}

PROVIDER_ENV_VARS = {
    "Groq": "GROQ_API_KEY",
    "Gemini": "GEMINI_API_KEY",
    "OpenAI": "OPENAI_API_KEY",
    "OpenRouter": "OPENROUTER_API_KEY",
    "Cerebras": "CEREBRAS_API_KEY",
    "SambaNova": "SAMBANOVA_API_KEY",
}

INTENT_CHAINS = {
    "quick": ["Groq", "SambaNova", "OpenAI", "Gemini", "OpenRouter", "Cerebras"],
    "planning": ["OpenAI", "Groq", "SambaNova", "Gemini", "OpenRouter", "Cerebras"],
    "analysis": ["OpenAI", "Gemini", "Groq", "SambaNova", "OpenRouter", "Cerebras"],
    "general": ["Groq", "OpenAI", "SambaNova", "Gemini", "OpenRouter", "Cerebras"],
}


def provider_status() -> List[Dict[str, Any]]:
    statuses = []
    for name, env_var in PROVIDER_ENV_VARS.items():
        configured = bool(os.getenv(env_var))
        statuses.append({
            "name": name,
            "configured": configured,
            "enabled": configured and not DEMO_MODE,
            "mode": "demo" if DEMO_MODE else ("remote" if configured else "offline"),
        })
    return statuses


def available_providers(intent: str) -> List[Tuple[str, Any]]:
    chain = INTENT_CHAINS.get(intent, INTENT_CHAINS["general"])
    providers: List[Tuple[str, Any]] = []
    for name in chain:
        if os.getenv(PROVIDER_ENV_VARS[name]):
            providers.append((name, PROVIDER_MODULES[name]))
    return providers


async def query_provider_chain(message: str, *, intent: str, system_prompt: str) -> Dict[str, Any]:
    if DEMO_MODE:
        raise RuntimeError("Demo mode enabled; remote providers are intentionally skipped.")

    errors: List[str] = []
    for provider_name, provider_module in available_providers(intent):
        try:
            start = time.time()
            reply = await provider_module.generate_response(message, system_prompt=system_prompt)
            latency = round(time.time() - start, 2)
            if not reply or len(reply.strip()) < 10:
                raise ValueError("provider returned an empty response")
            logger.info("SUCCESS with provider: %s", provider_name)
            return {
                "reply": reply,
                "provider": provider_name,
                "latency": latency,
                "errors": errors,
            }
        except Exception as exc:
            error = f"{provider_name}: {type(exc).__name__} - {str(exc)[:140]}"
            logger.warning("Provider failure: %s", error)
            errors.append(error)

    raise RuntimeError(" | ".join(errors) if errors else "No configured providers were available.")
