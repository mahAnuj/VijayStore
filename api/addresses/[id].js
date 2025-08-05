import { storage } from '../../server/storage.js';
import { insertCustomerAddressSchema } from '../../shared/schema.js';
import { withAuth } from '../_lib/auth.js';

const updateAddress = withAuth(async (req, res) => {
  try {
    const { id } = req.query;
    const result = insertCustomerAddressSchema.partial().safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }

    const address = await storage.updateCustomerAddress(id, result.data);
    res.json(address);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
});

const deleteAddress = withAuth(async (req, res) => {
  try {
    const { id } = req.query;
    await storage.deleteCustomerAddress(id);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
});

export default async function handler(req, res) {
  switch (req.method) {
    case 'PUT':
      return updateAddress(req, res);
    case 'DELETE':
      return deleteAddress(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}