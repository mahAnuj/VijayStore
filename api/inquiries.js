// Combined inquiry endpoints
import { storage } from './_lib/storage.js';
import { insertInquirySchema } from '../shared/schema.js';
import { withAdminAuth } from './_lib/auth.js';

async function handleGetInquiries(req, res) {
  const inquiries = await storage.getInquiries();
  res.json(inquiries);
}

async function handleCreateInquiry(req, res) {
  const inquiryData = insertInquirySchema.parse(req.body);
  const inquiry = await storage.createInquiry(inquiryData);
  res.status(201).json(inquiry);
}

async function handleUpdateInquiryStatus(req, res) {
  const { id } = req.query;
  const { status } = req.body;
  const inquiry = await storage.updateInquiryStatus(id, status);
  res.json(inquiry);
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { id } = req.query;
    
    if (method === 'GET') {
      // GET /api/inquiries - admin only, get all inquiries
      return await withAdminAuth(handleGetInquiries)(req, res);
    }
    
    if (method === 'POST') {
      // POST /api/inquiries - create new inquiry
      return await handleCreateInquiry(req, res);
    }
    
    if (method === 'PUT' && id) {
      // PUT /api/inquiries?id=123 - update inquiry status (admin only)
      return await withAdminAuth(handleUpdateInquiryStatus)(req, res);
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}