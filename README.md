# DevFlow Monitoring Web Application

A React + Node/Express application designed for a CI/CD monitoring project.

## Architecture

Browser -> React/Vite -> Express API -> Prometheus client -> `/metrics`
                                      |
                                      +-> application calculations
                                      |
Prometheus -> Grafana

## Included features

- React dashboard
- Express backend
- `/health` endpoint for CI/CD health checks
- `/api/calculate` endpoint with CPU-style calculation work
- `/api/orders` endpoint that simulates application traffic
- `/metrics` Prometheus endpoint
- HTTP request count, latency, active requests and response/error metrics
- Business metrics for orders and calculation requests
- Docker Compose with Prometheus and Grafana
- Prometheus configuration
- Grafana provisioning
- Playwright smoke tests
- Dockerfiles for frontend and backend

## Local development

Requirements:
- Node.js 20+
- npm

From the project root:

```bash
npm install
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:4000

Metrics:
http://localhost:4000/metrics

Health:
http://localhost:4000/health

## Monitoring with Docker

Start Prometheus and Grafana:

```bash
docker compose up -d prometheus grafana
```

Prometheus:
http://localhost:9090

Grafana:
http://localhost:3000

Grafana login:
- username: admin
- password: admin

The application itself can remain running locally with `npm run dev`.

On Windows/Docker Desktop, if Prometheus runs in Docker and the Node server runs on the host, the supplied Prometheus configuration uses `host.docker.internal:4000`.

## Full Docker setup

```bash
docker compose up --build
```

Frontend:
http://localhost:5173

Backend:
http://localhost:4000

Prometheus:
http://localhost:9090

Grafana:
http://localhost:3000

## Useful Prometheus queries

```promql
rate(devflow_http_requests_total[1m])
```

```promql
rate(devflow_http_errors_total[1m])
```

```promql
histogram_quantile(0.95, sum(rate(devflow_http_request_duration_seconds_bucket[5m])) by (le))
```

```promql
devflow_active_requests
```

```promql
rate(devflow_orders_created_total[5m])
```

```promql
rate(devflow_calculations_total[5m])
```

## Jenkins

A CI/CD pipeline can:

1. checkout GitHub code
2. install dependencies
3. run backend/frontend build
4. run Playwright tests
5. build Docker images
6. deploy containers
7. verify `/health`
8. expose `/metrics` to Prometheus

Example health check:

```bash
curl http://localhost:4000/health
```
