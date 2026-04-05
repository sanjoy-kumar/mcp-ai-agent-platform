# 🤖 MCP AI Agent Platform — Backend

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-SQLAlchemy-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-orange?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/MCP-Protocol-blueviolet?style=for-the-badge" />
</p>

> **REST API backend for the MCP AI Agent Platform** — a full-stack application that enables users to interact with AI agents powered by the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). This service handles authentication, session management, agent communication, and persistent storage.

---

## 📁 Project Structure

```
backend/
├── app.py               # Application entry point & Flask app factory
├── config.py            # Environment configuration & settings
├── database.py          # SQLAlchemy database setup & connection
├── models.py            # ORM models (User, Session, ToolUsage, etc.)
├── requirements.txt     # Python dependencies
├── routes/              # API route blueprints
│   └── ...              # Modular route handlers
└── services/            # Business logic & integrations
    └── ...              # Agent, auth, and MCP bridge services
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure user registration, login, and token-based auth via `flask-jwt-extended`
- 🗄️ **PostgreSQL Database** — Persistent storage for users, sessions, and agent interactions via SQLAlchemy
- 🤖 **MCP Agent Integration** — Communicates with the MCP server and bridge layers to route agent tool calls
- 🛠️ **Tool Usage Tracking** — Logs which tools agents invoke, enabling usage analytics and debugging
- 🌐 **CORS-enabled API** — Ready to serve the companion frontend application
- 🧩 **Modular Architecture** — Blueprinted routes and service layer separation for easy extensibility

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Web Framework | [Flask](https://flask.palletsprojects.com/) |
| Database ORM | [SQLAlchemy](https://www.sqlalchemy.org/) + [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) |
| Database | PostgreSQL (`psycopg2-binary`) |
| Authentication | [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) + [bcrypt](https://pypi.org/project/bcrypt/) |
| Cross-Origin | [Flask-CORS](https://flask-cors.readthedocs.io/) |
| HTTP Client | [requests](https://docs.python-requests.org/) |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.10+**
- PostgreSQL running locally or via a cloud provider (e.g. Supabase, Railway, Neon)
- The `mcp-server` and `mcp-bridge` sibling services (see [root README](../README.md))

---

### 1. Clone the Repository

```bash
git clone https://github.com/sanjoy-kumar/mcp-ai-agent-platform.git
cd mcp-ai-agent-platform/backend
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_platform

# JWT
JWT_SECRET_KEY=your-jwt-secret-here

# MCP Bridge URL (sibling service)
MCP_BRIDGE_URL=http://localhost:3001
```

### 5. Initialize the Database

```bash
flask db upgrade
# or if using direct init:
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### 6. Run the Development Server

```bash
python app.py
```

The API will be available at **`http://localhost:5000`**.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Invalidate session |

### Agent / Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agent/message` | Send a message to the AI agent |
| `GET`  | `/api/agent/sessions` | List all chat sessions |
| `GET`  | `/api/agent/sessions/:id` | Retrieve a session's history |
| `DELETE` | `/api/agent/sessions/:id` | Delete a session |

### Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tools` | List all available MCP tools |
| `GET` | `/api/tools/usage` | Get tool usage history |

> **Note:** All `/api/agent/*` and `/api/tools/*` routes require a valid `Authorization: Bearer <token>` header.

---

## 🗃️ Data Models

### `User`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String | Unique user email |
| `password_hash` | String | bcrypt-hashed password |
| `created_at` | DateTime | Account creation timestamp |

### `Session`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | FK → User | Owning user |
| `title` | String | Auto-generated session title |
| `created_at` | DateTime | Session creation timestamp |

### `Message`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | FK → Session | Parent session |
| `role` | Enum | `user` or `assistant` |
| `content` | Text | Message body |
| `created_at` | DateTime | Message timestamp |

### `ToolUsage`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | FK → Session | Associated session |
| `tool_name` | String | Name of the MCP tool invoked |
| `input` | JSON | Tool input parameters |
| `output` | JSON | Tool response |
| `created_at` | DateTime | Invocation timestamp |

---

## 🧱 Architecture Overview

```
┌────────────┐     HTTP      ┌─────────────┐     MCP      ┌─────────────┐
│  Frontend  │ ────────────► │   Backend   │ ───────────► │  MCP Bridge │
│  (React)   │ ◄──────────── │   (Flask)   │ ◄─────────── │  (Node.js)  │
└────────────┘               └──────┬──────┘              └──────┬──────┘
                                    │ SQLAlchemy                 │ stdio
                                    ▼                            ▼
                             ┌─────────────┐              ┌─────────────┐
                             │  PostgreSQL │              │  MCP Server │
                             └─────────────┘              └─────────────┘
```

The backend sits between the **React frontend** and the **MCP bridge/server** layers:

- It authenticates requests, manages user sessions, and persists chat history in PostgreSQL.
- It proxies agent messages to the MCP bridge, which communicates with the MCP server via the standard I/O protocol.
- Tool invocations made by the AI are recorded for audit and analytics.

---

## 🧪 Running Tests

```bash
# Install test dependencies (if applicable)
pip install pytest pytest-flask

# Run tests
pytest tests/
```

---

## 🐳 Docker (Optional)

```dockerfile
# Example Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
docker build -t mcp-backend .
docker run -p 5000:5000 --env-file .env mcp-backend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).

---

## 🔗 Related

- [`/frontend`](../frontend) — React frontend for the platform
- [`/mcp-bridge`](../mcp-bridge) — Node.js bridge translating HTTP ↔ MCP stdio
- [`/mcp-server`](../mcp-server) — MCP-compliant tool server

---

<p align="center">Built with ❤️ by <a href="https://github.com/sanjoy-kumar">sanjoy-kumar</a></p>
