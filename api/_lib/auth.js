// Simple auth wrapper for local development
export function withAdminAuth(handler) {
  return async (req, res) => {
    // Simplified auth for local development
    return handler(req, res);
  };
}