import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { toolDefinitions, toolHandlers } from './tools/index.js';
import { log } from './utils/logger.js';

export async function startServer() {
    const server = new Server(
        { name: "production-mcp-server", version: "2.0.0" },
        { capabilities: { tools: {} } }
    );

    // List tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: toolDefinitions };
    });

    // Call tools
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            const handler = toolHandlers[name];

            if (!handler) {
                throw new Error(`Tool not found: ${name}`);
            }

            return await handler(args);

        } catch (error) {
            log(`Error in ${name}: ${error.message}`);

            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    log("MCP Server started");
}
