// Simple auth middleware for local development
export function setupAuth(app) {
  // No setup needed for local dev
}

export function isAuthenticated(req, res, next) {
  next(); // Allow all for local dev
}

export function isAdmin(req, res, next) {
  next(); // Allow all for local dev
}