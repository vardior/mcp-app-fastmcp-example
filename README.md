# MCP Demo Counter App

An interactive counter UI demonstrating MCP Apps SDK with Python/FastMCP and React.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [uv](https://docs.astral.sh/uv/)

## Quick Start

```bash
npm install && uv sync
npm run build
uv run python server.py
```

For stdio transport: `uv run python server.py --stdio`

## Tools

| Tool | Description |
|------|-------------|
| `get-counter` | Get current value and display UI |
| `increment-counter` | Increment by amount |
| `decrement-counter` | Decrement by amount |
| `reset-counter` | Reset to zero |

## Project Structure

```
├── server.py
├── pyproject.toml
├── src/
│   ├── mcp-app.tsx
│   ├── mcp-app.module.css
│   └── global.css
├── mcp-app.html
├── dist/
├── vite.config.ts
└── package.json
```

## How It Works

1. Server registers MCP tools linked to a UI resource
2. Host fetches the bundled HTML when a tool is called
3. React app connects via `useApp` hook from `@modelcontextprotocol/ext-apps`
4. UI calls server tools via `app.callServerTool()`

## Development

```bash
npm run build:watch  # Terminal 1
uv run python server.py  # Terminal 2
```

Port defaults to 3001. Override with `PORT=8080 uv run python server.py`.
