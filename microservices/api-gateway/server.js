/**
 * CampusConnect API Gateway - Lab 7
 * Web Services & SOA Laboratory
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 *
 * Lab 7 Requirements Implemented:
 *   [Part A] Single entry point for all clients; no business logic in gateway
 *   [Part A] Route /users -> User Service, /products -> Product Service, /orders -> Order Service
 *   [Part A] GET /health  - gateway health check
 *   [Part A] Request logging: method, path, target service, response status, duration
 *   [Part A] Centralized 502/503 error handling for unreachable services
 *   [Part B] Service registry (service-registry.js) externalizes all service URLs
 *   [Part B] No hard-coded service URLs in routing code - all from registry
 *   [Part B] GET /services - lists the live registry so config changes are visible
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const { buildRegistry } = require('./service-registry');
const { MetricsCollector } = require('./metrics');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Metrics Collector (Lab 8 Part C) ────────────────────────────────────────
const metrics = new MetricsCollector('api-gateway');

// ─── Build service registry at startup (reads env vars) ─────────────────────
const REGISTRY = buildRegistry();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(metrics.middleware());

/**
 * Request Logging Middleware (Lab 7 Part A requirement)
 * Logs: timestamp | method | path | target service | status | duration
 */
app.use((req, _res, next) => {
  req._startAt = Date.now();
  next();
});

// ─── Helper: resolve which registry entry handles a request path ─────────────
function resolveService(pathname) {
  return Object.values(REGISTRY).find(svc =>
    pathname.startsWith(svc.pathPrefix)
  ) || null;
}

// ─── Helper: log a completed proxy request ───────────────────────────────────
function logRequest(req, status, targetName) {
  const duration = Date.now() - (req._startAt || Date.now());
  const ts = new Date().toISOString();
  console.log(
    `[${ts}] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(40)} ` +
    `-> ${(targetName || 'GATEWAY').padEnd(20)} | ${status} | ${duration}ms`
  );
}

/**
 * Core proxy function - forwards a request to the resolved microservice.
 * Returns 502 if the response from the service is an error;
 * Returns 503 if the service is completely unreachable (network/DNS failure).
 */
