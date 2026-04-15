import { fetchGroq } from './providers/groq.js';
import { fetchGemini } from './providers/gemini.js';
import { fetchMistral } from './providers/mistral.js';
import { fetchOpenRouter } from './providers/openrouter.js';
import { fetchCerebras } from './providers/cerebras.js';

export async function routeAIRequest(promptText) {
    const textLower = promptText.toLowerCase();

    // 1. Smart routing rules
    let primaryProvider;
    let fallbackChain = [];

    if (textLower.includes("analyze") || textLower.includes("bill") || textLower.includes("impact")) {
        console.log("Router: Task is analysis. Using Gemini.");
        primaryProvider = fetchGemini;
        fallbackChain = [fetchGroq, fetchOpenRouter];
    } 
    else if (textLower.includes("habit") || textLower.includes("plan")) {
        console.log("Router: Task is planning. Using Mistral.");
        primaryProvider = fetchMistral;
        fallbackChain = [fetchGemini, fetchGroq, fetchOpenRouter];
    } 
    else if (promptText.length < 50 || textLower.includes("chat")) {
        console.log("Router: Task is short/general. Using Groq.");
        primaryProvider = fetchGroq;
        fallbackChain = [fetchOpenRouter, fetchCerebras];
    } 
    else {
        console.log("Router: Default fallback. Using OpenRouter.");
        primaryProvider = fetchOpenRouter;
        fallbackChain = [fetchGroq, fetchMistral, fetchCerebras];
    }

    // 2. Execute with Fallback Logic
    const executionChain = [primaryProvider, ...fallbackChain];

    for (let i = 0; i < executionChain.length; i++) {
        const providerFunc = executionChain[i];
        try {
            console.log(`Router: Attempting with ${providerFunc.name}...`);
            const jsonOutput = await providerFunc(promptText);
            
            // Validate basic JSON structure requirements
            if (jsonOutput && jsonOutput.title && (jsonOutput.insights || jsonOutput.actions)) {
                return jsonOutput;
            } else {
                throw new Error("Invalid output format");
            }
        } catch (error) {
            console.error(`Router: ${providerFunc.name} failed:`, error.message);
            // Move on to next provider in loop
        }
    }

    // If all fail
    return {
        title: "System Offline",
        insights: ["Unable to connect to AI providers."],
        actions: ["Please try again later."],
        impact: "0"
    };
}
