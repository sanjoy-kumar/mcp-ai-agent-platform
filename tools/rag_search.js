import { z } from 'zod';
import { embedText } from '../services/embedding.js';
import { searchEmbedding } from '../services/vector.js';
import { validate } from '../utils/validator.js';

const schema = z.object({
    query: z.string()
});

export const definition = {
    name: "rag_search",
    description: "Search indexed PDFs using semantic search",
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

    const embedding = await embedText(query);
    const results = await searchEmbedding(embedding);

    if (!results.length) {
        return {
            content: [{
                type: "text",
                text: "No relevant content found in documents."
            }]
        };
    }

    const context = results
        .map((r, i) => `Result ${i + 1}:\n${r.text}`)
        .join("\n\n---\n\n");

    return {
        content: [{
            type: "text",
            text: context
        }]
    };
}

