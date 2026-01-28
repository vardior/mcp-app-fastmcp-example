# Frontend Integration

React frontend patterns for MCP Apps using the `@modelcontextprotocol/ext-apps` SDK.

## Table of Contents

- [React useApp Hook](#react-useapp-hook)
- [Lifecycle Handlers](#lifecycle-handlers)
- [Calling Server Tools](#calling-server-tools)
- [Host Styling](#host-styling)
- [Build Configuration](#build-configuration)

## React useApp Hook

```typescript
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";

function MyApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext>();

  const { app, error } = useApp({
    appInfo: { name: "My App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      // Register all handlers here, BEFORE connect() is called
      app.ontoolresult = async (result) => { /* ... */ };
      app.onhostcontextchanged = (ctx) => setHostContext(prev => ({ ...prev, ...ctx }));
    },
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!app) return <div>Connecting...</div>;

  return <MainContent app={app} hostContext={hostContext} />;
}
```

## Lifecycle Handlers

Register ALL handlers in `onAppCreated` before `connect()` is called.

### ontoolresult - Receive tool execution results

```typescript
app.ontoolresult = async (result) => {
  const textContent = result.content?.find((c) => c.type === "text");
  if (textContent && "text" in textContent) {
    const value = parseResult(textContent.text);
    setState(value);
  }
};
```

### ontoolinput - Observe incoming tool calls

```typescript
app.ontoolinput = async (input) => {
  console.info("Tool called:", input.name, input.arguments);
};
```

### ontoolinputpartial - Streaming partial input (large inputs)

```typescript
app.ontoolinputpartial = (params) => {
  // Healed partial JSON - always valid, fields appear as generated
  preview.textContent = params.arguments?.code ?? "";
};
```

### ontoolcancelled - Handle cancellation

```typescript
app.ontoolcancelled = (params) => {
  setStatus(`Cancelled: ${params.reason}`);
};
```

### onerror - Handle errors

```typescript
app.onerror = (err) => {
  console.error("App error:", err);
  setError(err.message);
};
```

### onhostcontextchanged - React to host UI changes

```typescript
app.onhostcontextchanged = (params) => {
  setHostContext((prev) => ({ ...prev, ...params }));
};
```

### onteardown - Cleanup on app closure

```typescript
app.onteardown = async () => {
  // Cleanup resources
  return {};
};
```

## Calling Server Tools

Use `app.callServerTool()` to invoke Python backend tools:

```typescript
const handleAction = useCallback(async () => {
  setLoading(true);
  try {
    const result = await app.callServerTool({
      name: "my-tool-name",
      arguments: { param1: "value", param2: 42 },
    });

    // Parse result
    const textContent = result.content?.find((c) => c.type === "text");
    if (textContent && "text" in textContent) {
      processResult(textContent.text);
    }
  } catch (e) {
    console.error(e);
    setError("Failed");
  } finally {
    setLoading(false);
  }
}, [app]);
```

## Host Styling

### Safe Area Handling

Always respect `safeAreaInsets` for edge-to-edge layouts:

```tsx
<main
  style={{
    paddingTop: hostContext?.safeAreaInsets?.top,
    paddingRight: hostContext?.safeAreaInsets?.right,
    paddingBottom: hostContext?.safeAreaInsets?.bottom,
    paddingLeft: hostContext?.safeAreaInsets?.left,
  }}
>
```

### CSS Variables

Use host-provided CSS variables for theme integration:

```css
.container {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  border-radius: var(--border-radius-md);
}
```

Key variable groups:
- `--color-background-*`, `--color-text-*`, `--color-border-*`
- `--font-sans`, `--font-mono`
- `--font-text-*-size`, `--font-heading-*-size`
- `--border-radius-*`

### Apply Host Styles (React)

```typescript
import { useHostStyles } from "@modelcontextprotocol/ext-apps/react";

function MyApp() {
  const { app } = useApp({ ... });
  useHostStyles(app); // Injects CSS variables to document
}
```

## Build Configuration

### package.json

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc --noEmit && cross-env INPUT=mcp-app.html vite build"
  },
  "dependencies": {
    "@modelcontextprotocol/ext-apps": "^1.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^4.3.4",
    "cross-env": "^10.1.0",
    "typescript": "^5.9.3",
    "vite": "^6.0.0",
    "vite-plugin-singlefile": "^2.3.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    rollupOptions: {
      input: process.env.INPUT ?? "mcp-app.html",
    },
    outDir: "dist",
  },
});
```

### mcp-app.html (entry point)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>My App</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/mcp-app.tsx"></script>
</body>
</html>
```

## Fullscreen Mode

Request fullscreen when available:

```typescript
app.onhostcontextchanged = (ctx) => {
  if (ctx.availableDisplayModes?.includes("fullscreen")) {
    showFullscreenButton();
  }
  if (ctx.displayMode) {
    setCurrentMode(ctx.displayMode);
  }
};

async function toggleFullscreen() {
  const newMode = currentMode === "fullscreen" ? "inline" : "fullscreen";
  const result = await app.requestDisplayMode({ mode: newMode });
}
```

## Debug Logging

Send logs to host application:

```typescript
await app.sendLog({ level: "info", data: "Debug message" });
await app.sendLog({ level: "error", data: { error: err.message } });
```
