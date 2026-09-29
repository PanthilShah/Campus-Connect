import React, { useState, useMemo } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function StudentList({
  students,
  isLoading,
  error,
  onEditStudent,
  onDeleteSuccess,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  // Filter students based on search query & semester
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        s.course.toLowerCase().includes(q);

      const matchesSem =
        semesterFilter === 'all' || String(s.semester) === String(semesterFilter);

      return matchesSearch && matchesSem;
    });
  }, [students, searchTerm, semesterFilter]);

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student '${student.name}' (${student.id})?`)) {
      return;
    }

    setDeletingId(student.id);

    try {
      const res = await fetch(API_ENDPOINTS.studentById(student.id), {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to delete: ${data.message || 'Error occurred'}`);
        setDeletingId(null);
        return;
      }

      onDeleteSuccess(`Student '${student.name}' successfully deleted.`);
    } catch (err) {
      alert(`Network error while deleting: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {/* Controls Bar: Search & Filter */}
      <div className="controls-bar">
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, ID, email or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </div>
      </div>

      {/* Main Table Card */}
      <div className="data-card">
        {isLoading ? (
          <div className="state-container">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Fetching students from REST API...
            </p>
          </div>
        ) : error ? (
          <div className="state-container">
            <svg width="40" height="40" fill="none" stroke="var(--accent-ruby)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Unable to Load Students</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 400 }}>
              {error}
            </p>
            <button className="btn btn-secondary" onClick={onRefresh} style={{ marginTop: 8 }}>
              Retry Request
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="state-container">
            <svg width="40" height="40" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No Students Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              {searchTerm || semesterFilter !== 'all'
                ? 'No records match your active filter criteria.'
                : 'No students currently registered in the database.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Roll / ID</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id || s._id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar-mini">{getInitials(s.name)}</div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                            {s.name}
                          </strong>
                          {s.name === 'Panthil Shah' && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700 }}>
                              Current User
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="student-id-badge">{s.id}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        {s.email}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem' }}>{s.course}</span>
                    </td>
                    <td>
                      <span className="sem-badge">Sem {s.semester}</span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn btn-edit"
                          onClick={() => onEditStudent(s)}
                          title="Edit Student"
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn btn-delete"
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id}
                          title="Delete Student"
                        >
                          {deletingId === s.id ? (
                            <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                          ) : (
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
