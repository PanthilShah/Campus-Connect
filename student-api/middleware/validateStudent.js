/**
 * Validation Middleware for Student Resources
 * Lab 3 - Web Services & SOA Laboratory
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(req, res, next) {
  const { name, email, course, semester } = req.body;
  const errors = [];

  // Validate Name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and cannot be empty.');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }

  // Validate Email
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Invalid email format. Must be a valid email address (e.g., student@dau.ac.in).');
  }

  // Validate Course
  if (!course || typeof course !== 'string' || course.trim().length === 0) {
    errors.push('Course is required and cannot be empty.');
  }

  // Validate Semester
  const semNum = Number(semester);
  if (semester === undefined || semester === null || isNaN(semNum)) {
    errors.push('Semester is required and must be a number.');
  } else if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
    errors.push('Semester must be an integer between 1 and 8.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      status: 400,
      details: errors
    });
  }

  // Sanitize and attach normalized values
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.course = course.trim();
  req.body.semester = semNum;

  next();
}

module.exports = validateStudent;
