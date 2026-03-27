import { z } from 'zod';
import path from 'path';
import { indexPDF } from '../services/rag.js';
import { validate } from '../utils/validator.js';
import { fileURLToPath } from 'url';

const schema = z.object({
    filename: z.string()
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
        const filePath = path.resolve(__dirname, '../data/docs', filename);
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

