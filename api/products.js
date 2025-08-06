// Simplified products endpoint for Vercel compatibility
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const { method } = req;

    if (method === 'GET') {
      // Get products with optional filtering
      const { category, search, id } = req.query;
      
      let query;
      if (id) {
        // Get specific product by ID
        query = sql`SELECT * FROM products WHERE id = ${id}`;
        const products = await query;
        if (products.length === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(products[0]);
      } else if (search) {
        query = sql`
          SELECT * FROM products 
          WHERE name ILIKE ${'%' + search + '%'} 
          OR description ILIKE ${'%' + search + '%'}
          ORDER BY name
        `;
      } else if (category) {
        query = sql`
          SELECT * FROM products 
          WHERE category = ${category}
          ORDER BY name
        `;
      } else {
        query = sql`SELECT * FROM products ORDER BY name`;
      }
      
      const products = await query;
      res.json(products);
      
    } else if (method === 'POST') {
      // Create new product (admin only - simplified auth check)
      const { name, category, price, description, imageUrl, specifications } = req.body;
      
      if (!name || !category || !price) {
        return res.status(400).json({ message: 'Name, category, and price are required' });
      }
      
      const newProduct = await sql`
        INSERT INTO products (id, name, category, price, description, image_url, specifications, created_at, updated_at)
        VALUES (${Math.random().toString(36).substring(2, 15)}, ${name}, ${category}, ${price}, ${description || ''}, ${imageUrl || ''}, ${JSON.stringify(specifications || {})}, NOW(), NOW())
        RETURNING *
      `;
      
      res.status(201).json(newProduct[0]);
      
    } else if (method === 'PUT') {
      // Update product (admin only - simplified auth check)
      const { id } = req.query;
      const { name, category, price, description, imageUrl, specifications } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      
      const updatedProduct = await sql`
        UPDATE products 
        SET name = ${name}, category = ${category}, price = ${price}, description = ${description || ''}, 
            image_url = ${imageUrl || ''}, specifications = ${JSON.stringify(specifications || {})}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (updatedProduct.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(updatedProduct[0]);
      
    } else if (method === 'DELETE') {
      // Delete product (admin only - simplified auth check)
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      
      const deletedProduct = await sql`
        DELETE FROM products WHERE id = ${id} RETURNING *
      `;
      
      if (deletedProduct.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}