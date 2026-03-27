import fs from 'fs/promises';
import path from 'path';
import cosineSimilarity from 'cosine-similarity';

const DB_PATH = path.resolve('./data/vector-db/index.json');

async function loadDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveDB(data) {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function addEmbedding(text, embedding) {
    const db = await loadDB();
    db.push({ text, embedding });
    await saveDB(db);
}

export async function searchEmbedding(queryEmbedding, topK = 3) {
    const db = await loadDB();

    const scored = db.map(item => ({
        text: item.text,
        score: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}