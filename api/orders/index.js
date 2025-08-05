import { storage } from '../../server/storage.js';
import { insertOrderSchema } from '../../shared/schema.js';
import { withAdminAuth, isPhoneAuthenticated } from '../_lib/auth.js';

// Admin route to view all orders
const getOrders = withAdminAuth(async (req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Create order (can be done by authenticated users or guests)
async function createOrder(req, res) {
  try {
    const orderData = insertOrderSchema.parse(req.body);
    
    // If user is authenticated, add userId to order
    const { authenticated, user } = await isPhoneAuthenticated(req);
    if (authenticated && user) {
      orderData.userId = user.id;
    }
    
    const order = await storage.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ message: "Invalid order data" });
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getOrders(req, res);
    case 'POST':
      return createOrder(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}