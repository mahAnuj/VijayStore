// Combined authentication endpoints - Vercel compatible
import { neon } from '@neondatabase/serverless';

// Simple session management for serverless
const sessions = new Map();

function createSession(userId) {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessions.set(sessionId, { userId, createdAt: Date.now() });
  return sessionId;
}

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  // Session expires after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.userId;
}

function destroySession(sessionId) {
  sessions.delete(sessionId);
}

function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}

// Simple OTP management for Vercel
const otpStore = new Map();

async function sendOTP(phoneNumber) {
  console.log('Send OTP called for:', phoneNumber);
  
  // For demo purposes, always use 123456 as OTP
  const otp = '123456';
  otpStore.set(phoneNumber, { otp, timestamp: Date.now() });
  
  console.log(`Demo mode: OTP for ${phoneNumber} is ${otp}`);
  
  return {
    success: true,
    message: 'Demo mode: Use OTP 123456 to verify ' + phoneNumber
  };
}

async function verifyOTP(phoneNumber, otp) {
  console.log('Verify OTP called for:', phoneNumber, 'with OTP:', otp);
  
  const storedOtp = otpStore.get(phoneNumber);
  if (!storedOtp) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  // Check if OTP is expired (5 minutes)
  if (Date.now() - storedOtp.timestamp > 5 * 60 * 1000) {
    otpStore.delete(phoneNumber);
    return { success: false, message: 'OTP has expired' };
  }
  
  if (storedOtp.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP verified successfully
  otpStore.delete(phoneNumber);
  
  if (!process.env.DATABASE_URL) {
    return { success: false, message: 'Database not configured' };
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Check if user exists
    let users = await sql`SELECT * FROM users WHERE phone = ${phoneNumber}`;
    let user = users[0];
    
    if (!user) {
      // Create new user
      const role = phoneNumber === '+917878787878' ? 'admin' : 'customer';
      const newUsers = await sql`
        INSERT INTO users (id, phone, role, created_at, updated_at)
        VALUES (${Math.random().toString(36).substring(2, 15)}, ${phoneNumber}, ${role}, NOW(), NOW())
        RETURNING *
      `;
      user = newUsers[0];
    }
    
    return {
      success: true,
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, message: 'Database error occurred' };
  }
}

// Cookie parsing utility
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
  }
  return cookies;
}

// Simple storage functions for Vercel
const storage = {
  async getUser(userId) {
    if (!process.env.DATABASE_URL) throw new Error('Database not configured');
    const sql = neon(process.env.DATABASE_URL);
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const user = users[0];
    if (!user) return null;
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    };
  }
};

const sessionManager = {
  createSession,
  getSession,
  destroySession
};

async function handleSendOtp(req, res) {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  
  const result = await sendOTP(phoneNumber);
  res.json(result);
}

async function handleVerifyOtp(req, res) {
  const { phoneNumber, otp } = req.body;
  
  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: "Phone number and OTP are required" });
  }
  
  const result = await verifyOTP(phoneNumber, otp);
  
  if (result.success && result.user) {
    // Create session for Vercel
    const sessionId = sessionManager.createSession(result.user.id);
    setSessionCookie(res, sessionId);
    
    res.json({ 
      success: true, 
      message: result.message, 
      user: result.user,
      sessionId
    });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
}

async function handleLogout(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;
  if (sessionId) {
    sessionManager.destroySession(sessionId);
    clearSessionCookie(res);
  }
  res.json({ message: 'Logged out successfully' });
}

async function handleGetUser(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = sessionManager.getSession(sessionId);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    const path = req.url?.split('?')[0];
    
    if (method === 'POST' && path === '/api/auth/send-otp') {
      return await handleSendOtp(req, res);
    }
    
    if (method === 'POST' && path === '/api/auth/verify-otp') {
      return await handleVerifyOtp(req, res);
    }
    
    if (method === 'POST' && path === '/api/auth/logout') {
      return await handleLogout(req, res);
    }
    
    if (method === 'GET' && path === '/api/auth/user') {
      return await handleGetUser(req, res);
    }
    
    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}