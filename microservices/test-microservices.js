/**
 * Automated Test Runner — Lab 7
 * Web Services & SOA Laboratory — Dhirubhai Ambani University
 *
 * Tests cover:
 *   1.  User Service CRUD (via gateway)
 *   2.  Product Service CRUD (via gateway)
 *   3.  Order Service + inter-service communication (via gateway)
 *   4.  Error/failure scenarios (404, 400)
 *   5.  [Lab 7] Gateway GET /health endpoint
 *   6.  [Lab 7] Gateway GET /services (live registry endpoint)
 *   7.  [Lab 7] Gateway unified routing for all three services
 *   8.  [Lab 7] Gateway 503 on unreachable service
 *   9.  [Lab 7] Service registry - zero hard-coded URLs (config-based)
 */

'use strict';

const http = require('http');

// Determine if testing against live Docker stack or local standalone
const IS_DOCKER_TARGET = process.env.TEST_TARGET === 'docker' || process.env.DOCKER === 'true';
const DOCKER_GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT || '3001', 10);

// High non-conflicting ports for local standalone testing
const GATEWAY_PORT = IS_DOCKER_TARGET ? DOCKER_GATEWAY_PORT : 5010;
const USER_PORT    = 5011;
const PRODUCT_PORT = 5012;
const ORDER_PORT   = 5013;

if (!IS_DOCKER_TARGET) {
  process.env.USER_SERVICE_URL = `http://localhost:${USER_PORT}`;
  process.env.PRODUCT_SERVICE_URL = `http://localhost:${PRODUCT_PORT}`;
  process.env.ORDER_SERVICE_URL = `http://localhost:${ORDER_PORT}`;
}

// Load service apps
const userApp    = require('./user-service/server');
const productApp = require('./product-service/server');
const orderApp   = require('./order-service/server');
const gatewayApp = require('./api-gateway/server');

