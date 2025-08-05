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
    const path = req.url?.split('?')[0];
    
    if (method === 'GET' && path === '/api/inquiries') {
      return await withAdminAuth(handleGetInquiries)(req, res);
    }
    
    if (method === 'POST' && path === '/api/inquiries') {
      return await handleCreateInquiry(req, res);
    }
    
    if (method === 'PUT' && path.includes('/status')) {
      return await withAdminAuth(handleUpdateInquiryStatus)(req, res);
    }
    
    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}