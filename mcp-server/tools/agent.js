import { z } from "zod";
import { openai } from "../services/openai.js";
import { toolHandlers } from "./index.js";
import { toOpenAITools } from "../utils/openai-tools.js";
import { validate } from '../utils/validator.js';
import { redis } from "../services/redis.js";

const schema = z.object({
    query: z.string()
});

export const definition = {
    name: "agent",
    description: "Advanced AI agent with tool-calling and caching",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" }
        },
        required: ["query"]
    }
};

export async function handler(args) {
    const { query } = validate(schema, args);
    // --- REDIS CACHE CHECK ---
    const cacheKey = `agent_cache:${query.trim().toLowerCase()}`;
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
        return JSON.parse(cachedResponse);
    }

    const tools = toOpenAITools();

    let messages = [
        {
            role: "system",
            content: `
                    You are an intelligent AI assistant with access to tools.

                    IMPORTANT RULES:
                    - If user asks about "my PDF", "document", or "file", ALWAYS use the "rag_search" tool.
                    - The PDFs are already indexed. DO NOT ask for filename.
                    - Use retrieved context to answer questions.
                    - Use "web_search" to find current information online.
                    - Use "query_db" for internal database lookups.
                    - Do NOT ask follow-up questions if you can use tools.

                    Available tools:
                    - rag_search → search PDF content
                    - get_weather → weather data
                    - get_stock_price → stock info
                    - query_db → database queries
                    - web_search → search the live internet for latest news/data

                    Be helpful and proactive.
                    `
        },
        {
            role: "user",
            content: query
        }
    ];

    // --- Agent loop (multi-step reasoning) ---
    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            tools,
            tool_choice: "auto"
        });

        const message = response.choices[0].message;

        if (message.tool_calls) {
            messages.push(message);

            for (const toolCall of message.tool_calls) {
                const name = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                const tool = toolHandlers[name];

                if (!tool) {
                    throw new Error(`Tool not found: ${name}`);
                }

                const result = await tool(args);

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: result.content[0].text
                });
            }

            continue;
        }

        // --- PREPARE FINAL ANSWER & CACHE IT ---
        const finalResult = {
            content: [{
                type: "text",
                text: message.content
            }]
        };

        // --- Cache the result for 1 hour (3600 seconds) ----
        await redis.set(cacheKey, JSON.stringify(finalResult), 'EX', 3600);

        return finalResult;
    }

    throw new Error("Agent loop exceeded");
}
