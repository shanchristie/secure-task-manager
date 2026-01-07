/**
 * routes/auth.js
 * -----------------------------------------------------------------------------
 * Secure Task Manager - Authentication Routes
 *
 * Purpose:
 * - Provide endpoints for user registration and login.
 * - Store passwords securely (hashing with bcrypt).
 * - Issue JWT tokens on successful login (used to protect task routes later).
 *
 * Endpoints:
 * - POST /api/auth/register  -> create a new user
 * - POST /api/auth/login     -> authenticate an existing user and return a token
 *
 * Security notes:
 * - Passwords are NEVER stored in plaintext.
 * - bcrypt hashing is used with a reasonable work factor (salt rounds).
 * - JWT secret is loaded from environment variables (never hard-coded).
 * -----------------------------------------------------------------------------
 */

const express = require("express"); // Express provides routing and HTTP utilities for our API.
const bcrypt = require("bcrypt"); // bcrypt securely hashes passwords and verifies password matches.
const jwt = require("jsonwebtoken"); // jsonwebtoken creates and signs JWTs for stateless authentication.
const pool = require("../models/db"); // Our PostgreSQL connection pool (see models/db.js).

const router = express.Router(); // Creates a modular router for auth endpoints (mounted in app.js).

/**
 * isValidEmail(email)
 * -----------------------------------------------------------------------------
 * Minimal email format check (not perfect, but prevents clearly invalid values).
 * This helps:
 * - Catch typos early
 * - Reduce bad data in the database
 * - Improve error messages for the user
 */
function isValidEmail(email) {
  // Regex checks basic "text@text.text" shape and avoids whitespace.
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/auth/register
 * -----------------------------------------------------------------------------
 * Request body:
 *   { username: string, email: string, password: string }
 *
 * Behavior:
 * - Validate inputs
 * - Ensure username/email are not already taken
 * - Hash the password with bcrypt
 * - Insert new user into users table
 *
 * Response:
 * - 201 Created with user object (no password fields returned)
 * - 400 Bad Request for validation failures
 * - 409 Conflict if username/email already exists
 * - 500 Server Error for unexpected issues
 */
router.post("/register", async (req, res) => {
  try {
    // Pull expected fields from request body.
    // Express JSON middleware (app.use(express.json())) must be enabled for this to work.
    const { username, email, password } = req.body;

    // ---- Input validation (keep it strict and predictable) ----

    // Username must exist, be a string, and be at least 3 characters.
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }

    // Email must exist and pass a basic format check.
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // Password must exist, be a string, and be at least 8 characters.
    // (You can increase requirements later, but do not weaken this.)
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // ---- Uniqueness check (prevent duplicate username/email) ----

    // Parameterized query prevents SQL injection by separating SQL from user input.
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username.trim(), email.toLowerCase()]
    );

    // If any row matches, the username or email is already in use.
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username or email already in use." });
    }

    // ---- Password hashing (NEVER store plaintext passwords) ----

    // Salt rounds control hashing cost. Higher = more secure but slower.
    // 12 is a common, reasonable default for entry-level portfolio projects.
    const saltRounds = 12;

    // bcrypt.hash returns a safe password hash we can store.
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ---- Insert the new user in the database ----

    // Store normalized values:
    // - username trimmed
    // - email lowercased (prevents duplicates with different casing)
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username.trim(), email.toLowerCase(), passwordHash]
    );

    // Return the newly created user data (NEVER include password_hash).
    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    // Log the full error on the server for debugging (do not leak details to clients).
    console.error("REGISTER ERROR:", err);

    // Generic response keeps security posture strong and avoids exposing internals.
    return res.status(500).json({ error: "Server error during registration." });
  }
});

/**
 * POST /api/auth/login
 * -----------------------------------------------------------------------------
 * Request body:
 *   { email: string, password: string }
 *
 * Behavior:
 * - Validate input
 * - Find user by email
 * - Compare provided password to stored bcrypt hash
 * - If valid, sign and return a JWT
 *
 * Response:
 * - 200 OK with { token, user }
 * - 400 Bad Request for invalid inputs
 * - 401 Unauthorized if email/password is incorrect
 * - 500 Server Error for unexpected issues
 */
router.post("/login", async (req, res) => {
  try {
    // Extract credentials from request body.
    const { email, password } = req.body;

    // Validate email format so we fail fast and consistently.
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // Validate password presence.
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required." });
    }

    // ---- Find user by email ----

    // Normalize email the same way we stored it (lowercase) to ensure match.
    const result = await pool.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    // If no user found, return a generic invalid credentials response.
    // Do not reveal whether email exists (prevents user enumeration).
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    // ---- Compare password with stored bcrypt hash ----

    // bcrypt.compare handles timing-safe comparison of hashes.
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      // Same generic message prevents attackers from learning which part is wrong.
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ---- Create a JWT token ----

    // JWT_SECRET must exist. If missing, this will throw.
    // This secret should never be committed to GitHub; it lives in .env only.
    const token = jwt.sign(
      {
        // Store the minimum necessary info in the token.
        // We only need userId; additional fields increase risk if exposed.
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        // Token expiration limits how long a leaked token is useful.
        expiresIn: "2h",
      }
    );

    // Return token + safe user profile fields.
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    // Log full error for debugging.
    console.error("LOGIN ERROR:", err);

    // Generic response to avoid leaking internal details.
    return res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router; // Export router so app.js can mount it under /api/auth