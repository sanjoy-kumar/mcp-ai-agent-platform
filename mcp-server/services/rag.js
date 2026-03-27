import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { embedText } from './embedding.js';
import { addEmbedding } from './vector.js';

function chunkText(text, size = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

export async function indexPDF(filePath) {
    try {
        const buffer = await fs.readFile(filePath);

        const data = await pdfParse(buffer);

        if (!data.text) {
            throw new Error("No text extracted from PDF");
        }

        const chunks = chunkText(data.text);

        for (const chunk of chunks) {
            const embedding = await embedText(chunk);
            await addEmbedding(chunk, embedding);
        }

        return chunks.length;

    } catch (err) {
        throw new Error(`PDF processing error: ${err.message}`);
    }
}
