// Combined order endpoints  
import { storage } from './_lib/storage.js';
import { insertOrderSchema } from '../shared/schema.js';
import { isPhoneAuthenticated, withAdminAuth } from './_lib/auth.js';

async function handleGetOrders(req, res) {
  // Admin only - get all orders
  const orders = await storage.getOrders();
  res.json(orders);
}

async function handleGetMyOrders(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const orders = await storage.getOrdersByUser(authResult.userId);
  res.json(orders);
}

async function handleGetOrder(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const { id } = req.query;
  const order = await storage.getOrder(id);
  
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  
  // Check if user owns this order or is admin
  const user = await storage.getUser(authResult.userId);
  if (order.userId !== authResult.userId && user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied" });
  }
  
  res.json(order);
}

async function handleCreateOrder(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const orderData = {
    ...insertOrderSchema.parse(req.body),
    userId: authResult.userId
  };
  const order = await storage.createOrder(orderData);
  res.status(201).json(order);
}

async function handleUpdateOrderStatus(req, res) {
  const { id } = req.query;
  const { status } = req.body;
  const order = await storage.updateOrderStatus(id, status);
  res.json(order);
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    const path = req.url?.split('?')[0];
    
    if (method === 'GET' && path === '/api/orders') {
      return await withAdminAuth(handleGetOrders)(req, res);
    }
    
    if (method === 'GET' && path === '/api/orders/my-orders') {
      return await handleGetMyOrders(req, res);
    }
    
    if (method === 'GET' && path.startsWith('/api/orders/') && path.includes('/status')) {
      return await handleGetOrder(req, res);
    }
    
    if (method === 'GET' && path.startsWith('/api/orders/')) {
      return await handleGetOrder(req, res);
    }
    
    if (method === 'POST' && path === '/api/orders') {
      return await handleCreateOrder(req, res);
    }
    
    if (method === 'PUT' && path.includes('/status')) {
      return await withAdminAuth(handleUpdateOrderStatus)(req, res);
    }
    
    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}