import { storage } from '../server/storage.js';
import { insertCustomerProfileSchema } from '../shared/schema.js';
import { withAuth } from './_lib/auth.js';

const getProfile = withAuth(async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await storage.getCustomerProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

const updateProfile = withAuth(async (req, res) => {
  try {
    const userId = req.user.id;
    const result = insertCustomerProfileSchema.safeParse({ ...req.body, userId });
    
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }

    const existingProfile = await storage.getCustomerProfile(userId);
    let profile;
    
    if (existingProfile) {
      profile = await storage.updateCustomerProfile(userId, result.data);
    } else {
      profile = await storage.createCustomerProfile(result.data);
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getProfile(req, res);
    case 'POST':
      return updateProfile(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}