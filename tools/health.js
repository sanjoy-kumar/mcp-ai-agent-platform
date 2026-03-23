export const definition = {
    name: "health_check",
    description: "Check server health",
    inputSchema: {
        type: "object",
        properties: {}
    }
};

export async function handler() {
    return {
        content: [{ type: "text", text: "Server is healthy ✅" }]
    };
}
