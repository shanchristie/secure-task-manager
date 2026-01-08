# Secure Task Manager Frontend

Secure Task Manager Frontend is a React-based client application for interacting with the Secure Task Manager API. It is designed to demonstrate clean frontend architecture, secure authentication handling, thoughtful user experience, and professional error handling.

This frontend intentionally avoids shortcuts and assumptions about backend behavior. All security-critical logic remains server-enforced, while the client focuses on correctness, clarity, and usability.

## Overview

The Secure Task Manager Frontend allows users to register, log in, and manage their personal task list through a modern, minimal React interface. Authentication is handled using JSON Web Tokens (JWT), which are stored client-side for the duration of a session and sent with API requests.

The frontend integrates directly with the Secure Task Manager API and respects all validation, authentication, and authorization rules enforced by the backend.

## Key Features

- User registration and login  
- JWT-based authentication handling  
- Protected routes for authenticated users  
- User-scoped task management (create, view, update, delete)  
- Bulk task actions (mark all complete, clear completed)  
- Password visibility toggle on login  
- Defensive client-side validation  
- Friendly, user-facing error messages  
- Automatic logout and redirect on authentication expiration  
- Clean, responsive UI with minimal styling  
- No frontend assumptions about data ownership or security  

## Technology Stack

### Frontend

- React  
- Vite  
- JavaScript (ES6+)  
- React Router  

### API Communication

- Axios  
- Centralized API helpers  

### State and Context

- React Context API  
- Local storage for JWT persistence  

### Styling

- Custom CSS  
- Minimal, modern, responsive layout  
- No external UI frameworks  

## Authentication Design

Authentication is handled using JSON Web Tokens issued by the backend API.

- Tokens are stored in localStorage for session persistence.  
- The token is attached to API requests via the Authorization header.  
- Authentication state is managed centrally using a React Context.  
- Protected routes require a valid authentication state.  
- If a token becomes invalid or expires, the user is automatically logged out and redirected to the login page.  

No sensitive authentication logic is implemented client-side. The frontend defers all security enforcement to the backend.

## Error Handling Strategy

The frontend implements a centralized friendly error handling strategy.

- Network and server errors are translated into user-friendly messages.  
- Common scenarios such as session expiration, server unavailability, and rate limiting are handled explicitly.  
- Validation errors returned from the backend are displayed clearly and consistently.  
- Internal error details and stack traces are never shown to the user.  

This approach improves usability while avoiding information leakage.

## Project Structure

client/
- src/
  - api/
    - auth.js  
    - tasks.js  
    - friendlyError.js  
  - components/
    - ProtectedRoute.jsx  
  - context/
    - AuthContext.jsx  
  - pages/
    - Login.jsx  
    - Register.jsx  
    - Tasks.jsx  
  - styles/
    - app.css  
  - App.jsx  
  - main.jsx  
- README.md  

## Running the Frontend Locally

1. Ensure the Secure Task Manager API is running locally.  
2. Open a terminal and navigate into the client directory.  
3. Install dependencies by running:

npm install

4. Start the development server:

npm run dev

The frontend will be available at:

http://localhost:5173

## Backend Integration

The frontend expects the backend API to be available at:

http://localhost:3001

All API requests are authenticated using JWTs issued by the backend. The frontend does not mock, bypass, or weaken backend validation in any way.

## User Flow

1. A user registers for an account using the Register page.  
2. The user logs in using the Login page.  
3. Upon successful login, a JWT is stored and the user is redirected to the Tasks page.  
4. The user can create, update, complete, and delete tasks.  
5. All tasks are scoped to the authenticated user.  
6. The user can log out at any time, which clears authentication state.  

## Screenshots

The frontend screenshots may include:

- Login page  
- Registration page  
- Authenticated task list  
- Task creation  
- Bulk task actions  
- Error message examples  

These screenshots demonstrate real API interaction and authenticated user behavior.

## Design Philosophy

This frontend emphasizes:

- Clear separation of concerns  
- Minimal but intentional UI design  
- Explicit handling of edge cases  
- Security-conscious integration with the backend  
- Readable, maintainable code  

It is intentionally built as a production-quality example rather than a feature-heavy demo.

## Future Enhancements

- Password strength indicators  
- Task filtering and sorting  
- Pagination for large task lists  
- Dark/light theme toggle  
- Deployment using Vercel or Netlify  
- Refresh token support (backend-dependent)  

## Author

This frontend was built as a portfolio project to demonstrate secure frontend integration, authentication handling, error management, and professional React application structure.

## Note on Credentials

No credentials are included in this repository. Users can register their own accounts locally. Storing or documenting credentials is a security anti-pattern and intentionally avoided.