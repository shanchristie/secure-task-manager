/**
 * routes/tasks.js
 * -----------------------------------------------------------------------------
 * Secure Task Manager - Task Routes
 *
 * Purpose:
 * - Provide protected task endpoints.
 * - Ensure every operation is scoped to the authenticated user.
 *
 * Endpoints:
 * - GET    /api/tasks       -> list tasks for logged-in user
 * - POST   /api/tasks       -> create a new task for logged-in user
 * - PUT    /api/tasks/:id   -> update an existing task for logged-in user
 * - DELETE /api/tasks/:id   -> delete a task for logged-in user
 *
 * Security:
 * - All routes are protected by JWT middleware.
 * - Parameterized SQL queries prevent SQL injection.
 * - user_id is taken from the verified token (never from the client).
 * -----------------------------------------------------------------------------
 */

const express = require("express"); // Express routing utilities
const authMiddleware = require("../middleware/authMiddleware"); // JWT auth middleware
const pool = require("../models/db"); // PostgreSQL connection pool
const { createTaskSchema, updateTaskSchema } = require("../schemas/taskSchemas"); // Zod schemas

const router = express.Router(); // Router mounted at /api/tasks

// Require authentication for every /api/tasks route.
// authMiddleware verifies the token and populates req.user.userId.
router.use(authMiddleware);

/**
 * formatZodError
 * -----------------------------------------------------------------------------
 * Converts Zod validation errors into a consistent API response format.
 *
 * Output format:
 * [
 *   { field: "title", message: "Title cannot be empty." },
 *   { field: "_form", message: "At least one field is required..." }
 * ]
 */
function formatZodError(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "unknown",
    message: issue.message,
  }));
}

/**
 * validatePositiveIntParam
 * -----------------------------------------------------------------------------
 * Validates that a route parameter is a positive integer.
 *
 * Returns:
 * - { ok: true, value: number } when valid
 * - { ok: false, response: ExpressResponse } when invalid (caller should return it)
 */
function validatePositiveIntParam(res, name, rawValue) {
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      ok: false,
      response: res.status(400).json({
        error: "Invalid input",
        details: [{ field: name, message: `${name} must be a positive integer.` }],
      }),
    };
  }

  return { ok: true, value: parsed };
}

/**
 * GET /api/tasks
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Fetch all tasks that belong to the authenticated user.
 *
 * Response:
 * - 200 OK with { tasks: [...] }
 * - 500 Server Error if the database query fails
 */
router.get("/", async (req, res) => {
  try {
    // Authenticated user id (from JWT).
    const userId = req.user.userId;

    // Fetch only tasks for this user.
    const result = await pool.query(
      `
      SELECT id, title, description, completed, created_at
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ tasks: result.rows });
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

/**
 * POST /api/tasks
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Create a new task for the authenticated user.
 *
 * Validation:
 * - Uses Zod schema to validate and normalize incoming JSON.
 *
 * Response:
 * - 201 Created with { task: {...} }
 * - 400 Bad Request with validation error details
 * - 500 Server Error for unexpected failures
 */
router.post("/", async (req, res) => {
  try {
    // Authenticated user id from JWT.
    const userId = req.user.userId;

    // Validate and normalize the request body with Zod.
    const parsed = createTaskSchema.safeParse(req.body);

    // If invalid input, return 400 with the specific reasons.
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: formatZodError(parsed.error),
      });
    }

    // Extract validated values (strings are trimmed by schema).
    const { title, description } = parsed.data;

    // Convert optional description to null when missing (matches DB style).
    const normalizedDescription = description !== undefined ? description : null;

    // Insert new task for THIS user only.
    const result = await pool.query(
      `
      INSERT INTO tasks (user_id, title, description)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, completed, created_at
      `,
      [userId, title, normalizedDescription]
    );

    return res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    return res.status(500).json({ error: "Failed to create task." });
  }
});

/**
 * PUT /api/tasks/:id
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Update an existing task that belongs to the authenticated user.
 *
 * URL params:
 * - id: task id (must be a positive integer)
 *
 * Request body (all optional, but at least one must be provided):
 * - { title?: string, description?: string, completed?: boolean }
 *
 * Validation:
 * - Request body is validated by updateTaskSchema (Zod).
 * - At least one field must be provided.
 * - If title/description are provided, they must be non-empty after trimming.
 * - If completed is provided, it must be a boolean.
 * - Unknown fields are rejected (schema is strict).
 *
 * Security:
 * - Updates only occur when tasks.id matches AND tasks.user_id matches the JWT user.
 * - This prevents one user from editing another user's tasks.
 *
 * Response:
 * - 200 OK with { task: {...} } when updated
 * - 400 Bad Request for invalid input (consistent format)
 * - 404 Not Found if task does not exist or does not belong to user
 * - 500 Server Error for unexpected failures
 */
router.put("/:id", async (req, res, next) => {
  try {
    // Authenticated user id derived ONLY from JWT.
    const userId = req.user.userId;

    // Validate task id (must be a positive integer).
    const idCheck = validatePositiveIntParam(res, "id", req.params.id);
    if (!idCheck.ok) return idCheck.response;
    const taskId = idCheck.value;

    // Validate request body using Zod schema.
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: formatZodError(parsed.error),
      });
    }

    // Zod returns sanitized values (trimmed strings).
    const { title, description, completed } = parsed.data;

    // Build a dynamic UPDATE query so we only update fields the client provided.
    const updates = [];
    const values = [];

    /**
     * addUpdate
     * -------------------------------------------------------------------------
     * Adds a column assignment using the next available parameter index.
     * This preserves SQL injection safety by keeping all values parameterized.
     */
    function addUpdate(columnName, value) {
      values.push(value);
      updates.push(`${columnName} = $${values.length}`);
    }

    if (title !== undefined) addUpdate("title", title);
    if (description !== undefined) addUpdate("description", description);
    if (completed !== undefined) addUpdate("completed", completed);

    // Scope update to the authenticated user.
    values.push(userId);
    values.push(taskId);

    // Execute update and return the updated row.
    const result = await pool.query(
      `
      UPDATE tasks
      SET ${updates.join(", ")}
      WHERE user_id = $${values.length - 1} AND id = $${values.length}
      RETURNING id, title, description, completed, created_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (err) {
    // Let centralized error handler deal with unexpected failures.
    return next(err);
  }
});

/**
 * DELETE /api/tasks/:id
 * -----------------------------------------------------------------------------
 * Purpose:
 * - Delete a task that belongs to the authenticated user.
 *
 * URL params:
 * - id: task id (must be a positive integer)
 *
 * Security:
 * - Deletion only happens when BOTH conditions match:
 *   - tasks.id matches the requested id
 *   - tasks.user_id matches the authenticated user id from the JWT
 *
 * Response:
 * - 200 OK with a confirmation message if deleted
 * - 400 Bad Request if id is invalid (consistent format)
 * - 404 Not Found if the task does not exist or does not belong to the user
 * - 500 Server Error if deletion fails unexpectedly
 */
router.delete("/:id", async (req, res) => {
  try {
    // Authenticated user id from JWT.
    const userId = req.user.userId;

    // Validate task id.
    const idCheck = validatePositiveIntParam(res, "id", req.params.id);
    if (!idCheck.ok) return idCheck.response;
    const taskId = idCheck.value;

    // Delete only if the task belongs to this user.
    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE user_id = $1 AND id = $2
      RETURNING id
      `,
      [userId, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    return res.status(200).json({ message: "Task deleted.", taskId: result.rows[0].id });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    return res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router; // Export router for app.js
