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

    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating payment order: " + error.message });
  }
}