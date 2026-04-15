import { GEMINI_API_KEY, SYSTEM_PROMPT } from '../config.js';

export async function fetchGemini(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            system_instruction: { 
                parts: [{ text: SYSTEM_PROMPT }] 
            },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3
            }
        })
    });
    
    if (!response.ok) throw new Error("Gemini API failed");
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}
