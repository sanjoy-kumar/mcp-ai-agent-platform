# MCP AI Agent Platform

Production-grade AI Agent Platform with MCP, RAG, and Multi-Tool Reasoning

## Why This Project

This project demonstrates how to build a production-ready AI system that:

- Integrates LLMs with real-world tools (APIs, DB, files)
- Implements Retrieval-Augmented Generation (RAG)
- Uses vector embeddings for semantic search
- Supports multi-step reasoning via an AI agent


## Key Highlights

- Built a multi-tool AI agent using OpenAI function calling
- Designed modular MCP server architecture
- Implemented RAG pipeline for PDF search
- Developed local vector database with cosine similarity
- Integrated external APIs (weather, stock)
- Added secure file handling and validation

## MCP Tools

### Tools
- 📊 Stock Price (`get_stock_price`)
- 🌦️ Weather (`get_weather`)
- 🗄️ Database Query (`query_db`)
- 📁 File Reader (`read_file`)
- 🧮 Calculator (`calculate`)

### RAG (PDF Search)
- Index PDF documents
- Semantic search using embeddings
- Context-aware answers

### Vector Database
- Local embedding storage
- Cosine similarity search

## System Architecture

```text
User → AI Agent → Tool Selection → Tool Execution → Response
```

## Tech Stack

- Node.js (ESM)
- MCP SDK (`@modelcontextprotocol/sdk`)
- OpenAI API
- PostgreSQL (`pg`)
- Transformers (`@xenova/transformers`)
- PDF Parsing (`pdf-parse`)
- Validation (`zod`)

## Project Structure
```text
mcp-ai-agent-platform/
│
├── index.mjs
├── server.mjs
│
├── tools/
├── services/
├── utils/
├── config/
│
├── data/
│ ├── docs/
│ ├── vector-db/
```


## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/sanjoy-kumar/mcp-ai-agent-platform.git
cd mcp-ai-agent-platform
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment

Create .env:

```text
OPENAI_API_KEY=your_key
STOCK_API_KEY=your_key

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=testdb
DB_PORT=5432
```


### 4. Run Server
```bash
npm start
```

## Add Real Test Examples using MCP Inspector
```bash
npm install -g @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector
```

http://localhost:6274/

Set the following parameters:

- Transport Type: **STDIO**
- Command: **node**
- Arguments: **index.mjs**

Then click the **Connect** Button.

## Production Features

- Input validation using Zod
- Environment variable validation
- Secure file access
- API timeout handling
- Modular architecture
- Error handling and logging

## Security Considerations

- Prevents directory traversal in file access
- Restricts database queries to predefined statements
- Validates all inputs
- Uses environment variables for sensitive data


## Final Architecture
React UI (mcp-ai-ui)
   ↓
HTTP (axios)
   ↓
Express API (server.js)
   ↓
MCP Client
   ↓
MCP Server (index.mjs)
   ↓
Tools (weather, stock, RAG)
