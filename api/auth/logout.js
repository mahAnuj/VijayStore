import { sessionManager, clearSessionCookie } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session and delete it
    const session = sessionManager.getSessionFromRequest(req);
    if (session) {
      const sessionId = req.headers.authorization?.substring(7) || 
                        req.headers.cookie?.split('session=')[1]?.split(';')[0];
      if (sessionId) {
        sessionManager.deleteSession(sessionId);
      }
    }
    
    // Clear session cookie
    clearSessionCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Failed to logout" });
  }
}