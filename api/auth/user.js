import { storage } from '../_lib/storage.js';
import { sessionManager } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check phone auth session
    const session = sessionManager.getSessionFromRequest(req);
    
    if (!session?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await storage.getUser(session.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
}