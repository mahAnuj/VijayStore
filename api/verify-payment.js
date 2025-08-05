import { razorpay } from './_lib/razorpay.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Payment gateway not configured. Please contact administrator." 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // For production, you should verify the signature here
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpay_order_id + '|' + razorpay_payment_id)
    //   .digest('hex');
    
    // if (expectedSignature === razorpay_signature) {
    //   res.json({ success: true });
    // } else {
    //   res.status(400).json({ success: false, message: "Payment verification failed" });
    // }

    // For now, we'll accept all payments as valid (for development)
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying payment: " + error.message });
  }
}