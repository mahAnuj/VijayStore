import twilio from 'twilio';
import { storage } from './storage.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired OTPs
function cleanExpiredOTPs() {
  const now = Date.now();
  const entries = Array.from(otpStore.entries());
  for (const [phone, data] of entries) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}

// Send OTP via SMS
export async function sendOTP(phoneNumber) {
  try {
    // Clean expired OTPs
    cleanExpiredOTPs();
    
    // Normalize phone number (remove spaces, add +91 for Indian numbers if needed)
    let normalizedPhone = phoneNumber.replace(/\s+/g, '');
    if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
      normalizedPhone = '+' + normalizedPhone;
    } else if (normalizedPhone.startsWith('0') && normalizedPhone.length === 11) {
      normalizedPhone = '+91' + normalizedPhone.substring(1);
    } else if (normalizedPhone.length === 10) {
      normalizedPhone = '+91' + normalizedPhone;
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    // Check rate limiting (max 3 attempts per hour)
    const existing = otpStore.get(normalizedPhone);
    if (existing && existing.attempts >= 3) {
      return { success: false, message: 'Too many OTP requests. Please try again later.' };
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // For demo purposes, use a fixed OTP for testing
    const isDemoMode = process.env.NODE_ENV === 'development';
    const demoOtp = '123456';
    const finalOtp = isDemoMode ? demoOtp : otp;

    try {
      // Attempt to send SMS via Twilio
      await client.messages.create({
        body: `Your Vijay Traders verification code is: ${finalOtp}. Valid for 5 minutes.`,
        from: TWILIO_PHONE_NUMBER,
        to: normalizedPhone
      });
    } catch (twilioError) {
      // If Twilio fails (unverified number in trial), use demo mode
      if (twilioError.code === 21608 && isDemoMode) {
        console.log(`Demo mode: OTP for ${normalizedPhone} is ${demoOtp}`);
        // Store demo OTP
        otpStore.set(normalizedPhone, {
          otp: demoOtp,
          expiresAt,
          attempts: existing ? existing.attempts + 1 : 1
        });
        return { 
          success: true, 
          message: `Demo mode: Use OTP ${demoOtp} to verify ${normalizedPhone}` 
        };
      }
      throw twilioError; // Re-throw if not a verification error or not in demo mode
    }

    // Store OTP
    otpStore.set(normalizedPhone, {
      otp: finalOtp,
      expiresAt,
      attempts: existing ? existing.attempts + 1 : 1
    });

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP. Please check your phone number.' };
  }
}

// Verify OTP
export async function verifyOTP(phoneNumber, otp) {
  try {
    // Clean expired OTPs
    cleanExpiredOTPs();
    
    // Normalize phone number
    let normalizedPhone = phoneNumber.replace(/\s+/g, '');
    if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
      normalizedPhone = '+' + normalizedPhone;
    } else if (normalizedPhone.startsWith('0') && normalizedPhone.length === 11) {
      normalizedPhone = '+91' + normalizedPhone.substring(1);
    } else if (normalizedPhone.length === 10) {
      normalizedPhone = '+91' + normalizedPhone;
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    const stored = otpStore.get(normalizedPhone);
    if (!stored) {
      return { success: false, message: 'OTP expired or not found. Please request a new one.' };
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(normalizedPhone);
      return { success: false, message: 'OTP expired. Please request a new one.' };
    }

    if (stored.otp !== otp) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // OTP verified successfully
    otpStore.delete(normalizedPhone);

    // Get or create user
    let user = await storage.getUserByPhone(normalizedPhone);
    if (!user) {
      user = await storage.createUser({
        id: `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phone: normalizedPhone,
        role: 'customer'
      });
    }

    return { success: true, message: 'Phone verified successfully', user };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
}

// Middleware to check if user is authenticated via phone
export async function isPhoneAuthenticated(req, res, next) {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Middleware to check if user is admin
export async function isPhoneAdmin(req, res, next) {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error checking admin access:", error);
    res.status(403).json({ message: "Admin access required" });
  }
}