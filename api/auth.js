// JWT-based authentication endpoints for Vercel
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h'; // 24 hours

// Database-based OTP management for serverless

// JWT token utilities
function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Extract token from Authorization header
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Middleware to verify JWT token
function authenticateUser(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  req.userId = result.userId;
  next();
}

async function sendOTP(phoneNumber) {
  console.log('Send OTP called for:', phoneNumber);
  
  if (!process.env.DATABASE_URL) {
    return { success: false, message: 'Database not configured' };
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // For demo purposes, always use 123456 as OTP
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    // Store OTP in database
    await sql`
      INSERT INTO otps (phone, otp, expires_at, created_at)
      VALUES (${phoneNumber}, ${otp}, ${expiresAt}, NOW())
      ON CONFLICT (phone) 
      DO UPDATE SET 
        otp = ${otp},
        expires_at = ${expiresAt},
        created_at = NOW()
    `;
    
    console.log(`Demo mode: OTP for ${phoneNumber} is ${otp}`);
    
    return {
      success: true,
      message: 'Demo mode: Use OTP 123456 to verify ' + phoneNumber
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

async function verifyOTP(phoneNumber, otp) {
  console.log('Verify OTP called for:', phoneNumber, 'with OTP:', otp);
  
  if (!process.env.DATABASE_URL) {
    return { success: false, message: 'Database not configured' };
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Get OTP from database
    const otpResults = await sql`
      SELECT * FROM otps 
      WHERE phone = ${phoneNumber} 
      AND expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const storedOtp = otpResults[0];
    
    if (!storedOtp) {
      return { success: false, message: 'OTP not found or expired' };
    }
    
    if (storedOtp.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }
    
        // OTP verified successfully - delete it
    await sql`DELETE FROM otps WHERE phone = ${phoneNumber}`;
    
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
      message: 'OTP verified successfully',
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
    console.error('Database error during OTP verification:', error);
    return { success: false, message: 'Database error' };
  }
}

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
    // Create JWT token
    const token = createToken(result.user.id);
    
    res.json({ 
      success: true, 
      message: result.message, 
      user: result.user,
      token // Send token to client
    });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
}

async function handleGetUser(req, res) {
  try {
    // Get user from database using userId from JWT
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ message: 'Database not configured' });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const users = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Handle POST requests with action parameter from body
    if (method === 'POST') {
      const { action } = req.body || {};
      switch (action) {
        case 'send-otp':
          return await handleSendOtp(req, res);
        case 'verify-otp':
          return await handleVerifyOtp(req, res);
        default:
          return res.status(400).json({ message: 'Invalid action. Supported actions: send-otp, verify-otp' });
      }
    }
    
    // Handle GET request for user info (requires authentication)
    if (method === 'GET') {
      return authenticateUser(req, res, () => handleGetUser(req, res));
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Auth JWT error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 