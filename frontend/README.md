# 🖥️ MCP AI Agent Platform — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/ESLint-Configured-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/MCP-Protocol-blueviolet?style=for-the-badge" />
</p>

> **React + TypeScript + Vite frontend for the MCP AI Agent Platform** — a modern, type-safe chat interface that lets users interact with AI agents powered by the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Communicates with the Flask backend REST API to manage sessions, authentication, and real-time agent conversations.

---

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets (favicon, images, chat.png, etc.)
├── src/                     # Application source code
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-level page components
│   ├── services/            # API client & backend integration
│   ├── hooks/               # Custom React hooks
│   └── main.tsx             # Application entry point
│   └── App.tsx              # Application
├── index.html               # HTML shell
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # Base TypeScript config
├── tsconfig.app.json        # App-specific TypeScript config
├── tsconfig.node.json       # Node/build TypeScript config
├── vite.config.ts           # Vite bundler configuration
└── eslint.config.js         # ESLint rules
```

---

## ✨ Features

- 💬 **AI Chat Interface** — Real-time conversation UI with message history and session management
- 🔐 **JWT Authentication** — Login, registration, and auto-logout on token expiry
- 🧠 **MCP Tool Visibility** — Displays which tools the AI agent invokes during a conversation
- 📂 **Session Management** — Create, browse, and delete chat sessions with persistent history
- ⚡ **HMR Development** — Hot Module Replacement via Vite for a fast dev experience
- 🛡️ **Type-safe Codebase** — Full TypeScript coverage with strict linting via ESLint

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 18](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Bundler | [Vite](https://vitejs.dev/) with SWC / Oxc plugin |
| Linting | [ESLint](https://eslint.org/) with type-aware rules |
| HTTP Client | Fetch API / Axios (via `src/services/`) |
| Auth | JWT stored with auto-expiry logout |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- The [backend service](../backend) running at `http://localhost:5000`

---

### 1. Clone the Repository

```bash
git clone https://github.com/sanjoy-kumar/mcp-ai-agent-platform.git
cd mcp-ai-agent-platform/frontend
```

### 2. Install Dependencies

```bash
npm install
```


> All environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **`http://localhost:5173`** with HMR enabled.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and compile a production bundle to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across all TypeScript/TSX files |

---

## 🔌 Backend Integration

The frontend communicates with the **Flask backend** over REST. All API calls are centralized in `src/services/` and include the JWT `Authorization` header on protected routes.

| Feature | Backend Endpoint |
|---|---|
| Login / Register | `POST /user/login` · `POST /user/register` |
| Send Agent Message | `POST /chat/send` |
| List Sessions | `GET /chat/sessions` |
| Session History | `GET /chat/sessions/:id` |
| Available Tools | `GET /chat/tools` |

See the [Backend README](../backend/README.md) for full API documentation.

---

## 🧱 Architecture Overview

```
┌─────────────────────────────────────┐
│           React Frontend            │
│                                     │
│  ┌──────────┐   ┌────────────────┐  │
│  │  Pages   │   │   Components   │  │
│  │ /login   │   │  ChatBox       │  │
│  │ /chat    │   │  InputBox      │  │
│  │ /register│   │  Sidebar       │  │
│  └────┬─────┘   └───────┬────────┘  │
│       │                 │           │
│       └────────┬────────┘           │
│                ▼                    │
│         src/services/               │
│         API Client (JWT)            │
└────────────────┬────────────────────┘
                 │ HTTP / REST
                 ▼
        ┌─────────────────┐
        │  Flask Backend  │
        │  :5000          │
        └─────────────────┘
```

---

## 🧹 Linting & Code Quality

This project uses **type-aware ESLint rules** for maximum safety. The configuration in `eslint.config.js` extends `tseslint.configs.recommendedTypeChecked` and uses `tsconfig.app.json` for parser options.

To run the linter:

```bash
npm run lint
```

For stricter checking, `tseslint.configs.strictTypeChecked` and `stylisticTypeChecked` can be enabled — see `eslint.config.js` for details.

---

## 🏗️ Production Build

```bash
npm run build
```

Output is placed in the `dist/` folder, ready for deployment to any static host (Vercel, Netlify, Nginx, etc.).

To preview the build locally before deploying:

```bash
npm run preview
```

---

## 🐳 Docker (Optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t mcp-frontend .
docker run -p 8080:80 mcp-frontend
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

- [`/backend`](../backend) — Flask REST API powering authentication and agent sessions
- [`/mcp-bridge`](../mcp-bridge) — Node.js bridge translating HTTP ↔ MCP stdio
- [`/mcp-server`](../mcp-server) — MCP-compliant tool server

---

<p align="center">Built with ❤️ by <a href="https://github.com/sanjoy-kumar">sanjoy-kumar</a></p>
