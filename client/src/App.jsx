/**
 * App.jsx
 *
 * Defines application routes for Secure Task Manager.
 * Public routes:
 *  - /login
 *  - /register
 *
 * Protected routes:
 *  - /tasks
 *
 * All unknown routes redirect to /tasks.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

export default App;