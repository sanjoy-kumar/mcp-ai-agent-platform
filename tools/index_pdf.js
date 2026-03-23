import { z } from 'zod';
import path from 'path';
import { indexPDF } from '../services/rag.js';
import { validate } from '../utils/validator.js';

const schema = z.object({
    filename: z.string()
});

export const definition = {
    name: "index_pdf",
    description: "Index a PDF into vector database",
    inputSchema: {
        type: "object",
        properties: {
            filename: { type: "string" }
        },
        required: ["filename"]
    }
};

export async function handler(args) {
    try {
        const { filename } = validate(schema, args);
        const filePath = path.resolve(`./data/docs/${filename}`);
        const count = await indexPDF(filePath);

        return {
            content: [{
                type: "text",
                text: `Indexed ${count} chunks from ${filename}`
            }]
        };

    } catch (err) {
        return {
            content: [{
                type: "text",
                text: `Indexing failed: ${err.message}`
            }],
            isError: true
        };
    }
}

