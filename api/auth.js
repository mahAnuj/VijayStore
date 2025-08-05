// Combined authentication endpoints
import { storage } from './_lib/storage.js';
import { sendOTP, verifyOTP } from './_lib/phoneAuth.js';
import { sessionManager, setSessionCookie, clearSessionCookie } from './_lib/session.js';

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
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    sessionManager.destroySession(sessionId);
    clearSessionCookie(res);
  }
  res.json({ message: 'Logged out successfully' });
}

async function handleGetUser(req, res) {
  const sessionId = req.cookies?.sessionId;
  
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