/**
 * ProtectedRoute.jsx
 *
 * Prevents access to routes unless the user is authenticated.
 * Redirects unauthenticated users to /login.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;