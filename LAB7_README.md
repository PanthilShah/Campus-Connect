# Lab 7 — API Gateway, Service Discovery & Cloud Deployment

**Web Services & Service-Oriented Architecture (SOA) Laboratory**  
**Dhirubhai Ambani University (formerly DA-IICT)**  
**MScIT Semester 3 | Student: Panthil Shah**

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                          INTERNET / POSTMAN                        │
└────────────────────────────┬──────────────────────────────────────┘
                             │  HTTP (port 3000 / cloud URL)
                             ▼
            ┌────────────────────────────────┐
            │      CampusConnect API Gateway  │  ← Single Public Entry Point
            │        (campus-api-gateway)     │    Request Logging | /health
            │          Port 3000 (public)     │    Config-Based Service Discovery
            │   Reads service URLs from ENV   │    Centralized 502/503 handling
            └────┬──────────────┬────────────┘
                 │   campus-network (Docker bridge — internal only)
     ┌───────────┤    ┌──────────┤   ┌──────────────┐
     ▼           │    ▼         │   ▼              
┌──────────┐  ┌─────────────┐  ┌───────────────┐
│  User    │  │  Product    │  │  Order        │
│ Service  │  │  Service    │  │  Service      │
│ :3001    │  │  :3002      │  │  :3003        │
│(internal)│  │  (internal) │  │  (internal)   │
└──────────┘  └─────────────┘  └───────────────┘
      ▲               ▲                ▲
      │               │                │  (inter-service calls for order validation)
      └───────────────┴────────────────┘
                    No external port exposure
                    (Docker network only)
