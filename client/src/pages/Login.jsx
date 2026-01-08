import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { getFriendlyError } from "../api/friendlyError";

/**
 * Login.jsx
 *
 * Login page:
 * - Collects email + password
 * - Supports show/hide password toggle
 * - Calls backend /api/auth/login
 * - Stores JWT via AuthContext
 * - Friendly errors
 */

export default function Login() {
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      const token = result?.token;

      if (!token) {
        setError("Login succeeded but no token was returned.");
        return;
      }

      saveToken(token);
      navigate("/tasks");
    } catch (err) {
      const details = err?.data?.details;

      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join("\n"));
      } else {
        setError(getFriendlyError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stm-container">
      <div className="stm-card stm-gap-12">
        <h1>Secure Task Manager</h1>
        <h2>Sign in</h2>

        {error && <p className="stm-error">{error}</p>}

        <form onSubmit={handleSubmit} className="stm-gap-12">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              aria-label="Show password"
            />
            Show password
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p>
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}