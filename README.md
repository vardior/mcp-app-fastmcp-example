# MCP Demo Counter App

An interactive counter UI demonstrating MCP Apps SDK with Python/FastMCP and React.

<img width="886" height="824" alt="image" src="https://github.com/user-attachments/assets/d40c1e64-ad5b-4ea9-a7dd-aa2d104b9ee7" />


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
npm run build  # Static app page
uv run python server.py  # MCP server
```

Port defaults to 3001. Override with `PORT=8080 uv run python server.py`.