```

> **Key Lab 7 constraint:** The Docker Compose file exposes **only port 3000** (API Gateway).  
> Users, Products, and Orders services have **no `ports:` mapping** — they are inaccessible  
> from outside the Docker network. All traffic must flow through the gateway.

---

## Part A — Real API Gateway

### What Was Built

| Feature | Implementation |
|---|---|
| Single entry point | All routes go through `localhost:3000` (or cloud URL) |
| Route `/users/*` | Proxied to User Service via `USER_SERVICE_URL` env var |
| Route `/products/*` | Proxied to Product Service via `PRODUCT_SERVICE_URL` env var |
| Route `/orders/*` | Proxied to Order Service via `ORDER_SERVICE_URL` env var |
| `GET /health` | Returns `{ status: 'UP', uptime, port, registry }` — no proxying |
| Request logging | Every request logs: `[timestamp] METHOD path -> Service | status | Xms` |
| 502/503 handling | If a service is unreachable, returns structured JSON with service name and hint |
| Zero business logic | Gateway only routes; all CRUD logic stays in respective services |

### Sample Log Output

```
[2026-09-29T12:00:00.000Z] GET    /users                   -> User Service       | 200 | 12ms
[2026-09-29T12:00:01.000Z] POST   /orders                  -> Order Service      | 201 | 45ms
[2026-09-29T12:00:02.000Z] GET    /products/501            -> Product Service    | 200 | 8ms
[2026-09-29T12:00:03.000Z] GET    /health                  -> GATEWAY            | 200 | 1ms
```

### Discussion Question: Why an API Gateway?

> *"Why introduce an API Gateway instead of letting clients call each service directly?"*

**Single Entry Point:** Without a gateway, a client (web browser, Android app, Postman) needs to know the individual URLs and ports of every microservice — potentially dozens of addresses in a real system. The gateway collapses this to one address. When services are deployed to cloud with dynamic IPs, clients remain completely unaware.

**Hiding Internal Structure:** Services can be renamed, split, or merged without any client change. From outside the Docker network, clients cannot even reach the internal services directly (port mapping is removed). The gateway acts as a security boundary and an abstraction layer.

**Centralized Cross-Cutting Concerns:** Without a gateway, each service must independently implement: CORS, authentication middleware, request logging, rate limiting, error formatting, and API versioning. The gateway implements these once. In Lab 7, request logging and 502/503 error formatting are in the gateway only — the microservices themselves have no awareness of cross-cutting concerns.

---

## Part B — Service Discovery (Configuration-Based)

### How It Works

The gateway's service locations are stored in a dedicated `service-registry.js` module:

```javascript
// service-registry.js — all URLs from env vars, zero hard-coding
function buildRegistry() {
  return {
    'user-service':    { url: process.env.USER_SERVICE_URL    || 'http://localhost:3001', ... },
    'product-service': { url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002', ... },
    'order-service':   { url: process.env.ORDER_SERVICE_URL   || 'http://localhost:3003', ... },
  };
}
```

**Route handlers never reference a URL literal.** They call `resolveService(path)` which looks up the live registry:

```javascript
// server.js — zero hard-coded URLs
app.use('/users', (req, res) => {
  const svc = resolveService(req.originalUrl);   // reads from registry
  proxyRequest(svc, req, res);
});
```

### Proving Config-Based Discovery Works

To re-route the User Service **without touching any code**:

```bash
# Stop the stack
docker compose -f compose.microservices.yaml down

# Edit compose.microservices.yaml: change USER_SERVICE_URL to a new address
# e.g., USER_SERVICE_URL=http://user-service-v2:3001

# Restart — gateway automatically routes /users to the new address
docker compose -f compose.microservices.yaml up --build
```

The `GET /services` endpoint shows the live registry so you can verify the config was applied:

```bash
curl http://localhost:3000/services
# Returns JSON with current service URLs and which env var controls each
```

### Static vs Dynamic Service Discovery

| Aspect | Static / Config-Based (Lab 7) | Dynamic (Consul, Eureka, K8s DNS) |
|---|---|---|
| **Service registration** | Manual — env vars set at deploy time | Automatic — services self-register on startup |
| **Location changes** | Requires gateway restart after env var edit | Gateway sees changes instantly (watch/poll/DNS TTL) |
| **Failure detection** | None — gateway tries and gets 503 | Health-check-aware; unhealthy instances removed automatically |
| **Scaling** | Single instance URL per service | Multiple instances; registry balances load |
| **Complexity** | Very low — just env vars | Significant — dedicated registry infrastructure |
| **Best for** | Labs, small stable deployments | Production microservices at scale |

**What dynamic discovery adds:** Automatic load balancing across multiple service instances, real-time health monitoring (dead instances removed from routing table), and zero-downtime re-deployment without gateway restarts.

---

## Part C — Cloud Deployment

### Platform: Render.com

Render supports Docker-based deployments on a free tier. Each microservice is deployed as an independent Docker web service.

### Deployment Steps

**1. Push code to GitHub**
```bash
git add .
git commit -m "Lab 7: API Gateway, Service Discovery, Cloud Deployment"
git push origin main
```

**2. Create services on Render**

Either use the `render.yaml` Blueprint (automatic), or manually:

| Service Name | Type | Source | Port |
|---|---|---|---|
| `campus-api-gateway` | Web Service | `microservices/api-gateway` | 10000 |
| `campus-user-service` | Web Service | `microservices/user-service` | 10000 |
| `campus-product-service` | Web Service | `microservices/product-service` | 10000 |
| `campus-order-service` | Web Service | `microservices/order-service` | 10000 |

**3. Set environment variables on Render dashboard**

For `campus-api-gateway`:
```
PORT=10000
USER_SERVICE_URL=https://campus-user-service.onrender.com
PRODUCT_SERVICE_URL=https://campus-product-service.onrender.com
ORDER_SERVICE_URL=https://campus-order-service.onrender.com
```

For `campus-order-service`:
```
PORT=10000
USER_SERVICE_URL=https://campus-user-service.onrender.com
PRODUCT_SERVICE_URL=https://campus-product-service.onrender.com
```

**4. Verify public gateway URL**
```bash
curl https://campus-api-gateway.onrender.com/health
```

**5. Re-run Postman tests against cloud URL**

Replace `localhost:3000` with your Render gateway URL in Postman Collection Variables.

### Local vs Cloud Environment Variables

| Variable | Local (Docker Compose) | Cloud (Render) |
|---|---|---|
| `USER_SERVICE_URL` | `http://user-service:3001` | `https://campus-user-service.onrender.com` |
| `PRODUCT_SERVICE_URL` | `http://product-service:3002` | `https://campus-product-service.onrender.com` |
| `ORDER_SERVICE_URL` | `http://order-service:3003` | `https://campus-order-service.onrender.com` |

> **No code changes between environments.** Only environment variables differ.

---

## Gateway API Reference

| Method | Path | Routes To | Description |
|---|---|---|---|
| GET | `/` | Gateway | Route map & registry info |
| GET | `/health` | Gateway | Gateway health check |
| GET | `/services` | Gateway | Live service registry (Lab 7 discovery endpoint) |
| GET | `/users` | User Service | List all users |
| GET | `/users/:id` | User Service | Get user by ID |
| POST | `/users` | User Service | Create new user |
| PUT | `/users/:id` | User Service | Update user |
| DELETE | `/users/:id` | User Service | Delete user |
| GET | `/products` | Product Service | List all courses/products |
| GET | `/products/:id` | Product Service | Get product by ID |
| POST | `/products` | Product Service | Create product |
| PUT | `/products/:id` | Product Service | Update product |
| DELETE | `/products/:id` | Product Service | Delete product |
| GET | `/orders` | Order Service | List all orders |
| GET | `/orders/:id` | Order Service | Get order by ID |
| POST | `/orders` | Order Service | Create order (validates user + product) |
| DELETE | `/orders/:id` | Order Service | Cancel order |

---

## Running the Stack

### Prerequisites
- Docker Desktop running

### Start All Services (Lab 7 configuration)

```bash
# From project root
docker compose -f compose.microservices.yaml up --build
```

### Verify

```bash
# Gateway health
curl http://localhost:3000/health

# Live service registry
curl http://localhost:3000/services

# Route through gateway (not direct to port 3001)
curl http://localhost:3000/users
curl http://localhost:3000/products
curl http://localhost:3000/orders

# 502/503 test: stop a service, then call through gateway
docker stop user-service
curl http://localhost:3000/users   # → 503 with clear error message
docker start user-service
```

### Run Test Suite

```bash
node microservices/test-microservices.js
```

---

## Written Reflection (Lab 7)

Introducing the API Gateway and cloud deployment fundamentally changed **how the system is used and operated**:

1. **Client simplicity:** The React and Android clients from Lab 4 now need only one base URL. Previously they would need to track three separate service addresses — impractical in production where IPs change.

2. **Security boundary:** Because the microservices' ports are no longer mapped in Docker Compose, it is literally impossible to bypass the gateway. Requests cannot sneak directly to the User Service on port 3001 from outside the Docker network. This is a real security improvement over Lab 6.

3. **Operational visibility:** Request logging in the gateway gives a single-pane view of all API traffic — method, path, target service, status code, and latency. In Lab 6, logs were scattered across three separate containers with no unified trace.

4. **Config-driven flexibility:** Moving service URLs into environment variables (service registry) meant the same gateway binary ran identically against local Docker hostnames (`http://user-service:3001`) and cloud URLs (`https://campus-user-service.onrender.com`) — zero code changes. This is the practical value of externalized configuration.

5. **Cloud reach:** The application is now reachable over the public internet, not just `localhost`. MongoDB Atlas was already cloud-hosted since Lab 4; deploying the gateway and services to Render completes the fully cloud-hosted stack — any client, anywhere, can use the system.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `503 Service Unavailable` via gateway | Target service container not running | `docker start <service-name>` or `docker compose up` |
| Gateway returns 404 for `/users` | Path prefix mismatch | Ensure `USER_SERVICE_URL` points to the correct host and the service is running |
| Render services cold-start slowly | Free tier spins down after 15 min inactivity | First request takes ~30s; subsequent requests are fast |
| CORS errors in browser | Missing CORS header | All services have `cors()` middleware; ensure gateway is the only public endpoint |
| `docker: Cannot connect` | Docker Desktop not running | Start Docker Desktop, then re-run compose |
