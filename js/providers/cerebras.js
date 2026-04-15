import { CEREBRAS_API_KEY, SYSTEM_PROMPT } from '../config.js';

export async function fetchCerebras(prompt) {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CEREBRAS_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama3.1-8b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ]
            // Cerebras may not support response_format strict json yet, so rely on prompt
        })
    });
    
    if (!response.ok) throw new Error("Cerebras API failed");
    const data = await response.json();
    let content = data.choices[0].message.content;
    try {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        return JSON.parse(content);
    } catch(e) {
        throw new Error("Cerebras returned invalid JSON");
    }
}
