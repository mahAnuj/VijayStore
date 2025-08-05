// Combined address endpoints
import { storage } from './_lib/storage.js';
import { insertCustomerAddressSchema } from '../shared/schema.js';
import { isPhoneAuthenticated } from './_lib/auth.js';

async function handleGetAddresses(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const addresses = await storage.getCustomerAddresses(authResult.userId);
  res.json(addresses);
}

async function handleCreateAddress(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const addressData = {
    ...insertCustomerAddressSchema.parse(req.body),
    userId: authResult.userId
  };
  const address = await storage.createCustomerAddress(addressData);
  res.status(201).json(address);
}

async function handleUpdateAddress(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const { id } = req.query;
  const addressData = insertCustomerAddressSchema.partial().parse(req.body);
  const address = await storage.updateCustomerAddress(id, addressData);
  res.json(address);
}

async function handleDeleteAddress(req, res) {
  const authResult = await isPhoneAuthenticated(req);
  if (!authResult.success) {
    return res.status(401).json({ message: authResult.message });
  }
  
  const { id } = req.query;
  await storage.deleteCustomerAddress(id);
  res.json({ message: "Address deleted successfully" });
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    const path = req.url?.split('?')[0];
    
    if (method === 'GET' && path === '/api/addresses') {
      return await handleGetAddresses(req, res);
    }
    
    if (method === 'POST' && path === '/api/addresses') {
      return await handleCreateAddress(req, res);
    }
    
    if (method === 'PUT' && path.startsWith('/api/addresses/')) {
      return await handleUpdateAddress(req, res);
    }
    
    if (method === 'DELETE' && path.startsWith('/api/addresses/')) {
      return await handleDeleteAddress(req, res);
    }
    
    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('Address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}