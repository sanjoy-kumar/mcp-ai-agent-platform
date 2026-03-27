import fs from 'fs/promises';
import { z } from 'zod';
import { getSafePath } from '../utils/security.js';
import { validate } from '../utils/validator.js';
import path from "path";
import { fileURLToPath } from 'url';

const schema = z.object({
    filename: z.string().min(1)
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const definition = {
    name: "read_file",
    description: "Read a file from allowed directory",
    inputSchema: {
        type: "object",
        properties: {
            filename: { type: "string" }
        },
        required: ["filename"]
    }
};

export async function handler(args) {
    const { filename } = validate(schema, args);
    const filePath = path.resolve(__dirname, '../data', filename);


    try {
        const content = await fs.readFile(filePath, 'utf-8');

        return {
            content: [{
                type: "text",
                text: content
            }]
        };

    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error("File not found");
        }

        throw new Error(`File error: ${error.message}`);
    }
}
