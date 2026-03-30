import express from "express";
import cors from "cors";
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MCP server
const transport = new StdioClientTransport({
    command: "node",
    args: ["../mcp-server/index.mjs"],
});

const client = new Client({
    name: "bridge-client",
    version: "1.0.0",
});

await client.connect(transport);

console.log("Connected to MCP server.");


// Chat endpoint
app.post("/agent", async (req, res) => {
    try {
        const { query } = req.body;

        const response = await client.callTool({
            name: "agent",
            arguments: { query },
        });

        let resultText = response.content[0].text;
        let toolsUsed = [];

        if (response.tools_used) {
            toolsUsed = response.tools_used;
        }

        res.json({
            result: resultText,
            tools_used: toolsUsed
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message,
        });
    }
});

// Health check
app.get("/", (req, res) => {
    res.send("MCP Bridge Running...");
});

app.listen(3000, () => {
    console.log("MCP Bridge running on http://localhost:3000");
});

