import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import {
  register,
  httpRequestsTotal,
  httpErrorsTotal,
  httpRequestDuration,
  activeRequests,
  ordersCreatedTotal,
  calculationTotal,
  calculationDuration,
  orderValue
} from "./metrics.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const startedAt = Date.now();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getRouteLabel(req) {
  return req.route?.path || req.path || "unknown";
}

app.use(async (req, res, next) => {
  const start = process.hrtime.bigint();
  activeRequests.inc();

  res.on("finish", () => {
    const durationSeconds =
      Number(process.hrtime.bigint() - start) / 1_000_000_000;

    const route = getRouteLabel(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSeconds);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }

    activeRequests.dec();
  });

  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "devflow-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  res.json({
    service: "DevFlow Demo Application",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptimeSeconds,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/orders", async (req, res) => {
  // Simulates a database/API call so latency is visible in Prometheus.
  const delay = 50 + Math.floor(Math.random() * 350);
  await sleep(delay);

  const categories = ["Basic", "Standard", "Premium"];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const value = Math.floor(500 + Math.random() * 9500);

  ordersCreatedTotal.inc({ category });
  orderValue.observe({ category }, value);

  res.json({
    orderId: crypto.randomUUID(),
    category,
    value,
    currency: "INR",
    processingTimeMs: delay,
    createdAt: new Date().toISOString()
  });
});

app.post("/api/calculate", async (req, res) => {
  const operation = req.body?.operation || "fibonacci";
  const input = Number(req.body?.input ?? 30);

  const start = process.hrtime.bigint();

  if (!Number.isFinite(input) || input < 0 || input > 40) {
    return res.status(400).json({
      error: "input must be a number between 0 and 40"
    });
  }

  let result;

  if (operation === "fibonacci") {
    let a = 0;
    let b = 1;
    for (let i = 0; i < Math.floor(input); i++) {
      [a, b] = [b, a + b];
    }
    result = a;
  } else if (operation === "square") {
    result = input * input;
  } else if (operation === "factorial") {
    result = 1;
    for (let i = 2; i <= Math.floor(input); i++) {
      result *= i;
    }
  } else {
    return res.status(400).json({
      error: "Supported operations: fibonacci, square, factorial"
    });
  }

  const durationSeconds =
    Number(process.hrtime.bigint() - start) / 1_000_000_000;

  calculationTotal.inc({ operation });
  calculationDuration.observe({ operation }, durationSeconds);

  res.json({
    operation,
    input,
    result,
    durationMs: Number((durationSeconds * 1000).toFixed(3))
  });
});

app.get("/api/demo-load", async (req, res) => {
  const requests = Math.min(Number(req.query.requests || 10), 50);

  // This endpoint creates application traffic for demonstrations.
  const results = [];

  for (let i = 0; i < requests; i++) {
    const delay = 20 + Math.floor(Math.random() * 180);
    await sleep(delay);
    results.push({ request: i + 1, delayMs: delay });
  }

  res.json({
    message: "Demo load generated",
    requests,
    results
  });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`DevFlow backend running on http://localhost:${PORT}`);
  console.log(`Prometheus metrics: http://localhost:${PORT}/metrics`);
});
