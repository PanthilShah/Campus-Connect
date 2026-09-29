import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const COURSES = [
  'M.Sc. Information Technology',
  'M.Sc. Data Science',
  'M.Tech. Software Engineering',
  'B.Tech. Information & Communication Technology',
  'B.Tech. Mathematics & Computing',
  'B.Tech. Electronics & VLSI Engineering'
];

export default function StudentForm({ student, onClose, onSuccess }) {
  const isEdit = Boolean(student && student.id);

  const [formData, setFormData] = useState({
    id: student?.id || '',
    name: student?.name || '',
    email: student?.email || '',
    course: student?.course || COURSES[0],
    semester: student?.semester || 3
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side validation (Lab 4 requirement)
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. name@dau.ac.in).';
    }

    const sem = Number(formData.semester);
    if (!sem || isNaN(sem) || sem < 1 || sem > 8) {
      errs.semester = 'Semester must be between 1 and 8.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit ? API_ENDPOINTS.studentById(student.id) : API_ENDPOINTS.students;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        semester: Number(formData.semester)
      };
      if (!isEdit && !payload.id) {
        delete payload.id; // Allow server to auto-generate
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific HTTP Status Codes (Lab 4 Requirement 8)
        if (res.status === 400) {
          const detailMsg = data.details ? data.details.join(' ') : data.message || 'Validation failed.';
          setServerError(`HTTP 400 (Bad Request): ${detailMsg}`);
        } else if (res.status === 404) {
          setServerError(`HTTP 404 (Not Found): ${data.message || 'Student does not exist.'}`);
        } else {
          setServerError(`HTTP ${res.status}: ${data.message || 'Unable to save student.'}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      onSuccess(isEdit ? 'Student updated successfully.' : 'Student created successfully.');
      onClose();
    } catch (err) {
      setServerError(`Network Error: ${err.message}. Ensure the REST API server is running.`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? `Edit Student: ${student.id}` : 'Register New Student'}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="form-alert-error" role="alert">
                <strong>Error: </strong> {serverError}
              </div>
            )}

            {/* Student ID (Optional for new, read-only for edit) */}
            <div className="form-group">
              <label className="form-label">
                Student ID / Roll Number {isEdit && <span className="required">*</span>}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MScIT-25-005 (Leave blank for auto-assign)"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={isEdit}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                {isEdit ? 'ID is fixed and cannot be changed.' : 'Leave empty to auto-generate.'}
              </small>
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Panthil Shah"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
              {errors.name && <div className="form-field-error">{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                University Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="e.g. panthil.shah@dau.ac.in"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
              />
              {errors.email && <div className="form-field-error">{errors.email}</div>}
            </div>

            {/* Course */}
            <div className="form-group">
              <label className="form-label">
                Academic Program <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="form-group">
              <label className="form-label">
                Semester (1–8) <span className="required">*</span>
              </label>
              <select
                className={`form-select ${errors.semester ? 'has-error' : ''}`}
                value={formData.semester}
                onChange={(e) => {
                  setFormData({ ...formData, semester: Number(e.target.value) });
                  if (errors.semester) setErrors({ ...errors, semester: null });
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              {errors.semester && <div className="form-field-error">{errors.semester}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Record'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
