/**
 * docs/openapi.js
 * -----------------------------------------------------------------------------
 * OpenAPI 3.0 specification for Secure Task Manager API.
 *
 * Purpose:
 * - Provide machine-readable API documentation (OpenAPI).
 * - Enable interactive docs via Swagger UI.
 * - Support portfolio demonstration and developer onboarding.
 * -----------------------------------------------------------------------------
 */

const openapi = {
    openapi: "3.0.3",
    info: {
      title: "Secure Task Manager API",
      version: "1.0.0",
      description:
        "A secure REST API for managing user-scoped tasks with JWT authentication, validation, and defensive hardening.",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Auth", description: "User registration and login" },
      { name: "Tasks", description: "User-scoped task CRUD operations" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Paste a valid JWT here. Example: Bearer <token>. In Swagger UI, paste ONLY the token.",
        },
      },
      schemas: {
        /**
         * Task
         * -----------------------------------------------------------------------
         * Represents a single task record returned from the API.
         */
        Task: {
          type: "object",
          properties: {
            id: { type: "integer", example: 3 },
            title: { type: "string", example: "Updated via PUT" },
            description: { type: ["string", "null"], example: "Initial description" },
            completed: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
          },
          required: ["id", "title", "description", "completed", "created_at"],
        },
  
        /**
         * ValidationError
         * -----------------------------------------------------------------------
         * Standardized validation error response used across endpoints.
         */
        ValidationError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Invalid input" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "title" },
                  message: { type: "string", example: "Title cannot be empty." },
                },
                required: ["field", "message"],
              },
            },
          },
          required: ["error", "details"],
        },
  
        /**
         * UnauthorizedError
         * -----------------------------------------------------------------------
         * Returned when the request is missing a valid JWT in the Authorization header.
         */
        UnauthorizedError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Missing Authorization header." },
          },
          required: ["error"],
        },
  
        /**
         * NotFoundError
         * -----------------------------------------------------------------------
         * Returned when a task does not exist or does not belong to the authenticated user.
         */
        NotFoundError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Task not found." },
          },
          required: ["error"],
        },
  
        /**
         * ErrorResponse
         * -----------------------------------------------------------------------
         * Generic error response shape used for non-validation errors.
         * Keep this as a fallback for endpoints with unique messages.
         */
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "An error occurred." },
          },
          required: ["error"],
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "shan@example.com" },
                    password: { type: "string", example: "Password123!" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "User registered successfully." },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid input",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
              },
            },
          },
        },
      },
  
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive a JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "shan@example.com" },
                    password: { type: "string", example: "Password123!" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: { type: "string", description: "JWT access token" },
                    },
                    required: ["token"],
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "Invalid email or password." },
                    },
                    required: ["error"],
                  },
                },
              },
            },
          },
        },
      },
  
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks for the authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of tasks",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      tasks: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Task" },
                      },
                    },
                    required: ["tasks"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized (missing or invalid JWT)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnauthorizedError" },
                },
              },
            },
          },
        },
  
        post: {
          tags: ["Tasks"],
          summary: "Create a new task for the authenticated user",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", example: "Zod PUT test" },
                    description: { type: "string", example: "Initial description" },
                  },
                  required: ["title"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Task created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { $ref: "#/components/schemas/Task" },
                    },
                    required: ["task"],
                  },
                },
              },
            },
            400: {
              description: "Invalid input",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
              },
            },
            401: {
              description: "Unauthorized (missing or invalid JWT)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnauthorizedError" },
                },
              },
            },
          },
        },
      },
  
      "/api/tasks/{id}": {
        put: {
          tags: ["Tasks"],
          summary: "Update a task owned by the authenticated user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", example: 3 },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", example: "Updated via PUT" },
                    description: { type: "string", example: "Updated description" },
                    completed: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { $ref: "#/components/schemas/Task" },
                    },
                    required: ["task"],
                  },
                },
              },
            },
            400: {
              description: "Invalid input",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
              },
            },
            401: {
              description: "Unauthorized (missing or invalid JWT)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnauthorizedError" },
                },
              },
            },
            404: {
              description: "Task not found (or not owned by user)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/NotFoundError" },
                },
              },
            },
          },
        },
  
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task owned by the authenticated user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", example: 3 },
            },
          ],
          responses: {
            200: {
              description: "Task deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Task deleted." },
                      taskId: { type: "integer", example: 3 },
                    },
                    required: ["message", "taskId"],
                  },
                },
              },
            },
            400: {
              description: "Invalid id",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
              },
            },
            401: {
              description: "Unauthorized (missing or invalid JWT)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnauthorizedError" },
                },
              },
            },
            404: {
              description: "Task not found (or not owned by user)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/NotFoundError" },
                },
              },
            },
          },
        },
      },
    },
  };
  
  module.exports = openapi;
  