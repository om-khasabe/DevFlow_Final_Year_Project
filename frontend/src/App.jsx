import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

function MetricCard({ title, value, description }) {
  return (
    <div className="card metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      <div className="muted">{description}</div>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [order, setOrder] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadResult, setLoadResult] = useState(null);

  async function getStatus() {
    try {
      const response = await fetch(`${API}/api/status`);
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }

  async function createOrder() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/orders`);
      setOrder(await response.json());
    } finally {
      setLoading(false);
      getStatus();
    }
  }

  async function calculate(operation) {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, input: operation === "square" ? 25 : 30 })
      });
      setCalculation(await response.json());
    } finally {
      setLoading(false);
    }
  }

  async function generateLoad() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/demo-load?requests=10`);
      setLoadResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStatus();
    const timer = setInterval(getStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="container">
      <header className="hero">
        <div>
          <div className="eyebrow">DEVFLOW • CI/CD OBSERVABILITY</div>
          <h1>Application Monitoring Lab</h1>
          <p>
            A deliberately instrumented web application for demonstrating
            Jenkins, Prometheus, Grafana and automated testing.
          </p>
        </div>
        <div className={`status ${status ? "up" : "down"}`}>
          <span className="dot" />
          {status ? "APPLICATION UP" : "APPLICATION OFFLINE"}
        </div>
      </header>

      <section className="metrics-grid">
        <MetricCard
          title="Service"
          value={status?.service || "—"}
          description="Backend service name"
        />
        <MetricCard
          title="Version"
          value={status?.version || "—"}
          description="Deployable application version"
        />
        <MetricCard
          title="Uptime"
          value={status ? `${status.uptimeSeconds}s` : "—"}
          description="Current process uptime"
        />
        <MetricCard
          title="Environment"
          value={status?.environment || "—"}
          description="Runtime environment"
        />
      </section>

      <section className="layout">
        <div className="card">
          <h2>Generate application traffic</h2>
          <p className="muted">
            These operations create real Prometheus samples that you can graph
            in Grafana.
          </p>
          <div className="buttons">
            <button onClick={createOrder} disabled={loading}>
              Create simulated order
            </button>
            <button onClick={generateLoad} disabled={loading}>
              Generate 10 requests
            </button>
          </div>

          {order && (
            <div className="result">
              <strong>Order created</strong>
              <span>{order.category} • ₹{order.value}</span>
              <span>{order.processingTimeMs} ms processing time</span>
            </div>
          )}

          {loadResult && (
            <div className="result">
              <strong>Load generated</strong>
              <span>{loadResult.requests} requests completed</span>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Calculation workload</h2>
          <p className="muted">
            Different operations create useful request-count and latency
            metrics for monitoring.
          </p>
          <div className="buttons">
            <button onClick={() => calculate("fibonacci")} disabled={loading}>
              Fibonacci
            </button>
            <button onClick={() => calculate("factorial")} disabled={loading}>
              Factorial
            </button>
            <button onClick={() => calculate("square")} disabled={loading}>
              Square
            </button>
          </div>

          {calculation && (
            <div className="result">
              <strong>{calculation.operation}</strong>
              <span>
                Input {calculation.input} → {calculation.result}
              </span>
              <span>{calculation.durationMs} ms</span>
            </div>
          )}
        </div>
      </section>

      <section className="card monitoring">
        <div>
          <h2>Monitoring endpoints</h2>
          <p className="muted">
            These are the endpoints your CI/CD and monitoring stack can use.
          </p>
        </div>
        <div className="endpoint-list">
          <a href="/health" target="_blank">GET /health</a>
          <a href="/metrics" target="_blank">GET /metrics</a>
          <span>GET /api/status</span>
          <span>GET /api/orders</span>
          <span>POST /api/calculate</span>
        </div>
      </section>

      <footer>
        DevFlow • React + Express + Prometheus + Grafana + Playwright
      </footer>
    </main>
  );
}
