/**
 * middleware/errorHandlers.js
 * -----------------------------------------------------------------------------
 * Centralized error handling middleware for Express.
 *
 * Includes:
 * - notFoundHandler: handles unknown routes (404)
 * - errorHandler: handles unexpected errors (500) in a consistent JSON format
 *
 * Why this matters:
 * - Keeps error responses consistent across the entire API
 * - Prevents leaking internal stack traces to clients
 * - Centralizes logging in one place
 * -----------------------------------------------------------------------------
 */

/**
 * notFoundHandler(req, res)
 * -----------------------------------------------------------------------------
 * Runs when no route matched the request.
 * Returns a consistent JSON 404 response.
 */
function notFoundHandler(req, res) {
    return res.status(404).json({
      error: "Not Found",
      path: req.originalUrl,
    });
  }
  
  /**
   * errorHandler(err, req, res, next)
   * -----------------------------------------------------------------------------
   * Express error-handling middleware signature includes (err, req, res, next).
   * Any thrown error in routes (or next(err)) will land here.
   */
  function errorHandler(err, req, res, next) {
    // Log full error details on the server for debugging.
    console.error("UNHANDLED ERROR:", err);
  
    // Use statusCode if it was set earlier, otherwise default to 500.
    const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  
    // Return a safe, consistent error payload to the client.
    return res.status(statusCode).json({
      error: statusCode === 500 ? "Internal Server Error" : err.message,
    });
  }
  
  module.exports = { notFoundHandler, errorHandler };  