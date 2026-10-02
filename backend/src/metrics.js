import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "devflow_"
});

export const httpRequestsTotal = new client.Counter({
  name: "devflow_http_requests_total",
  help: "Total number of HTTP requests received.",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

export const httpErrorsTotal = new client.Counter({
  name: "devflow_http_errors_total",
  help: "Total number of HTTP 4xx and 5xx responses.",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

export const httpRequestDuration = new client.Histogram({
  name: "devflow_http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

export const activeRequests = new client.Gauge({
  name: "devflow_active_requests",
  help: "Number of HTTP requests currently being processed.",
  registers: [register]
});

export const ordersCreatedTotal = new client.Counter({
  name: "devflow_orders_created_total",
  help: "Total number of simulated orders created.",
  labelNames: ["category"],
  registers: [register]
});

export const calculationTotal = new client.Counter({
  name: "devflow_calculations_total",
  help: "Total number of calculation operations.",
  labelNames: ["operation"],
  registers: [register]
});

export const calculationDuration = new client.Histogram({
  name: "devflow_calculation_duration_seconds",
  help: "Duration of calculation operations in seconds.",
  labelNames: ["operation"],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register]
});

export const orderValue = new client.Histogram({
  name: "devflow_order_value_rupees",
  help: "Distribution of simulated order values in INR.",
  labelNames: ["category"],
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000, 25000],
  registers: [register]
});

export { register };
