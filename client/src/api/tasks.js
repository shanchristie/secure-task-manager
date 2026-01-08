import api from "./axios";

/**
 * tasks.js
 *
 * Tasks API functions for Secure Task Manager.
 * Uses centralized Axios client which automatically attaches JWT.
 */

export async function getTasks() {
  const response = await api.get("/api/tasks");
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post("/api/tasks", payload);
  return response.data;
}

export async function updateTask(id, payload) {
  const response = await api.put(`/api/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
}