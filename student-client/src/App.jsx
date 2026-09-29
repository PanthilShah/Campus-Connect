import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import { API_ENDPOINTS, API_BASE_URL } from './config/api';

export default function App() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isApiOnline, setIsApiOnline] = useState(true);

  const [modalState, setModalState] = useState({
    isOpen: false,
    student: null
  });

  const [toast, setToast] = useState(null);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dau_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dau_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all students (GET /students)
  const fetchStudents = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch(API_ENDPOINTS.students);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setStudents(data.data || []);
      setIsApiOnline(true);
    } catch (err) {
      setError(`Failed to connect to REST API at ${API_BASE_URL}. ${err.message}`);
      setIsApiOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Compute summary stats
  const uniqueCourses = new Set(students.map((s) => s.course)).size;
  const pgStudents = students.filter((s) => s.course.startsWith('M.')).length;

  return (
    <div className="app-container">
      <Header
        isApiOnline={isApiOnline}
        theme={theme}
        toggleTheme={toggleTheme}
        onAddStudent={() => setModalState({ isOpen: true, student: null })}
        onRefresh={() => fetchStudents(true)}
        isRefreshing={isRefreshing}
      />

      <main className="main-content">
        {/* Hero Stats Banner */}
        <section className="stats-hero">
          <div className="stat-item">
            <span className="stat-label">Total Registered</span>
            <div className="stat-value">{students.length}</div>
            <span className="stat-sub">Enrolled Students in Registry</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Postgraduate Cohort</span>
            <div className="stat-value">{pgStudents}</div>
            <span className="stat-sub">M.Sc. & M.Tech Programs</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Programs</span>
            <div className="stat-value">{uniqueCourses}</div>
            <span className="stat-sub">Degree Courses Represented</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">REST API Service</span>
            <div className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
              {isApiOnline ? 'Connected' : 'Unavailable'}
            </div>
            <span className="stat-sub">{API_BASE_URL}</span>
          </div>
        </section>

        {/* Student CRUD List Component */}
        <StudentList
          students={students}
          isLoading={isLoading}
          error={error}
          onEditStudent={(student) => setModalState({ isOpen: true, student })}
          onDeleteSuccess={(msg) => {
            showToast(msg, 'success');
            fetchStudents(true);
          }}
          onRefresh={() => fetchStudents(false)}
        />
      </main>

      {/* Modal Dialog for Add / Edit */}
      {modalState.isOpen && (
        <StudentForm
          student={modalState.student}
          onClose={() => setModalState({ isOpen: false, student: null })}
          onSuccess={(msg) => {
            showToast(msg, 'success');
            fetchStudents(true);
          }}
        />
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <svg width="18" height="18" fill="none" stroke="var(--accent-emerald)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="var(--accent-ruby)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>
          &copy; 2026 <strong>Dhirubhai Ambani University</strong> &bull; Web Services &amp; SOA Laboratory &bull; Lab 4: Multi-Client Integration
        </p>
      </footer>
    </div>
  );
}
