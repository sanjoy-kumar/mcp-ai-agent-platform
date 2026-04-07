# MCP AI Agent Platform - MCP Bridge

- Receives query from backend
- Passes to MCP server's agent.js

## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/sanjoy-kumar/mcp-ai-agent-platform.git
cd mcp-ai-agent-platform/mcp-bridge
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment

Create .env or rename the .env-example as .env:

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
node server.js
```

