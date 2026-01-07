/**
 * middleware/authMiddleware.js
 * -----------------------------------------------------------------------------
 * JWT Authentication Middleware
 *
 * Purpose:
 * - Protect API endpoints that require a logged-in user.
 * - Read the Authorization header from the incoming request.
 * - Verify the JWT (signature + expiration).
 * - If valid, attach the authenticated user's identity to req.user.
 *
 * Expected request header:
 *   Authorization: Bearer <JWT_TOKEN>
 * -----------------------------------------------------------------------------
 */

const jwt = require("jsonwebtoken"); // Used to verify JWT tokens
const config = require("../config"); // Centralized configuration (validated env vars)

function authMiddleware(req, res, next) {
  // Read the Authorization header (Express lowercases header keys).
  const authHeader = req.headers.authorization;

  // If missing, user is not authenticated.
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header." });
  }

  // Must be: "Bearer <token>"
  const parts = authHeader.split(" ");

  // Validate correct format.
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Authorization header must be in 'Bearer <token>' format." });
  }

  // Extract token portion.
  const token = parts[1];

  try {
    // Verify signature and expiration using the validated JWT secret from config.
    // If verification fails, jwt.verify throws an error (caught below).
    const payload = jwt.verify(token, config.jwtSecret);

    // Attach user identity for downstream route handlers.
    req.user = { userId: payload.userId };

    // Continue request.
    return next();
  } catch (err) {
    // Token invalid or expired.
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = authMiddleware; // Export middleware for use in routes