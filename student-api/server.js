/**
 * CampusConnect - Student Management REST API Server
 * Lab 4 - Full-Stack Client & Database Integration
 * Institution: Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { connectDB, getIsConnected } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
// Enable CORS for React web client (localhost:5173 / localhost:3000) and any other origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ---- Swagger UI & OpenAPI Spec ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { background-color: #1e3a8a; }',
  customSiteTitle: 'CampusConnect - Student REST API Docs'
}));

app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// ---- Root Welcome / Health Discovery Endpoint ----
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'CampusConnect Student Management Web Service',
    institution: 'Dhirubhai Ambani University (formerly DA-IICT)',
    course: 'Web Services & SOA (Lab 4: Full-Stack Integration)',
    version: '2.0.0',
    database: getIsConnected() ? 'MongoDB Atlas (Connected)' : 'In-Memory Store (Active Fallback)',
    endpoints: {
      swaggerUI: `http://localhost:${PORT}/api-docs`,
      openApiSpec: `http://localhost:${PORT}/openapi.json`,
      students: `http://localhost:${PORT}/students`,
      getStudentById: `http://localhost:${PORT}/students/:id`
    },
    clientsSupported: ['React Web Client', 'Android Mobile Client', 'Postman'],
    methodsSupported: ['GET', 'POST', 'PUT', 'DELETE'],
    status: 'Running'
  });
});

// ---- Mount Resource Routes ----
app.use('/students', studentRoutes);

// ---- 404 Handler for Unmatched Routes ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Please check the API documentation at /api-docs.`
  });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// ---- Start Server if run directly ----
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n=============================================================`);
      console.log(`🚀 CampusConnect Student REST API (Lab 4) is LIVE!`);
      console.log(`📡 Server URL:         http://localhost:${PORT}`);
      console.log(`📚 Swagger UI Docs:    http://localhost:${PORT}/api-docs`);
      console.log(`📋 Students Endpoint:  http://localhost:${PORT}/students`);
      console.log(`💾 Database Mode:      ${getIsConnected() ? 'MongoDB Atlas' : 'In-Memory Fallback'}`);
      console.log(`=============================================================\n`);
    });
  });
}

module.exports = app;
