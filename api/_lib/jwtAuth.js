// JWT Authentication middleware for Vercel API routes
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extract token from Authorization header
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Verify JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Get user role from database
async function getUserRole(userId) {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const users = await sql`SELECT role FROM users WHERE id = ${userId}`;
    return users[0]?.role || 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

// Middleware to verify JWT token
export function authenticateUser(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'NO_TOKEN'
    });
  }
  
  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
  
  req.userId = result.userId;
  next();
}

// Middleware to verify admin role (requires authentication first)
export async function authenticateAdmin(req, res, next) {
  // This should be called after authenticateUser
  if (!req.userId) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'NO_USER_ID'
    });
  }
  
  try {
    const userRole = await getUserRole(req.userId);
    
    if (!userRole) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    req.userRole = userRole;
    next();
  } catch (error) {
    console.error('Error in admin authentication:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

// Optional authentication - doesn't fail if no token provided
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  
  if (token) {
    const result = verifyToken(token);
    if (result.valid) {
      req.userId = result.userId;
    }
  }
  
  next();
}

// Create JWT token
export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Verify token and return user ID
export function getUserIdFromToken(token) {
  const result = verifyToken(token);
  return result.valid ? result.userId : null;
}

// Helper function to check if user owns a resource
export function checkResourceOwnership(userId, resourceUserId) {
  return userId === resourceUserId;
}

// Helper function to check if user is admin
export async function isUserAdmin(userId) {
  const role = await getUserRole(userId);
  return role === 'admin';
} 