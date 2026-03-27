import express from "express";
import cors from "cors";
import 'dotenv/config';
// OR
import dotenv from 'dotenv';
dotenv.config();

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 🔌 Connect to your MCP server
 */
const transport = new StdioClientTransport({
    command: "node",
    args: ["../mcp-server/index.mjs"], // adjust path
});

const client = new Client({
    name: "bridge-client",
    version: "1.0.0",
});

await client.connect(transport);

console.log("✅ Connected to MCP server");

/**
 * 🚀 Chat endpoint
 */
app.post("/agent", async (req, res) => {
    try {
        const { query } = req.body;

        const response = await client.callTool({
            name: "agent",
            arguments: { query },
        });

        res.json({
            result: response.content[0].text,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message,
        });
    }
});

/**
 * Health check
 */
app.get("/", (req, res) => {
    res.send("MCP Bridge Running 🚀");
});

app.listen(3000, () => {
    console.log("🌐 MCP Bridge running on http://localhost:3000");
});

