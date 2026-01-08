/**
 * AuthContext.jsx
 *
 * Provides authentication state for the frontend.
 * MVP approach:
 * - Stores JWT in localStorage
 * - Exposes helpers to save and clear the token
 */

import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "stm_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const isAuthenticated = Boolean(token);

  function saveToken(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      saveToken,
      clearToken,
    }),
    [token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return ctx;
}