async function proxyRequest(serviceEntry, req, res) {
  const targetUrl = `${serviceEntry.url}${req.originalUrl}`;

  const options = {
    method:  req.method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (['POST', 'PUT', 'PATCH'].includes(req.method) && Object.keys(req.body || {}).length > 0) {
    options.body = JSON.stringify(req.body);
  }

  try {
    const serviceRes = await fetch(targetUrl, options);
    const data = await serviceRes.json().catch(() => null);

    const status = serviceRes.status;
    logRequest(req, status, serviceEntry.name);
    return res.status(status).json(data || { success: serviceRes.ok });

  } catch (err) {
    // Network-level failure: service is unreachable
    logRequest(req, 503, serviceEntry.name);
    return res.status(503).json({
      success:   false,
      gateway:   'CampusConnect API Gateway',
      error:     'Service Unavailable',
      service:   serviceEntry.name,
      target:    serviceEntry.url,
      message:   `The ${serviceEntry.name} is currently unreachable. Please try again later.`,
      hint:      `Verify that '${serviceEntry.name}' container is running.`,
      timestamp: new Date().toISOString(),
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════

// ── GET / ─ Gateway Info & Route Map ────────────────────────────────────────
app.get('/', (req, res) => {
  logRequest(req, 200, 'GATEWAY');
  res.status(200).json({
    gateway:      'CampusConnect API Gateway',
    lab:          'Lab 7 & Lab 8 - API Gateway, Service Discovery, Kubernetes & Prometheus Monitoring',
    architecture: 'Microservices with Kubernetes / Config-Based Service Discovery & Prometheus Monitoring',
    institution:  'Dhirubhai Ambani University (formerly DA-IICT)',
    version:      '2.0.0',
    uptime:       `${Math.floor(process.uptime())}s`,
    routes: Object.values(REGISTRY).map(svc => ({
      prefix:  svc.pathPrefix,
      service: svc.name,
      target:  svc.url,
    })),
    endpoints: {
      health:   'GET /health',
      services: 'GET /services',
      metrics:  'GET /metrics',
      users:    '/users, /users/:id',
      products: '/products, /products/:id',
      orders:   '/orders, /orders/:id',
    },
  });
});

// ── GET /health ─ Gateway Health Check (Lab 7 Part A requirement) ────────────
app.get('/health', (req, res) => {
  logRequest(req, 200, 'GATEWAY');
  res.status(200).json({
    status:    'UP',
    gateway:   'CampusConnect API Gateway',
    version:   '2.0.0',
    port:      PORT,
    uptime:    `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    registry: Object.entries(REGISTRY).reduce((acc, [key, svc]) => {
      acc[key] = { url: svc.url, pathPrefix: svc.pathPrefix };
      return acc;
    }, {}),
    note: 'Gateway is healthy. Individual service health: GET /users/health, /products/health, /orders/health',
  });
});

// ── GET /services ─ Live Service Registry (Lab 7 Part B - prove config works) ─
app.get('/services', (req, res) => {
  logRequest(req, 200, 'GATEWAY');
  res.status(200).json({
    success:     true,
    gateway:     'CampusConnect API Gateway',
    description: 'Live service registry - URLs sourced from environment variables (config-based service discovery)',
    timestamp:   new Date().toISOString(),
    services:    Object.entries(REGISTRY).map(([key, svc]) => ({
      id:          key,
      name:        svc.name,
      url:         svc.url,
      pathPrefix:  svc.pathPrefix,
      description: svc.description,
      version:     svc.version,
      envVar: {
        'user-service':    'USER_SERVICE_URL',
        'product-service': 'PRODUCT_SERVICE_URL',
        'order-service':   'ORDER_SERVICE_URL',
      }[key],
    })),
    discovery: {
      type: 'Configuration-Based (Static)',
      note: 'Service URLs are read from environment variables at gateway startup. ' +
            'Change the env var, restart the gateway - no code change needed.',
    },
  });
});

// ── GET /metrics ─ Prometheus Metrics (Lab 8 Part C) ─────────────────────────
app.get('/metrics', (req, res) => {
  logRequest(req, 200, 'GATEWAY');
  metrics.metricsHandler()(req, res);
});

// ── Route /users -> User Service ─────────────────────────────────────────────
app.use('/users', (req, res) => {
  const svc = resolveService(req.originalUrl);
  proxyRequest(svc || REGISTRY['user-service'], req, res);
});

// ── Route /products -> Product Service ───────────────────────────────────────
app.use('/products', (req, res) => {
  const svc = resolveService(req.originalUrl);
  proxyRequest(svc || REGISTRY['product-service'], req, res);
});

// ── Route /orders -> Order Service ───────────────────────────────────────────
app.use('/orders', (req, res) => {
  const svc = resolveService(req.originalUrl);
  proxyRequest(svc || REGISTRY['order-service'], req, res);
});

// ── 404 Catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  logRequest(req, 404, 'GATEWAY');
  res.status(404).json({
    success: false,
    gateway: 'CampusConnect API Gateway',
    error:   'Route Not Found',
    path:    req.originalUrl,
    message: 'No route matched. Available prefixes: /users, /products, /orders',
    hint:    'Visit GET / for the full route map.',
  });
});

// ─── Server startup ──────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║       CampusConnect API Gateway  v2.0  (Lab 7)          ║');
    console.log('║  Dhirubhai Ambani University — WS & SOA Laboratory      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n🌐  Gateway listening on port ${PORT}`);
    console.log(`📋  Service Registry (loaded from env vars):`);
    Object.values(REGISTRY).forEach(svc => {
      console.log(`    ${svc.pathPrefix.padEnd(12)} -> ${svc.url}  [${svc.name}]`);
    });
    console.log(`\n✅  Health check  : GET http://localhost:${PORT}/health`);
    console.log(`🔍  Live registry : GET http://localhost:${PORT}/services`);
    console.log('─'.repeat(62) + '\n');
  });
}

module.exports = app;
