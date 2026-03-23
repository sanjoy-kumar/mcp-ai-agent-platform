let model = null;

export async function getModel() {
    if (!model) {
        const { pipeline } = await import('@xenova/transformers');
        model = await pipeline('sentiment-analysis');
    }
    return model;
}

