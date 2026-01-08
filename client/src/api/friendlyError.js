/**
 * friendlyError.js
 *
 * Converts raw API / network errors into user-friendly messages.
 * Works with our API wrappers that throw objects like:
 * { status, data, message }
 * and also supports Axios-style errors (err.response.status).
 */

export function getFriendlyError(err) {
    const status = err?.status ?? err?.response?.status;
  
    // Network/server unreachable (no HTTP status)
    if (!status) {
      return "Cannot reach the server. Please check that the backend is running.";
    }
  
    // Prefer backend-provided simple message when available
    const backendMessage = err?.data?.error;
  
    switch (status) {
      case 400:
        return backendMessage || "Invalid request. Please check your input.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return backendMessage || "The requested item could not be found.";
      case 429:
        return "Too many requests. Please try again in a moment.";
      default:
        return "Something went wrong on the server. Please try again.";
    }
  }  