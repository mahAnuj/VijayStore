// Session handling for Vercel serverless functions
// Note: This is a simplified implementation
// For production, use JWT tokens, Redis, or Vercel KV storage

export class SessionManager {
  constructor() {
    this.sessions = new Map(); // In production, use external storage
  }

  createSession(userId) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const session = {
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session;
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // Extract session from request headers/cookies
  getSessionFromRequest(req) {
    // Try to get session from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.substring(7);
      return this.getSession(sessionId);
    }
    
    // Try to get session from cookies
    const cookies = req.headers.cookie;
    if (cookies) {
      const sessionCookie = cookies
        .split(';')
        .find(c => c.trim().startsWith('session='));
      
      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1];
        return this.getSession(sessionId);
      }
    }
    
    return null;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Helper function to set session in response
export function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', [
    `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
  ]);
}

// Helper function to clear session cookie
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', [
    'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
  ]);
}