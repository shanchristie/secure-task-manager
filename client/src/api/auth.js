/**
 * auth.js
 *
 * Auth API functions for Secure Task Manager.
 * Keeps auth endpoints centralized and reusable.
 */

import api from "./axios";

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<any>}
 */
export async function registerUser(payload) {
    // payload should be: { username, email, password }
    const response = await api.post("/api/auth/register", payload);
    return response.data;
  }
  

/**
 * Login a user and receive a JWT token.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<any>} Expected to include a token field.
 */
export async function loginUser(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}