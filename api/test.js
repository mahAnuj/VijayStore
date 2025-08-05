// Simple test endpoint to verify Vercel is working
export default function handler(req, res) {
  res.json({ 
    message: 'Vercel API is working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasTwilio: !!process.env.TWILIO_ACCOUNT_SID
    }
  });
}