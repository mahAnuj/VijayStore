// Shared authentication utilities for Vercel serverless functions
import { storage } from './storage.js';
import { sessionManager } from './session.js';

// Phone authentication check
export async function isPhoneAuthenticated(req) {
  const session = sessionManager.getSessionFromRequest(req);
  
  if (!session?.userId) {
    return { authenticated: false, user: null };
  }
  
  try {
    const user = await storage.getUser(session.userId);
    return { authenticated: !!user, user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

// Phone admin check
export async function isPhoneAdmin(req) {
  const { authenticated, user } = await isPhoneAuthenticated(req);
  return { authenticated: authenticated && user?.role === 'admin', user };
}

// Middleware wrapper for authentication
export function withAuth(handler) {
  return async (req, res) => {
    const { authenticated, user } = await isPhoneAuthenticated(req);
    
    if (!authenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    return handler(req, res);
  };
}

// Middleware wrapper for admin authentication
export function withAdminAuth(handler) {
  return async (req, res) => {
    const { authenticated, user } = await isPhoneAdmin(req);
    
    if (!authenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    return handler(req, res);
  };
}