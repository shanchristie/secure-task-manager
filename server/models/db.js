/**
 * models/db.js
 * -----------------------------------------------------------------------------
 * PostgreSQL Connection Pool
 *
 * Purpose:
 * - Provide a shared database connection pool for the application.
 * - Use DATABASE_URL from validated config.
 * -----------------------------------------------------------------------------
 */

const { Pool } = require("pg"); // PostgreSQL client pool
const config = require("../config"); // Centralized configuration

const pool = new Pool({
  connectionString: config.databaseUrl, // Use validated connection string
});

module.exports = pool; // Export pool for use in routes