import { storage } from '../_lib/storage.js';
import { insertCustomerAddressSchema } from '../../shared/schema.js';
import { withAuth } from '../_lib/auth.js';

const getAddresses = withAuth(async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await storage.getCustomerAddresses(userId);
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

const createAddress = withAuth(async (req, res) => {
  try {
    const userId = req.user.id;
    const result = insertCustomerAddressSchema.safeParse({ ...req.body, userId });
    
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }

    const address = await storage.createCustomerAddress(result.data);
    res.json(address);
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ message: "Failed to create address" });
  }
});

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getAddresses(req, res);
    case 'POST':
      return createAddress(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}