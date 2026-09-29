import React from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export default function Header({ isApiOnline, theme, toggleTheme, onAddStudent, onRefresh, isRefreshing }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-crest">
            <svg style={{ width: 22, height: 22 }} viewBox="0 0 32 32" fill="none">
              <polygon points="16,3 29,26 3,26" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <polygon points="16,8 24,23 8,23" fill="#3b82f6" opacity="0.9" />
            </svg>
          </div>
          <div className="brand-title-wrap">
            <h1>Campus<span>Connect</span></h1>
            <div className="brand-tagline">DAU Student Registry &bull; React CRUD Client</div>
          </div>
        </div>

        <div className="header-actions">
          {/* API Status Badge */}
          <div className="api-status-badge" title={`Connected to ${API_BASE_URL}`}>
            <span className={`status-dot ${isApiOnline ? '' : 'disconnected'}`} />
            <span>{isApiOnline ? 'REST API Online' : 'API Offline'}</span>
          </div>

          {/* Swagger link */}
          <a
            href={API_ENDPOINTS.apiDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="action-icon-btn"
            title="Open Swagger API Docs"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>

          {/* Refresh Button */}
          <button
            className="action-icon-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh from REST API"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Add Student Primary Action */}
          <button className="btn btn-primary" onClick={onAddStudent}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Register Student</span>
          </button>
        </div>
      </div>
    </header>
  );
}
