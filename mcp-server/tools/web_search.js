import { z } from "zod";
import axios from "axios";
import { env } from "../config/env.js";
import { validate } from "../utils/validator.js";

const schema = z.object({
    query: z.string()
});

export const definition = {
    name: "web_search",
    description:
        "Search the live internet for latest news, real-time events, and up-to-date information.",
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

    try {
        const res = await axios.post("https://api.tavily.com/search", {
            api_key: env.TAVILY_API_KEY,
            query,
            search_depth: "advanced",
            include_answer: true,
            max_results: 5
        });

        const results = res.data.results || [];
        const answer = res.data.answer;

        if (!results.length && !answer) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No results found."
                    }
                ]
            };
        }

        let formatted = "";

        if (answer) {
            formatted += `Answer:\n${answer}\n\n`;
        }

        if (results.length) {
            formatted += results
                .map((r, i) => {
                    return `${i + 1}. ${r.title}\n${r.content}\n${r.url}`;
                })
                .join("\n\n");
        }

        return {
            content: [
                {
                    type: "text",
                    text: formatted
                }
            ]
        };

    } catch (err) {
        console.error("Tavily error:", err.response?.data || err.message);
        return {
            content: [
                {
                    type: "text",
                    text: "Web search failed. Please try again."
                }
            ]
        };
    }
}