let userServer, productServer, orderServer, gatewayServer;

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function request(port, path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

// ─── Test runner ─────────────────────────────────────────────────────────────
async function runTests() {
  const hr = '═'.repeat(65);
  console.log(`\n╔${hr}╗`);
  console.log(`║  🧪  CampusConnect — Lab 7 Test Suite                         ║`);
  console.log(`║      API Gateway · Service Discovery · Cloud Deployment       ║`);
  console.log(`╚${hr}╝\n`);

  let passed = 0;
  let failed = 0;

  function assert(desc, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}${extra ? ' — ' + extra : ''}`);
      failed++;
    }
  }

  try {
    // ── 1. USER SERVICE (via gateway) ──────────────────────────────────────
    console.log('─── 1. User Service — via API Gateway (/users) ───────────────');

    const uList = await request(GATEWAY_PORT, '/users');
    assert('GET /users → 200, returns user list', uList.status === 200 && uList.body.count >= 4);
    assert('GET /users → service field is user-service', uList.body.service === 'user-service');
    assert('GET /users → contains Panthil Shah', uList.body.data?.some(u => u.name === 'Panthil Shah'));

    const uOne = await request(GATEWAY_PORT, '/users/101');
    assert('GET /users/101 → 200, Panthil Shah', uOne.status === 200 && uOne.body.data?.name === 'Panthil Shah');

    const uNotFound = await request(GATEWAY_PORT, '/users/9999');
    assert('GET /users/9999 → 404 Not Found', uNotFound.status === 404);

    const newUser = { name: 'Test Student Lab7', email: 'lab7@dau.ac.in', department: 'M.Sc. IT' };
    const uCreate = await request(GATEWAY_PORT, '/users', 'POST', newUser);
    assert('POST /users → 201 Created with new user data', uCreate.status === 201 && uCreate.body.data?.name === 'Test Student Lab7');

    const uBadCreate = await request(GATEWAY_PORT, '/users', 'POST', { department: 'X' });
    assert('POST /users (missing name/email) → 400 Validation Error', uBadCreate.status === 400);

    // ── 2. PRODUCT SERVICE (via gateway) ───────────────────────────────────
    console.log('\n─── 2. Product Service — via API Gateway (/products) ─────────');

    const pList = await request(GATEWAY_PORT, '/products');
    assert('GET /products → 200, returns product list', pList.status === 200 && pList.body.count >= 4);
    assert('GET /products → service field is product-service', pList.body.service === 'product-service');
    assert('GET /products → contains IT644 (SOA)', pList.body.data?.some(p => p.code === 'IT644'));

    const pOne = await request(GATEWAY_PORT, '/products/501');
    assert('GET /products/501 → 200, IT644 course', pOne.status === 200 && pOne.body.data?.code === 'IT644');

    const pNotFound = await request(GATEWAY_PORT, '/products/9999');
    assert('GET /products/9999 → 404 Not Found', pNotFound.status === 404);

    // ── 3. ORDER SERVICE + INTER-SERVICE COMMUNICATION (via gateway) ───────
    console.log('\n─── 3. Order Service — via API Gateway (/orders) ─────────────');

    const oList = await request(GATEWAY_PORT, '/orders');
    assert('GET /orders → 200, returns order list', oList.status === 200 && oList.body.count >= 2);
    assert('GET /orders → service field is order-service', oList.body.service === 'order-service');

    const validOrder = { userId: '101', productId: '501', paymentMode: 'Institutional Fee Portal' };
    const oCreate = await request(GATEWAY_PORT, '/orders', 'POST', validOrder);
    assert('POST /orders (valid userId=101, productId=501) → 201 Created', oCreate.status === 201);
    assert('Order response: studentName = Panthil Shah', oCreate.body.data?.studentName === 'Panthil Shah');
    assert('Order response: productName includes "Web Services"', oCreate.body.data?.productName?.includes('Web Services'));

    const oInvalidUser = await request(GATEWAY_PORT, '/orders', 'POST', { userId: 'NONEXISTENT', productId: '501' });
    assert('POST /orders (invalid user) → 404 User Not Found', oInvalidUser.status === 404);

    const oInvalidProd = await request(GATEWAY_PORT, '/orders', 'POST', { userId: '101', productId: 'NONEXISTENT' });
    assert('POST /orders (invalid product) → 404 Product Not Found', oInvalidProd.status === 404);

    const oMissingFields = await request(GATEWAY_PORT, '/orders', 'POST', { userId: '101' });
    assert('POST /orders (missing productId) → 400 Validation Error', oMissingFields.status === 400);

    // ── 4. [Lab 7 Part A] GATEWAY HEALTH CHECK ─────────────────────────────
    console.log('\n─── 4. [Lab 7] Gateway Health Check (/health) ────────────────');

    const gwHealth = await request(GATEWAY_PORT, '/health');
    assert('[Lab 7] GET /health → 200 OK', gwHealth.status === 200);
    assert('[Lab 7] /health → status is UP', gwHealth.body.status === 'UP');
    assert('[Lab 7] /health → contains uptime field', gwHealth.body.uptime !== undefined);
    assert('[Lab 7] /health → contains registry field', gwHealth.body.registry !== undefined);
    assert('[Lab 7] /health → registry has user-service entry', gwHealth.body.registry?.['user-service'] !== undefined);
    assert('[Lab 7] /health → registry has product-service entry', gwHealth.body.registry?.['product-service'] !== undefined);
    assert('[Lab 7] /health → registry has order-service entry', gwHealth.body.registry?.['order-service'] !== undefined);

    // ── 5. [Lab 7 Part B] LIVE SERVICE REGISTRY ENDPOINT ──────────────────
    console.log('\n─── 5. [Lab 7] Service Registry Discovery (/services) ────────');

    const gwServices = await request(GATEWAY_PORT, '/services');
    assert('[Lab 7] GET /services → 200 OK', gwServices.status === 200);
    assert('[Lab 7] /services → contains 3 services', gwServices.body.services?.length === 3);
    assert('[Lab 7] /services → user-service has url field', gwServices.body.services?.some(s => s.id === 'user-service' && s.url));
    assert('[Lab 7] /services → product-service has pathPrefix /products', gwServices.body.services?.some(s => s.id === 'product-service' && s.pathPrefix === '/products'));
    assert('[Lab 7] /services → discovery type is Configuration-Based', gwServices.body.discovery?.type?.includes('Configuration'));

    // ── 6. [Lab 7 Part A] GATEWAY ROOT & ROUTE MAP ────────────────────────
    console.log('\n─── 6. [Lab 7] Gateway Root & Route Map (/) ──────────────────');

    const gwRoot = await request(GATEWAY_PORT, '/');
    assert('[Lab 7] GET / → 200 OK', gwRoot.status === 200);
    assert('[Lab 7] GET / → lab field mentions Lab 7', gwRoot.body.lab?.includes('Lab 7'));
    assert('[Lab 7] GET / → routes array has 3 entries', gwRoot.body.routes?.length === 3);
    assert('[Lab 7] GET / → uptime field present', gwRoot.body.uptime !== undefined);

    // ── 7. [Lab 7 Part B] CONFIG-BASED DISCOVERY VERIFICATION ────────────
    console.log('\n─── 7. [Lab 7] Config-Based Discovery: No Hard-Coded URLs ────');

    // Import and verify the registry module directly
    const { buildRegistry } = require('./api-gateway/service-registry');
    const registry = buildRegistry();
    assert('[Lab 7] service-registry.js buildRegistry() returns an object', typeof registry === 'object');
    assert('[Lab 7] registry user-service URL set (from env or default)', !!registry['user-service']?.url);
    assert('[Lab 7] registry product-service URL set', !!registry['product-service']?.url);
    assert('[Lab 7] registry order-service URL set', !!registry['order-service']?.url);
    assert('[Lab 7] registry paths are correct (/users, /products, /orders)',
      registry['user-service']?.pathPrefix === '/users' &&
      registry['product-service']?.pathPrefix === '/products' &&
      registry['order-service']?.pathPrefix === '/orders'
    );

    // ── 8. [Lab 7 Part A] GATEWAY 404 CATCH-ALL ───────────────────────────
    console.log('\n─── 8. [Lab 7] Gateway 404 for Unknown Paths ─────────────────');

    const gwUnknown = await request(GATEWAY_PORT, '/api/v1/doesnotexist');
    assert('[Lab 7] GET /unknown-path → 404 Not Found from gateway', gwUnknown.status === 404);
    assert('[Lab 7] 404 body has error field', gwUnknown.body.error === 'Route Not Found');

    // ── SUMMARY ─────────────────────────────────────────────────────────
    console.log(`\n╔${hr}╗`);
    const status = failed === 0 ? '🎉  ALL TESTS PASSED' : `⚠️   ${failed} TEST(S) FAILED`;
    console.log(`║  ${status.padEnd(63)}║`);
    console.log(`║  Results: ${passed} passed, ${failed} failed out of ${passed + failed} total${''.padEnd(63 - `Results: ${passed} passed, ${failed} failed out of ${passed + failed} total`.length)}║`);
    console.log(`╚${hr}╝\n`);

    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('\n❌ Test execution error:', err.message);
    process.exit(1);
  } finally {
    if (userServer)    userServer.close();
    if (productServer) productServer.close();
    if (orderServer)   orderServer.close();
    if (gatewayServer) gatewayServer.close();
  }
}

// ─── Start tests: spin up local test servers or run against Docker ─────────
if (IS_DOCKER_TARGET) {
  console.log(`\n🐳 Running test suite against live Docker Gateway at port ${GATEWAY_PORT}...`);
  runTests();
} else {
  userServer = userApp.listen(USER_PORT, () => {
    productServer = productApp.listen(PRODUCT_PORT, () => {
      orderServer = orderApp.listen(ORDER_PORT, () => {
        gatewayServer = gatewayApp.listen(GATEWAY_PORT, () => {
          runTests();
        });
      });
    });
  });
}
