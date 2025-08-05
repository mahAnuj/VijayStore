import { storage } from '../../../server/storage.js';
import { withAdminAuth } from '../../_lib/auth.js';

// Admin route to update order status
const updateOrderStatus = withAdminAuth(async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;
    const order = await storage.updateOrderStatus(id, status);
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  return updateOrderStatus(req, res);
}