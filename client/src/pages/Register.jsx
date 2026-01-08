import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { getFriendlyError } from "../api/friendlyError";

/**
 * Register.jsx
 *
 * Registration page:
 * - Collects username, email, password, confirm password
 * - Prevents submit if passwords do not match
 * - Calls backend /api/auth/register
 * - Redirects to /login on success
 * - Friendly errors
 */

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ username, email, password });
      navigate("/login");
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
        <h2>Create account</h2>

        {error && <p className="stm-error">{error}</p>}

        <form onSubmit={handleSubmit} className="stm-gap-12">
          <label>
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </label>

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
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {!passwordsMatch && confirmPassword.length > 0 ? (
            <p className="stm-error" style={{ marginTop: 0 }}>
              Passwords do not match.
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting || !passwordsMatch}>
            {isSubmitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
