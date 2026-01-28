---
name: mcp-app-python
description: Build MCP Apps with Python and FastMCP. Use when creating MCP servers with interactive UIs using Python backend. Covers FastMCP tool/resource registration, linking tools to UI resources, and React frontend integration. Triggers on requests like "create Python MCP app", "build MCP server with UI in Python", "FastMCP with interactive UI", or when adding UI capabilities to existing Python MCP servers.
---

# MCP App Python

Build interactive UIs for MCP servers using Python/FastMCP backend with React frontend.

## Core Concept: Tool + Resource

Every MCP App requires:

1. **Tool** - Decorated Python function called by the host
2. **Resource** - Serves bundled HTML UI
3. **Link** - Tool's `meta={"ui": {"resourceUri": ...}}` references the resource

```
Host calls tool → Server returns result → Host renders resource UI → UI receives result
```

## Quick Start

### Python Backend (server.py)

```python
from pathlib import Path
from mcp.server.fastmcp import FastMCP

DIST_DIR = Path(__file__).parent / "dist"
RESOURCE_URI = "ui://myapp/mcp-app.html"
RESOURCE_MIME_TYPE = "text/html;profile=mcp-app"

mcp = FastMCP(name="My MCP App")

@mcp.tool(
    name="show-ui",
    description="Displays the interactive UI.",
    meta={"ui": {"resourceUri": RESOURCE_URI}},
)
def show_ui() -> str:
    return "UI displayed"

@mcp.resource(uri=RESOURCE_URI, mime_type=RESOURCE_MIME_TYPE)
def get_ui_resource() -> str:
    return (DIST_DIR / "mcp-app.html").read_text(encoding="utf-8")

def main():
    mcp.run(transport="stdio")

if __name__ == "__main__":
    main()
```

### pyproject.toml

```toml
[project]
name = "my-mcp-app"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = ["mcp[cli]>=1.0.0"]

[project.scripts]
my-mcp-app = "server:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["."]
include = ["server.py", "dist/**"]
```

## Tool Patterns

### Tool with UI (shows interactive view)

```python
@mcp.tool(
    name="get-data",
    description="Returns data and displays UI.",
    meta={"ui": {"resourceUri": RESOURCE_URI}},
)
def get_data() -> str:
    return f"Data: {data}"
```

### Tool without UI (model-only operations)

```python
@mcp.tool(
    name="update-data",
    description="Updates data without UI.",
)
def update_data(value: Annotated[int, "New value"]) -> str:
    global data
    data = value
    return f"Updated to: {data}"
```

### Parameter Annotations

```python
from typing import Annotated

@mcp.tool(name="process")
def process(
    required_param: Annotated[str, "This is required"],
    optional_param: Annotated[int, "Optional with default"] = 10,
) -> str:
    return f"Processed {required_param} with {optional_param}"
```

## Transport Options

### stdio (default for Claude Desktop)

```python
mcp.run(transport="stdio")
```

### HTTP (for development/testing)

```python
import os
mcp.settings.host = "0.0.0.0"
mcp.settings.port = int(os.environ.get("PORT", "3001"))
mcp.settings.streamable_http_path = "/mcp"
mcp.run(transport="streamable-http")
```

## Frontend Integration

The frontend uses React with MCP Apps SDK. See `references/frontend.md` for:
- React `useApp` hook setup
- Lifecycle handlers (`ontoolresult`, `ontoolinput`, etc.)
- Calling server tools from UI
- Host styling integration

Build with Vite + `vite-plugin-singlefile` to create bundled HTML.

## Project Structure

```
my-mcp-app/
├── server.py           # Python FastMCP server
├── pyproject.toml      # Python dependencies
├── package.json        # Frontend dependencies
├── vite.config.ts      # Vite build config
├── mcp-app.html        # HTML entry point
├── src/
│   ├── mcp-app.tsx     # React app
│   └── mcp-app.module.css
└── dist/
    └── mcp-app.html    # Built single-file output
```

## Development Workflow

```bash
# Install dependencies
npm install && uv sync

# Build frontend
npm run build

# Run server (HTTP for testing)
uv run python server.py

# Run server (stdio for Claude Desktop)
uv run python server.py --stdio
```

## Testing with basic-host

```bash
# Clone MCP Apps SDK examples
git clone --branch "v$(npm view @modelcontextprotocol/ext-apps version)" \
  --depth 1 https://github.com/modelcontextprotocol/ext-apps.git /tmp/mcp-ext-apps

# Terminal 1: Run your server
npm run build && uv run python server.py

# Terminal 2: Run basic-host
cd /tmp/mcp-ext-apps/examples/basic-host
npm install
SERVERS='["http://localhost:3001/mcp"]' npm run start
# Open http://localhost:8080
```
