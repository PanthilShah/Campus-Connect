/**
 * Order (Course Enrollment) Service - Microservice
 * Port: 3003
 * Demonstrates Service-to-Service Communication across Docker Network
 * Web Services & SOA Laboratory - Lab 6
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 */

const express = require('express');
const cors = require('cors');
const { MetricsCollector } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3003;
const metrics = new MetricsCollector('order-service');

// Configurable Service URLs (Lab 6 Requirement 12 & Lab 8 K8s DNS)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

app.use(cors());
app.use(express.json());
app.use(metrics.middleware());

// In-Memory Database owned exclusively by Order Service (Database per service)
let orders = [
  {
    id: "ORD-9001",
    userId: "101",
    studentName: "Panthil Shah",
    productId: "501",
    productCode: "IT644",
    productName: "Web Services & Service-Oriented Architecture",
    amount: 45000,
    semester: 3,
    status: "Confirmed",
    paymentMode: "Online Institutional Portal",
    createdAt: new Date("2026-08-05T10:00:00.000Z").toISOString()
  },
  {
    id: "ORD-9002",
    userId: "101",
    studentName: "Panthil Shah",
    productId: "502",
    productCode: "IT622",
    productName: "Cloud Computing & Containerization",
    amount: 45000,
    semester: 3,
    status: "Confirmed",
    paymentMode: "Online Institutional Portal",
    createdAt: new Date("2026-08-05T10:15:00.000Z").toISOString()
  }
];

let nextOrderSeq = 9003;

// Helper: Fetch with timeout and error handling for Inter-Service Communication
async function fetchService(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    clearTimeout(id);
    return { ok: false, status: 503, error: err.message };
  }
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'order-service',
    port: PORT,
    dependencies: {
      userService: USER_SERVICE_URL,
      productService: PRODUCT_SERVICE_URL
    },
    timestamp: new Date().toISOString()
  });
});

// Prometheus Metrics (Lab 8 Part C)
app.get('/metrics', metrics.metricsHandler());

// GET /orders - List all orders
app.get('/orders', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'order-service',
    count: orders.length,
    data: orders
  });
});

// GET /orders/:id - Get order by ID
app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return res.status(404).json({
      success: false,
      service: 'order-service',
      error: 'Not Found',
      message: `Order with ID '${id}' was not found.`
    });
  }

  res.status(200).json({
    success: true,
    service: 'order-service',
    data: order
  });
});

// POST /orders - Create order with Inter-Service Dependency Validation (Lab 6 Core Requirement)
app.post('/orders', async (req, res) => {
  const { userId, productId, paymentMode } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      success: false,
      service: 'order-service',
      error: 'Validation Error',
      message: 'Both userId and productId are required to create an order.'
    });
  }

  console.log(`\n[Order Service] Validating order creation: User=${userId}, Product=${productId}`);

  // Step 1: Inter-Service Call -> User Service
  const userUrl = `${USER_SERVICE_URL}/users/${userId}`;
  console.log(`[Order Service] -> Calling User Service: GET ${userUrl}`);
  const userResult = await fetchService(userUrl);

  if (userResult.status === 503) {
    return res.status(503).json({
      success: false,
      service: 'order-service',
      error: 'Service Unavailable',
      message: `User Service at '${USER_SERVICE_URL}' is currently unreachable or down.`,
      targetService: 'user-service'
    });
  }

  if (userResult.status === 404 || !userResult.ok) {
    return res.status(404).json({
      success: false,
      service: 'order-service',
      error: 'User Not Found',
      message: `Cannot create order: User with ID '${userId}' does not exist in User Service.`
    });
  }

  const user = userResult.data.data;

  // Step 2: Inter-Service Call -> Product Service
  const productUrl = `${PRODUCT_SERVICE_URL}/products/${productId}`;
  console.log(`[Order Service] -> Calling Product Service: GET ${productUrl}`);
  const productResult = await fetchService(productUrl);

  if (productResult.status === 503) {
    return res.status(503).json({
      success: false,
      service: 'order-service',
      error: 'Service Unavailable',
      message: `Product Service at '${PRODUCT_SERVICE_URL}' is currently unreachable or down.`,
      targetService: 'product-service'
    });
  }

  if (productResult.status === 404 || !productResult.ok) {
    return res.status(404).json({
      success: false,
      service: 'order-service',
      error: 'Product Not Found',
      message: `Cannot create order: Product/Course with ID '${productId}' does not exist in Product Service.`
    });
  }

  const product = productResult.data.data;

  // Step 3: Create Order Record
  const newOrder = {
    id: `ORD-${nextOrderSeq++}`,
    userId: user.id,
    studentId: user.studentId,
    studentName: user.name,
    studentEmail: user.email,
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    amount: product.fee || 45000,
    semester: user.department?.includes('IT') ? 3 : 1,
    status: 'Confirmed',
    paymentMode: paymentMode || 'Online Fee Portal',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);

  console.log(`✅ [Order Service] Order created successfully: ${newOrder.id}\n`);

  res.status(201).json({
    success: true,
    service: 'order-service',
    message: 'Order placed and verified through microservice collaboration.',
    data: newOrder
  });
});

// DELETE /orders/:id - Cancel order
app.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      service: 'order-service',
      error: 'Not Found',
      message: `Cannot cancel. Order with ID '${id}' was not found.`
    });
  }

  const removed = orders.splice(idx, 1);
  res.status(200).json({
    success: true,
    service: 'order-service',
    message: `Order '${id}' cancelled.`,
    deleted: removed[0]
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
    console.log(`   Connected to User Service:    ${USER_SERVICE_URL}`);
    console.log(`   Connected to Product Service: ${PRODUCT_SERVICE_URL}`);
  });
}

module.exports = app;
