import { safeFetch } from '../utils/fetch.js';
import { z } from 'zod';
import { env } from '../config/env.js';

const apiKey = env.STOCK_API_KEY;

const schema = z.object({
    symbol: z.string().min(1)
});

export const definition = {
    name: "get_stock_price",
    description: "Get latest stock price",
    inputSchema: {
        type: "object",
        properties: {
            symbol: { type: "string" }
        },
        required: ["symbol"]
    }
};

export async function handler(args) {
    const { symbol } = schema.parse(args);
    if (!apiKey) {
        throw new Error("Missing STOCK_API_KEY");
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    const data = await safeFetch(url);

    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
        throw new Error("Invalid symbol or API limit reached");
    }

    return {
        content: [{
            type: "text",
            text: `Stock: ${symbol.toUpperCase()} | Price: $${quote["05. price"]} | Change: ${quote["09. change"]}`
        }]
    };
}
