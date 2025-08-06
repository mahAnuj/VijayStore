// Profile management endpoint with JWT authentication
import { neon } from '@neondatabase/serverless';
import { authenticateUser } from './_lib/jwtAuth.js';

async function handleGetProfile(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = req.userId;

    // Get user and profile data from both tables
    const [userResult, profileResult] = await Promise.all([
      sql`
        SELECT id, phone, role, first_name, last_name, email, created_at, updated_at
        FROM users 
        WHERE id = ${userId}
      `,
      sql`
        SELECT company, gst_number as gst
        FROM customer_profiles 
        WHERE user_id = ${userId}
      `
    ]);

    const user = userResult[0];
    const profile = profileResult[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      phone: user.phone,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      company: profile?.company || null,
      gst: profile?.gst || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

async function handleUpdateProfile(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = req.userId;
    const { firstName, lastName, email, company, gst } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // Update user data
    const updatedUsers = await sql`
      UPDATE users 
      SET 
        first_name = ${firstName},
        last_name = ${lastName || null},
        email = ${email || null},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, phone, role, first_name, last_name, email, created_at, updated_at
    `;

    const updatedUser = updatedUsers[0];
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update or create customer profile
    let profile;
    const existingProfile = await sql`
      SELECT id FROM customer_profiles WHERE user_id = ${userId}
    `;

    if (existingProfile.length > 0) {
      // Update existing profile
      const updatedProfiles = await sql`
        UPDATE customer_profiles 
        SET 
          company = ${company || null},
          gst_number = ${gst || null},
          updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING company, gst_number as gst
      `;
      profile = updatedProfiles[0];
    } else {
      // Create new profile
      const newProfiles = await sql`
        INSERT INTO customer_profiles (user_id, company, gst_number, created_at, updated_at)
        VALUES (${userId}, ${company || null}, ${gst || null}, NOW(), NOW())
        RETURNING company, gst_number as gst
      `;
      profile = newProfiles[0];
    }

    res.json({
      id: updatedUser.id,
      phone: updatedUser.phone,
      role: updatedUser.role,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      company: profile?.company || null,
      gstNumber: profile?.gst_number || null,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

export default async function handler(req, res) {
  const { method } = req;

  // Apply JWT authentication to all profile operations
  return authenticateUser(req, res, async () => {
    if (method === 'GET') {
      return await handleGetProfile(req, res);
    }
    
    if (method === 'PUT') {
      return await handleUpdateProfile(req, res);
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  });
}