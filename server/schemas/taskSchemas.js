/**
 * schemas/taskSchemas.js
 * -----------------------------------------------------------------------------
 * Zod schemas for task-related request validation.
 *
 * Purpose:
 * - Centralize input validation
 * - Ensure consistent error handling
 * - Keep route handlers clean and readable
 * -----------------------------------------------------------------------------
 */

const { z } = require("zod");

/**
 * createTaskSchema
 * -----------------------------------------------------------------------------
 * Validates request body for creating a task.
 *
 * Rules:
 * - title is required, trimmed, and must not be empty
 * - description is optional; if provided it is trimmed
 */
const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required." })
      .trim()
      .min(1, "Title cannot be empty."),
    description: z.string().trim().optional(),
  })
  .strict();

/**
 * updateTaskSchema
 * -----------------------------------------------------------------------------
 * Validates request body for updating a task.
 *
 * Rules:
 * - At least one updatable field must be provided
 * - title, if provided, must not be empty after trimming
 * - description, if provided, is trimmed (may be an empty string if client sends it)
 * - completed, if provided, must be a boolean
 * - Unknown fields are rejected
 */
const updateTaskSchema = z
  .object({
    title: z
      .string({ invalid_type_error: "Title must be a string." })
      .trim()
      .min(1, "Title cannot be empty.")
      .optional(),

    description: z
      .string({ invalid_type_error: "Description must be a string." })
      .trim()
      .min(1, "Description cannot be empty")
      .optional(),

    completed: z
      .boolean({ invalid_type_error: "Completed must be true or false." })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update a task.",
    path: ["_form"],
  });

module.exports = { createTaskSchema, updateTaskSchema };