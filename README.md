# Secure Task Manager

Secure Task Manager is a full-stack web application designed to demonstrate secure backend API development and clean frontend integration. The project emphasizes authentication, validation, user-scoped data access, defensive programming, and professional documentation. This repository contains both the backend REST API and the frontend React application, organized in a single cohesive codebase.

Secure Task Manager allows users to register, log in securely, and manage a personal task list. Authentication is handled using JSON Web Tokens (JWT). All task operations are strictly scoped to the authenticated user, and all validation and authorization are enforced server-side. The frontend provides a clean, minimal interface that integrates directly with the backend API while deferring all security-critical logic to the server.

## Repository Structure

secure-task-manager/
├── server/        Backend REST API (Node.js, Express, PostgreSQL)
├── client/        Frontend React application
├── screenshots/   Application screenshots
└── README.md

## Backend API

The backend is a secure REST API built with Node.js, Express, and PostgreSQL. It demonstrates best practices for authentication, validation, error handling, and API documentation.

Backend features include user registration and login, JWT-based authentication and authorization, user-scoped task CRUD operations, strict server-side validation using Zod, rejection of unknown request fields, centralized error handling, secure HTTP headers via Helmet, rate limiting to prevent abuse, restricted CORS configuration, request logging with Morgan, and interactive API documentation using Swagger UI (OpenAPI 3.0).

Full backend documentation is available in server/README.md. Swagger UI is available locally at http://localhost:3001/api/docs.

## Frontend Application

The frontend is a React application built with Vite. It focuses on usability, clarity, and safe integration with the backend API while avoiding frontend-side security assumptions.

Frontend features include user registration and login, JWT-based authentication handling, protected routes for authenticated users, user-scoped task management, creation, updating, completion, and deletion of tasks, bulk actions such as mark all complete and clear completed, password visibility toggle on login, friendly user-facing error messages, automatic logout on authentication expiration, clean and responsive UI styling, and centralized API and error-handling utilities.

Full frontend documentation is available in client/README.md.

## Authentication Design

Authentication is handled using JSON Web Tokens issued by the backend API. Passwords are hashed server-side before storage. JWTs are signed and verified using a server-side secret. User identity is derived exclusively from the JWT. Tokens are stored client-side for session persistence. Protected frontend routes require valid authentication, and expired or invalid tokens trigger automatic logout. No sensitive authentication logic is implemented on the client.

## Validation and Error Handling

All request validation is enforced server-side using Zod schemas. Required fields are validated and trimmed, empty strings are rejected, unknown fields are rejected, PUT requests require at least one valid field, and validation errors return structured, consistent responses. The frontend translates raw API and network errors into friendly, user-facing messages while avoiding disclosure of internal implementation details.

## Running the Project Locally

To run the backend, navigate to the server directory, install dependencies, and start the development server using npm install followed by npm run dev. The backend runs at http://localhost:3001.

To run the frontend, navigate to the client directory, install dependencies, and start the development server using npm install followed by npm run dev. The frontend runs at http://localhost:5173.

## Screenshots

Screenshots demonstrating authentication, task management, bulk actions, and friendly error handling are available in the screenshots directory. These images reflect real, working application behavior.

## Design Philosophy

This project emphasizes clear separation of concerns, server-enforced security, defensive programming, explicit handling of edge cases, clean and maintainable code, and professional documentation. It is intentionally built as a production-quality portfolio project rather than a feature-heavy demo.

## Future Enhancements

Planned future enhancements include deployment using Render or Railway for the backend, deployment using Vercel or Netlify for the frontend, refresh token support, pagination and filtering for tasks, optional role-based access control, and UI theming support.

## Author

This project was built as a portfolio piece to demonstrate secure full-stack web application design, authentication, validation, frontend integration, and professional development practices.

## Note on Credentials

No credentials or secrets are included in this repository. Environment variables and sensitive values are intentionally excluded from version control. Users may register their own accounts locally to test application functionality.