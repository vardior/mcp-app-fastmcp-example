/**
 * Counter MCP App - Demonstrates interactive UI with MCP Apps SDK + React
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./mcp-app.module.css";

function extractCounterValue(result: CallToolResult): number | null {
  const textContent = result.content?.find((c) => c.type === "text");
  if (textContent && "text" in textContent) {
    const match = textContent.text.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : null;
  }
  return null;
}

function CounterApp() {
  const [counter, setCounter] = useState<number | null>(null);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [status, setStatus] = useState<string>("");

  const { app, error } = useApp({
    appInfo: { name: "Counter App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("App is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool call input:", input);
      };

      app.ontoolresult = async (result) => {
        console.info("Received tool call result:", result);
        const value = extractCounterValue(result);
        if (value !== null) {
          setCounter(value);
        }
      };

      app.ontoolcancelled = (params) => {
        console.info("Tool call cancelled:", params.reason);
        setStatus("Operation cancelled");
      };

      app.onerror = (err) => {
        console.error("App error:", err);
        setStatus(`Error: ${err.message}`);
      };

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error) {
    return (
      <div className={styles.main}>
        <p className={styles.error}>ERROR: {error.message}</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className={styles.loading}>Connecting...</div>
    );
  }

  return (
    <CounterAppInner
      app={app}
      counter={counter}
      setCounter={setCounter}
      hostContext={hostContext}
      status={status}
      setStatus={setStatus}
    />
  );
}

interface CounterAppInnerProps {
  app: App;
  counter: number | null;
  setCounter: (value: number | null) => void;
  hostContext?: McpUiHostContext;
  status: string;
  setStatus: (status: string) => void;
}

function CounterAppInner({
  app,
  counter,
  setCounter,
  hostContext,
  status,
  setStatus,
}: CounterAppInnerProps) {
  const [loading, setLoading] = useState(false);

  const handleIncrement = useCallback(async () => {
    setLoading(true);
    setStatus("Incrementing...");
    try {
      const result = await app.callServerTool({
        name: "increment-counter",
        arguments: { amount: 1 },
      });
      const value = extractCounterValue(result);
      if (value !== null) {
        setCounter(value);
        setStatus("Incremented!");
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to increment");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 1500);
    }
  }, [app, setCounter, setStatus]);

  const handleDecrement = useCallback(async () => {
    setLoading(true);
    setStatus("Decrementing...");
    try {
      const result = await app.callServerTool({
        name: "decrement-counter",
        arguments: { amount: 1 },
      });
      const value = extractCounterValue(result);
      if (value !== null) {
        setCounter(value);
        setStatus("Decremented!");
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to decrement");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 1500);
    }
  }, [app, setCounter, setStatus]);

  const handleReset = useCallback(async () => {
    setLoading(true);
    setStatus("Resetting...");
    try {
      await app.callServerTool({
        name: "reset-counter",
        arguments: {},
      });
      setCounter(0);
      setStatus("Reset!");
    } catch (e) {
      console.error(e);
      setStatus("Failed to reset");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 1500);
    }
  }, [app, setCounter, setStatus]);

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      <h1 className={styles.title}>MCP Counter Demo</h1>

      <div className={styles.counterDisplay}>
        <span className={styles.counterValue}>
          {counter !== null ? counter : "—"}
        </span>
        <span className={styles.counterLabel}>Current Value</span>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={handleDecrement}
          disabled={loading}
        >
          − Decrease
        </button>
        <button
          className={`${styles.button} ${styles.buttonSuccess}`}
          onClick={handleIncrement}
          disabled={loading}
        >
          + Increase
        </button>
      </div>

      <button
        className={`${styles.button} ${styles.buttonPrimary}`}
        onClick={handleReset}
        disabled={loading}
      >
        Reset to Zero
      </button>

      <p className={styles.status}>{status}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CounterApp />
  </StrictMode>
);
