/**
 * Student Mongoose Model
 * Lab 4 - Database Integration with MongoDB Atlas
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Database constraint: email must be unique across all students
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        return ret;
      }
    }
  }
);

// Indexes
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ id: 1 }, { unique: true });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = Student;
