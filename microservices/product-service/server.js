/**
 * Product (Course/Service) Service - Microservice
 * Port: 3002
 * Web Services & SOA Laboratory - Lab 6
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 */

const express = require('express');
const cors = require('cors');
const { MetricsCollector } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3002;
const metrics = new MetricsCollector('product-service');

app.use(cors());
app.use(express.json());
app.use(metrics.middleware());

// In-Memory Database owned exclusively by Product Service (Database per service)
let products = [
  {
    id: "501",
    code: "IT644",
    name: "Web Services & Service-Oriented Architecture",
    category: "Core Academic Course",
    credits: 4,
    fee: 45000,
    seatsAvailable: 25,
    instructor: "Faculty of IT",
    status: "Available"
  },
  {
    id: "502",
    code: "IT622",
    name: "Cloud Computing & Containerization",
    category: "Elective Course",
    credits: 4,
    fee: 45000,
    seatsAvailable: 30,
    instructor: "Faculty of Cloud Systems",
    status: "Available"
  },
  {
    id: "503",
    code: "IT631",
    name: "Database Management & NoSQL Systems",
    category: "Core Academic Course",
    credits: 4,
    fee: 45000,
    seatsAvailable: 15,
    instructor: "Faculty of Data Engineering",
    status: "Available"
  },
  {
    id: "504",
    code: "IT645",
    name: "Web & Mobile Application Development",
    category: "Elective Course",
    credits: 4,
    fee: 45000,
    seatsAvailable: 20,
    instructor: "Faculty of Software Engineering",
    status: "Available"
  }
];

let nextId = 505;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'product-service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Prometheus Metrics (Lab 8 Part C)
app.get('/metrics', metrics.metricsHandler());

// GET /products - List all products
app.get('/products', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'product-service',
    count: products.length,
    data: products
  });
});

// GET /products/:id - Get product by ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

  if (!product) {
    return res.status(404).json({
      success: false,
      service: 'product-service',
      error: 'Not Found',
      message: `Product/Course with ID '${id}' was not found.`
    });
  }

  res.status(200).json({
    success: true,
    service: 'product-service',
    data: product
  });
});

// POST /products - Create new product
app.post('/products', (req, res) => {
  const { name, code, credits, fee } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      success: false,
      service: 'product-service',
      error: 'Validation Error',
      message: 'Product name and course code are required.'
    });
  }

  const newProduct = {
    id: String(nextId++),
    code: code.toUpperCase().trim(),
    name: name.trim(),
    category: req.body.category || 'Academic Course',
    credits: Number(credits) || 4,
    fee: Number(fee) || 45000,
    seatsAvailable: Number(req.body.seatsAvailable) || 30,
    instructor: req.body.instructor || 'DAU Faculty',
    status: 'Available',
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    service: 'product-service',
    message: 'Course product created successfully.',
    data: newProduct
  });
});

// PUT /products/:id - Update product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      service: 'product-service',
      error: 'Not Found',
      message: `Cannot update. Product with ID '${id}' was not found.`
    });
  }

  products[idx] = {
    ...products[idx],
    ...req.body,
    id: products[idx].id,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    service: 'product-service',
    message: `Product '${id}' updated successfully.`,
    data: products[idx]
  });
});

// DELETE /products/:id - Delete product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      service: 'product-service',
      error: 'Not Found',
      message: `Cannot delete. Product with ID '${id}' was not found.`
    });
  }

  const deleted = products.splice(idx, 1);
  res.status(200).json({
    success: true,
    service: 'product-service',
    message: `Product '${id}' removed.`,
    deleted: deleted[0]
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📦 Product Service running on port ${PORT}`);
  });
}

module.exports = app;
