import { safeFetch } from '../utils/fetch.js';
import { z } from 'zod';
import { validate } from '../utils/validator.js';

const schema = z.object({
    query: z.string().min(1).describe("The search query to look up on the live web")
});

export const definition = {
    name: "web_search",
    description: "Search the live internet for the latest news, real-time events, or data not found in internal databases.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The specific search query"
            }
        },
        required: ["query"]
    }
};

export async function handler(args) {
    try {
        const { query } = validate(schema, args);

        // Using Tavily API (requires TAVILY_API_KEY in your .env)
        const url = 'https://api.tavily.com/search';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                max_results: 5,
                include_answer: true
            })
        };

        const data = await safeFetch(url, options);

        if (!data || !data.results) {
            throw new Error("No search results were returned from the web provider.");
        }

        // Extract the AI-ready answer and the top 5 snippets
        const aiAnswer = data.answer ? `Summary: ${data.answer}\n\n` : "";
        const results = data.results.map(res =>
            `Source: ${res.url}\nTitle: ${res.title}\nSnippet: ${res.content}`
        ).join("\n\n");

        return {
            content: [{
                type: "text",
                text: `${aiAnswer}Detailed Results:\n${results}`
            }]
        };

    } catch (error) {
        // Keeps the MCP agent loop running even if the API call fails
        return {
            content: [{
                type: "text",
                text: `Web Search Error: ${error.message}. Please try a different query or rely on internal knowledge.`
            }],
            isError: true
        };
    }
}
