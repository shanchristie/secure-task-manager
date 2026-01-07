/**
 * app.js
 * -----------------------------------------------------------------------------
 * Secure Task Manager API - Application Entry Point
 *
 * Purpose:
 * - Load environment variables
 * - Initialize Express
 * - Apply global middleware (security, parsing, rate limiting)
 * - Mount API routes
 * - Serve Swagger API docs
 * - Handle errors centrally
 * - Start the server
 *
 * Notes on Swagger + Security:
 * - Swagger UI requires inline scripts to render.
 * - Helmet's default Content-Security-Policy can block Swagger UI and cause a blank page.
 * - To keep the API hardened while allowing docs to work, we mount Swagger FIRST
 *   and explicitly disable Helmet for the /api/docs route only.
 * -----------------------------------------------------------------------------
 */

require("dotenv").config(); // Loads .env into process.env

const express = require("express"); // Express framework
const cors = require("cors"); // Cross-origin request support
const helmet = require("helmet"); // Secure HTTP headers
const rateLimit = require("express-rate-limit"); // Request rate limiting
const morgan = require("morgan"); // HTTP request logger middleware

const config = require("./config"); // Centralized validated config

const swaggerUi = require("swagger-ui-express"); // Swagger UI middleware
const openapi = require("./docs/openapi"); // OpenAPI spec (JS object)

const authRoutes = require("./routes/auth"); // Auth routes
const taskRoutes = require("./routes/tasks"); // Task routes
const { notFoundHandler, errorHandler } = require("./middleware/errorHandlers"); // Centralized errors

const app = express(); // Create the Express application

/**
 * Remove X-Powered-By header
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Avoid advertising Express usage
 */
app.disable("x-powered-by");

/**
 * Swagger API Documentation (mounted early)
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Provide interactive API docs at /api/docs for portfolio and local testing.
 *
 * Security:
 * - Swagger UI requires inline scripts.
 * - We intentionally do NOT apply Helmet to /api/docs to avoid CSP blocking.
 * - All other routes still receive Helmet protections.
 */
app.use(
  "/api/docs",
  (req, res, next) => {
    // Ensure Helmet/CSP headers do not interfere with Swagger UI rendering.
    res.removeHeader("Content-Security-Policy");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    explorer: true,
  })
);

/**
 * Security headers (Helmet)
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Mitigate common web vulnerabilities for all API endpoints.
 *
 * Note:
 * - Mounted AFTER Swagger to prevent CSP from breaking Swagger UI.
 */
app.use(helmet());

/**
 * CORS configuration
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Allow only the configured frontend origin
 * - Block all other browser origins
 */
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

/**
 * JSON request parsing
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Enable req.body for JSON payloads
 */
app.use(express.json());

/**
 * Request logging (Morgan)
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Log each incoming HTTP request with method, path, status, and response time
 * - Helps debugging and monitoring
 */
app.use(morgan("dev"));

/**
 * API rate limiting
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Prevent brute-force and abuse
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit only API routes (not Swagger docs).
app.use("/api", apiLimiter);

/**
 * Routes
 * -----------------------------------------------------------------------------
 */
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

/**
 * Health check
 * -----------------------------------------------------------------------------
 */
app.get("/api/health", (req, res) => {
  return res.json({ status: "ok", message: "Secure Task Manager API running" });
});

/**
 * 404 handler (no route matched)
 * -----------------------------------------------------------------------------
 */
app.use(notFoundHandler);

/**
 * Central error handler
 * -----------------------------------------------------------------------------
 */
app.use(errorHandler);

/**
 * Start server
 * -----------------------------------------------------------------------------
 */
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});