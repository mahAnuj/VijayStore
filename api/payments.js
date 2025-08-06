// Combined payment endpoints
import { isPhoneAuthenticated } from './_lib/auth.js';

async function handleCreatePaymentOrder(req, res) {
  const { amount, currency = 'inr' } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  // Mock payment order creation for demo
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    orderId,
    amount: Math.round(amount * 100), // Convert to paisa
    currency: currency.toUpperCase(),
    keyId: process.env.RAZORPAY_KEY_ID || 'demo_key'
  });
}

async function handleVerifyPayment(req, res) {
  const { paymentId, orderId, signature } = req.body;
  
  if (!paymentId || !orderId) {
    return res.status(400).json({ success: false, message: "Payment details are required" });
  }

  // For demo purposes, accept any payment verification
  res.json({ 
    success: true, 
    message: "Payment verified successfully",
    paymentId,
    orderId
  });
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Check authentication for payment endpoints
    const authResult = await isPhoneAuthenticated(req);
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message });
    }
    
    if (method === 'POST') {
      const { action } = req.body || {};
      switch (action) {
        case 'create-order':
          return await handleCreatePaymentOrder(req, res);
        case 'verify':
          return await handleVerifyPayment(req, res);
        default:
          return res.status(400).json({ message: 'Invalid action. Supported actions: create-order, verify' });
      }
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}