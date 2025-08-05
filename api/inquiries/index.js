import { storage } from '../../server/storage.js';
import { insertInquirySchema } from '../../shared/schema.js';
import { withAdminAuth } from '../_lib/auth.js';

// Admin route to view all inquiries
const getInquiries = withAdminAuth(async (req, res) => {
  try {
    const inquiries = await storage.getInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
});

// Create inquiry (public route)
async function createInquiry(req, res) {
  try {
    const inquiryData = insertInquirySchema.parse(req.body);
    const inquiry = await storage.createInquiry(inquiryData);
    res.status(201).json(inquiry);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(400).json({ message: "Invalid inquiry data" });
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getInquiries(req, res);
    case 'POST':
      return createInquiry(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}