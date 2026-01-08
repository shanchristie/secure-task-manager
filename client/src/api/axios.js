/**
 * axios.js
 *
 * Centralized Axios instance for Secure Task Manager.
 * Responsibilities:
 * - Uses environment-based API base URL
 * - Automatically attaches JWT from localStorage
 * - Normalizes API errors for consistent UI handling
 */

import axios from "axios";

// Base URL comes from client/.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not defined. Check client/.env and restart Vite."
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach JWT to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("stm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize backend errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    return Promise.reject({
      status,
      data,
      message:
        data?.error ||
        error?.message ||
        "An unexpected error occurred.",
    });
  }
);

export default api;