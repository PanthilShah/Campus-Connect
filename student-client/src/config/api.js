/**
 * API Configuration & Centralized Endpoints
 * Lab 4 - Multi-Client SOA Integration
 * Institution: Dhirubhai Ambani University (formerly DA-IICT)
 */

// Single centralized Base URL as required by Lab 4 specification
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  students: `${API_BASE_URL}/students`,
  studentById: (id) => `${API_BASE_URL}/students/${id}`,
  apiDocs: `${API_BASE_URL}/api-docs`,
  health: `${API_BASE_URL}/`
};
