import { verifyOTP } from '../../server/phoneAuth.js';
import { sessionManager, setSessionCookie } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
        sessionId // Return session ID for client storage
      });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
}