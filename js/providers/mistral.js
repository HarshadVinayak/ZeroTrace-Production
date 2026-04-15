import { OPENROUTER_API_KEY, SYSTEM_PROMPT } from '../config.js';

export async function fetchMistral(prompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        })
    });
    
    if (!response.ok) throw new Error("Mistral API failed");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
