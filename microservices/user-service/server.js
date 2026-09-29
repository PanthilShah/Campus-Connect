/**
 * User Service - Microservice
 * Port: 3001
 * Web Services & SOA Laboratory - Lab 6
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 */

const express = require('express');
const cors = require('cors');
const { MetricsCollector } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3001;
const metrics = new MetricsCollector('user-service');

app.use(cors());
app.use(express.json());
app.use(metrics.middleware());

// In-Memory Database owned exclusively by User Service (Database per service)
let users = [
  {
    id: "101",
    studentId: "MScIT-25-001",
    name: "Panthil Shah",
    email: "panthil.shah@dau.ac.in",
    role: "Student",
    department: "M.Sc. Information Technology",
    status: "Active"
  },
  {
    id: "102",
    studentId: "MScIT-25-002",
    name: "Rhea Deshmukh",
    email: "rhea.deshmukh@dau.ac.in",
    role: "Student",
    department: "M.Sc. Information Technology",
    status: "Active"
  },
  {
    id: "103",
    studentId: "MScIT-25-003",
    name: "Siddharth Mehta",
    email: "siddharth.mehta@dau.ac.in",
    role: "Student",
    department: "M.Sc. Information Technology",
    status: "Active"
  },
  {
    id: "104",
    studentId: "BTech-23-142",
    name: "Ananya Joshi",
    email: "ananya.joshi@dau.ac.in",
    role: "Student",
    department: "B.Tech. ICT",
    status: "Active"
  }
];

let nextId = 105;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Prometheus Metrics (Lab 8 Part C)
app.get('/metrics', metrics.metricsHandler());

// GET /users - List all users
app.get('/users', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'user-service',
    count: users.length,
    data: users
  });
});

// GET /users/:id - Get user by ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id || u.studentId.toLowerCase() === id.toLowerCase());

  if (!user) {
    return res.status(404).json({
      success: false,
      service: 'user-service',
      error: 'Not Found',
      message: `User with ID '${id}' was not found.`
    });
  }

  res.status(200).json({
    success: true,
    service: 'user-service',
    data: user
  });
});

// POST /users - Create new user
app.post('/users', (req, res) => {
  const { name, email, department, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      service: 'user-service',
      error: 'Validation Error',
      message: 'Name and email are required fields.'
    });
  }

  const newUser = {
    id: String(nextId++),
    studentId: req.body.studentId || `MScIT-25-00${users.length + 1}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || 'Student',
    department: department || 'M.Sc. Information Technology',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    service: 'user-service',
    message: 'User record created successfully.',
    data: newUser
  });
});

// PUT /users/:id - Update user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const idx = users.findIndex(u => u.id === id || u.studentId.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      service: 'user-service',
      error: 'Not Found',
      message: `Cannot update. User with ID '${id}' was not found.`
    });
  }

  users[idx] = {
    ...users[idx],
    ...req.body,
    id: users[idx].id, // Prevent overwriting primary ID
    studentId: users[idx].studentId,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    service: 'user-service',
    message: `User '${id}' updated successfully.`,
    data: users[idx]
  });
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const idx = users.findIndex(u => u.id === id || u.studentId.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      service: 'user-service',
      error: 'Not Found',
      message: `Cannot delete. User with ID '${id}' was not found.`
    });
  }

  const deleted = users.splice(idx, 1);
  res.status(200).json({
    success: true,
    service: 'user-service',
    message: `User '${id}' removed.`,
    deleted: deleted[0]
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`👤 User Service running on port ${PORT}`);
  });
}

module.exports = app;
