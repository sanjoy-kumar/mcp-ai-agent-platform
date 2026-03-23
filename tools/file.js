import fs from 'fs/promises';
import { z } from 'zod';
import { getSafePath } from '../utils/security.js';
import { validate } from '../utils/validator.js';

const schema = z.object({
    filename: z.string().min(1)
});

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

    const filePath = getSafePath(filename);

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
