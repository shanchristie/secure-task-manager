# Secure Task Manager API

Secure Task Manager is a backend REST API for managing user-scoped tasks. It is built to demonstrate secure backend design, authentication, validation, and professional API documentation.

This project emphasizes correctness, security, and defensive programming rather than shortcuts or frontend assumptions.

## Overview

The Secure Task Manager API allows users to register and log in securely, authenticate using JSON Web Tokens (JWT), create, view, update, and delete tasks, and access only their own data. All validation is enforced server-side, and all routes are protected appropriately.

The API is fully documented using OpenAPI 3.0 and Swagger UI for interactive exploration.

## Key Features

- User registration and login
- JWT-based authentication and authorization
- User-scoped task CRUD operations
- Centralized request validation using Zod
- Strict schema validation with meaningful error messages
- Secure HTTP headers via Helmet
- Rate limiting to prevent abuse
- Restricted CORS configuration
- Centralized error handling
- Request logging with Morgan
- Interactive API documentation using Swagger UI

## Technology Stack

### Backend

- Node.js
- Express
- PostgreSQL

### Authentication and Security

- JSON Web Tokens (JWT)
- bcrypt (password hashing)
- Helmet (secure HTTP headers)
- express-rate-limit
- Restricted CORS configuration

### Validation and Tooling

- Zod
- Morgan
- dotenv

### Documentation

- OpenAPI 3.0
- Swagger UI

## Security Design

This project follows backend security best practices. Passwords are hashed using bcrypt before storage. JWTs are signed and verified using a server-side secret. User identity is derived exclusively from the JWT and never from client input. All task operations are scoped to the authenticated user. SQL queries are parameterized to prevent injection attacks. Unknown request fields are rejected. Validation errors are structured and consistent. No stack traces or sensitive internal details are exposed to clients.

## API Documentation

Interactive API documentation is available locally using Swagger UI at:

http://localhost:3001/api/docs

Swagger UI allows you to authenticate using a JWT, execute protected endpoints, view live request and response data, and explore validation and error handling behavior.

## Project Structure

server/
- app.js
- config.js
- models/
  - db.js
- routes/
  - auth.js
  - tasks.js
- schemas/
  - taskSchemas.js
- middleware/
  - authMiddleware.js
  - errorHandlers.js
- docs/
  - openapi.js
- screenshots/

## Environment Variables

Create a .env file inside the server directory with the following values:

PORT=3001  
DATABASE_URL=postgresql://<user>@localhost:5432/secure_task_manager  
JWT_SECRET=<long_random_secret>  
CLIENT_ORIGIN=http://localhost:5173

The JWT secret should be a long, randomly generated string and must never be committed to version control.

## Running the Project Locally

1. Open a terminal and navigate into the server directory.
2. Install dependencies by running: npm install
3. Ensure PostgreSQL is running and that the database exists.
4. Start the server by running: npm run dev

The API will be available at:

http://localhost:3001

## Using the API

### Authentication Flow

1. Register a new user using POST /api/auth/register.
2. Log in using POST /api/auth/login.
3. Copy the JWT returned in the response.
4. Send the token with subsequent requests using the Authorization header in the format:

Authorization: Bearer <JWT_TOKEN>

## Validation Strategy

All request validation is enforced server-side using Zod schemas.

- Required fields are validated and trimmed.
- Empty strings are rejected.
- Unknown fields are rejected.
- PUT requests require at least one updatable field.
- Boolean fields must be actual boolean values.

Validation errors follow a consistent structure with a top-level error message and detailed field-level messages.

## Testing the API

The API can be tested using Swagger UI or via curl. Swagger UI allows authenticated requests directly from the browser after providing a JWT token.

## Screenshots

The screenshots directory can include:

- Swagger overview showing API structure
- Authorized Swagger session
- Successful task retrieval
- Validation error examples
- Successful task update

These screenshots demonstrate real, working API behavior.

## Future Enhancements

- Frontend interface using React
- Deployment using Render or Railway
- JWT refresh token support
- Pagination for task lists
- Optional role-based access control

## Author

This project was built as a portfolio piece to demonstrate secure backend API design, validation, and documentation best practices.

## Note on Credentials

No email address or password is included in this repository. Users can register their own accounts locally or use Swagger UI to test authentication flows. Including credentials in documentation is a security anti-pattern and intentionally avoided.