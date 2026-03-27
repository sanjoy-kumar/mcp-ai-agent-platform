import { getModel } from '../services/sentiment.js';

export const definition = {
    name: "analyze_sentiment",
    description: "Analyze sentiment",
    inputSchema: {
        type: "object",
        properties: {
            text: { type: "string" }
        },
        required: ["text"]
    }
};

export async function handler(args) {
    const model = await getModel();
    const result = await model(args.text);

    const { label, score } = result[0];

    return {
        content: [{
            type: "text",
            text: `${label} (${(score * 100).toFixed(1)}%)`
        }]
    };
}
