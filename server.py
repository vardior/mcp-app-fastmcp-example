"""
MCP Demo App Server

An interactive counter demonstrating MCP Apps SDK with Python/FastMCP.
"""

import argparse
import os
from pathlib import Path
from typing import Annotated

from mcp.server.fastmcp import FastMCP

DIST_DIR = Path(__file__).parent / "dist"
RESOURCE_URI = "ui://counter/mcp-app.html"
RESOURCE_MIME_TYPE = "text/html;profile=mcp-app"

counter = 0

mcp = FastMCP(name="MCP Demo Counter App")


@mcp.tool(
    name="get-counter",
    description="Returns the current counter value and displays an interactive UI.",
    meta={"ui": {"resourceUri": RESOURCE_URI}},
)
def get_counter() -> str:
    return f"Current counter value: {counter}"


@mcp.tool(
    name="increment-counter",
    description="Increments the counter by a specified amount.",
)
def increment_counter(
    amount: Annotated[int, "Amount to increment (default: 1)"] = 1,
) -> str:
    global counter
    counter += amount
    return f"Counter incremented to: {counter}"


@mcp.tool(
    name="decrement-counter",
    description="Decrements the counter by a specified amount.",
)
def decrement_counter(
    amount: Annotated[int, "Amount to decrement (default: 1)"] = 1,
) -> str:
    global counter
    counter -= amount
    return f"Counter decremented to: {counter}"


@mcp.tool(
    name="reset-counter",
    description="Resets the counter to zero.",
)
def reset_counter() -> str:
    global counter
    counter = 0
    return "Counter reset to 0"


@mcp.resource(uri=RESOURCE_URI, mime_type=RESOURCE_MIME_TYPE)
def get_ui_resource() -> str:
    html_path = DIST_DIR / "mcp-app.html"
    if not html_path.exists():
        raise FileNotFoundError(f"UI resource not found: {html_path}")
    return html_path.read_text(encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="MCP Demo Counter App Server")
    parser.add_argument(
        "--stdio",
        action="store_true",
        help="Run with stdio transport (default is HTTP)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", "3001")),
        help="Port for HTTP server (default: 3001)",
    )
    args = parser.parse_args()

    if args.stdio:
        mcp.run(transport="stdio")
    else:
        mcp.settings.host = "0.0.0.0"
        mcp.settings.port = args.port
        mcp.settings.streamable_http_path = "/mcp"
        print(f"MCP Demo Server listening on http://localhost:{args.port}/mcp")
        mcp.run(transport="streamable-http")


if __name__ == "__main__":
    main()
