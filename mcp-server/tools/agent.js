import { z } from "zod";
import { openai } from "../services/openai.js";
import { toolHandlers } from "./index.js";
import { toOpenAITools } from "../utils/openai-tools.js";
import { validate } from "../utils/validator.js";
import redis from "../services/redis.js";

const schema = z.object({
    query: z.string()
});

export const definition = {
    name: "agent",
    description: "Advanced AI agent with tool-calling, caching, and web search",
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
    let usedTools = [];

    const normalizedQuery = query.trim().toLowerCase();

    // Detect real-time queries (skip cache)
    const isRealtimeQuery =
        normalizedQuery.includes("weather") ||
        normalizedQuery.includes("stock") ||
        normalizedQuery.includes("latest") ||
        normalizedQuery.includes("today") ||
        normalizedQuery.includes("current") ||
        normalizedQuery.includes("news");

    const cacheKey = `agent_cache:${normalizedQuery}`;

    if (!isRealtimeQuery) {
        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
            console.log("Cache hit");
            return JSON.parse(cachedResponse);
        }
    }

    const tools = toOpenAITools();

    let messages = [
        {
            role: "system",
            content: `
               You are an advanced AI agent with access to multiple tools.

                DECISION RULES:

                1. Use "rag_search" for:
                - "my PDF", "document", "file"
                - Any question about uploaded content

                2. Use "web_search" for:
                - latest information
                - news
                - current events
                - anything time-sensitive
                - when other tools do not provide enough info

                3. Use "query_db" for structured/internal data

                4. Use "get_weather" for weather

                5. Use "get_stock_price" for stock prices

                IMPORTANT:
                - Always prefer tools over guessing
                - If unsure → use web_search
                - Do NOT ask user for filenames
                - Combine tools when needed
                - Use "query_db" ONLY when you know the exact query. If unsure, do NOT use it.

                Be helpful, accurate, and concise.
            `
        },
        {
            role: "user",
            content: query
        }
    ];

    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            tools,
            tool_choice: "auto"
        });

        const message = response.choices[0].message;

        // Handle Tool Calls (Multi-step)
        if (message.tool_calls && message.tool_calls.length > 0) {
            messages.push(message);

            for (const toolCall of message.tool_calls) {
                const name = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                const tool = toolHandlers[name];
                if (!tool) throw new Error(`Tool not found: ${name}`);

                // Track tool name
                if (!usedTools.includes(name)) {
                    usedTools.push(name);
                }

                const result = await tool(toolArgs);

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: result.content[0].text
                });
            }
            continue;
        }

        // Handle Fallback (If the model fails to provide a substantial answer)
        if (!message.content || message.content.length < 20) {
            console.log("Fallback → web_search triggered");

            if (!usedTools.includes("web_search")) {
                usedTools.push("web_search");
            }

            const webResult = await toolHandlers["web_search"]({ query });

            const fallbackResult = {
                content: webResult.content,
                tools_used: usedTools
            };

            return fallbackResult;
        }

        // Final Success Response
        const finalResult = {
            content: [{ type: "text", text: message.content }],
            tools_used: usedTools
        };

        if (!isRealtimeQuery) {
            await redis.set(cacheKey, JSON.stringify(finalResult), "EX", 3600);
        }

        return finalResult;
    }

    throw new Error("Agent loop exceeded");
}
