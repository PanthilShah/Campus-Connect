/**
 * Student Resource REST Routes (MongoDB Atlas & Fallback Store)
 * Lab 4 - Web Services & SOA Laboratory
 */

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const studentStore = require('../data/studentsStore');
const { getIsConnected } = require('../config/db');
const validateStudent = require('../middleware/validateStudent');

// 1. GET /students - List all students
router.get('/', async (req, res) => {
  try {
    if (getIsConnected()) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        source: 'MongoDB Atlas',
        count: students.length,
        data: students
      });
    }

    // In-memory fallback
    const students = studentStore.getAll();
    res.status(200).json({
      success: true,
      source: 'In-Memory Store',
      count: students.length,
      data: students
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// 2. GET /students/:id - Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const student = await Student.findOne({ id: new RegExp(`^${id}$`, 'i') });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Student with ID '${id}' was not found in the database.`
        });
      }
      return res.status(200).json({
        success: true,
        source: 'MongoDB Atlas',
        data: student
      });
    }

    // In-memory fallback
    const student = studentStore.getById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Student with ID '${id}' was not found in the registry.`
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// 3. POST /students - Create new student
router.post('/', validateStudent, async (req, res) => {
  try {
    if (getIsConnected()) {
      // Check duplicate ID
      if (req.body.id) {
        const existingId = await Student.findOne({ id: req.body.id });
        if (existingId) {
          return res.status(400).json({
            success: false,
            error: 'Duplicate ID',
            message: `Student with ID '${req.body.id}' already exists in database.`
          });
        }
      } else {
        // Generate roll number
        const count = await Student.countDocuments();
        req.body.id = `MScIT-25-00${count + 5}`;
      }

      // Check unique email constraint
      const existingEmail = await Student.findOne({ email: req.body.email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate Email',
          message: `Email '${req.body.email}' is already registered with student '${existingEmail.name}' (${existingEmail.id}).`
        });
      }

      const newStudent = new Student(req.body);
      const saved = await newStudent.save();

      return res.status(201).json({
        success: true,
        message: 'Student record created successfully in MongoDB Atlas.',
        data: saved
      });
    }

    // In-memory fallback
    if (req.body.id) {
      const existing = studentStore.getById(req.body.id);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate ID',
          message: `Student with ID '${req.body.id}' already exists.`
        });
      }
    }

    const createdStudent = studentStore.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: createdStudent
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate Key Constraint',
        message: 'A student with this unique identifier or email already exists in MongoDB.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// 4. PUT /students/:id - Update existing student
router.put('/:id', validateStudent, async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const existing = await Student.findOne({ id: new RegExp(`^${id}$`, 'i') });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Cannot update. Student with ID '${id}' does not exist in MongoDB.`
        });
      }

      existing.name = req.body.name;
      existing.email = req.body.email;
      existing.course = req.body.course;
      existing.semester = req.body.semester;
      existing.updatedAt = new Date();

      const updated = await existing.save();

      return res.status(200).json({
        success: true,
        message: `Student '${id}' updated successfully in MongoDB Atlas.`,
        data: updated
      });
    }

    // In-memory fallback
    const existing = studentStore.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot update. Student with ID '${id}' does not exist.`
      });
    }

    const updated = studentStore.update(id, req.body);
    res.status(200).json({
      success: true,
      message: `Student '${id}' updated successfully.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// 5. DELETE /students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const deleted = await Student.findOneAndDelete({ id: new RegExp(`^${id}$`, 'i') });
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Cannot delete. Student with ID '${id}' was not found in MongoDB.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Student record '${id}' successfully removed from MongoDB Atlas.`,
        deleted: deleted
      });
    }

    // In-memory fallback
    const deleted = studentStore.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot delete. Student with ID '${id}' was not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Student record '${id}' successfully removed.`,
      deleted: deleted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

module.exports = router;
