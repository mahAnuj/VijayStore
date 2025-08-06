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
    const { id } = req.query;
    
    if (method === 'GET') {
      // GET /api/addresses - get user's addresses
      return await handleGetAddresses(req, res);
    }
    
    if (method === 'POST') {
      // POST /api/addresses - create new address
      return await handleCreateAddress(req, res);
    }
    
    if (method === 'PUT' && id) {
      // PUT /api/addresses?id=123 - update address
      return await handleUpdateAddress(req, res);
    }
    
    if (method === 'DELETE' && id) {
      // DELETE /api/addresses?id=123 - delete address
      return await handleDeleteAddress(req, res);
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}