/**
 * config.js
 * -----------------------------------------------------------------------------
 * Central configuration for the backend application.
 *
 * Purpose:
 * - Read environment variables from process.env.
 * - Validate that required values exist at startup.
 * - Provide a single source of truth for configuration used across the app.
 *
 * Why this matters:
 * - Prevents "it crashed later" errors caused by missing env vars.
 * - Makes the codebase easier to maintain and deploy.
 * -----------------------------------------------------------------------------
 */

function requireEnv(name) {
    /**
     * requireEnv(name)
     * ---------------------------------------------------------------------------
     * Ensures an environment variable exists and is not empty.
     * - Throws immediately if missing so the app fails fast on startup.
     * ---------------------------------------------------------------------------
     */
    const value = process.env[name];
  
    if (!value || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  
    return value;
  }
  
  const config = {
    /**
     * Server port for Express to listen on.
     * - If PORT is not provided, default to 3001.
     */
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
  
    /**
     * Postgres connection string.
     * Example: postgresql://shan@localhost:5432/secure_task_manager
     */
    databaseUrl: requireEnv("DATABASE_URL"),
  
    /**
     * JWT secret used to sign and verify tokens.
     * This should be long, random, and kept private.
     */
    jwtSecret: requireEnv("JWT_SECRET"),
  
    /**
     * Allowed frontend origin for CORS.
     * During local development, this is typically the frontend dev server.
     */
    clientOrigin: requireEnv("CLIENT_ORIGIN"),
  };
  
  module.exports = config;
  