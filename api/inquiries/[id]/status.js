import { storage } from '../../../server/storage.js';
import { withAdminAuth } from '../../_lib/auth.js';

// Admin route to update inquiry status
const updateInquiryStatus = withAdminAuth(async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;
    const inquiry = await storage.updateInquiryStatus(id, status);
    res.json(inquiry);
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ message: "Failed to update inquiry status" });
  }
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  return updateInquiryStatus(req, res);
}