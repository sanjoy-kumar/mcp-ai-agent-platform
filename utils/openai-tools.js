import { toolDefinitions } from "../tools/index.js";

export function toOpenAITools() {
    return toolDefinitions.map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema
        }
    }));
}
