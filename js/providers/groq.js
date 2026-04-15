import { GROQ_API_KEY, SYSTEM_PROMPT } from '../config.js';

export async function fetchGroq(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        })
    });
    
    if (!response.ok) throw new Error("Groq API failed");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
