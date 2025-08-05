import { storage } from '../server/storage.js';
import { withAuth } from './_lib/auth.js';

// Customer route to view their own orders
const getMyOrders = withAuth(async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await storage.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  return getMyOrders(req, res);
}