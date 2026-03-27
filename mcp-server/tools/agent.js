import { z } from "zod";
import { openai } from "../services/openai.js";
import { toolHandlers } from "./index.js";
import { toOpenAITools } from "../utils/openai-tools.js";
import { validate } from '../utils/validator.js';

const schema = z.object({
    query: z.string()
});

export const definition = {
    name: "agent",
    description: "Advanced AI agent with tool-calling (weather, DB, RAG, etc.)",
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
- Do NOT ask follow-up questions if you can use tools.

Available tools:
- rag_search → search PDF content
- get_weather → weather data
- get_stock_price → stock info
- query_db → database queries

Be helpful and proactive.
`
        },
        {
            role: "user",
            content: query
        }
    ];

    //Agent loop (multi-step reasoning)
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

        // ✅ Final answer
        return {
            content: [{
                type: "text",
                text: message.content
            }]
        };
    }

    throw new Error("Agent loop exceeded");
}
