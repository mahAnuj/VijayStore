// Simple storage interface for local development
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const storage = {
  async getProducts() {
    return await sql`SELECT * FROM products ORDER BY name`;
  },
  
  async getProductsByCategory(category) {
    return await sql`SELECT * FROM products WHERE category = ${category} ORDER BY name`;
  },
  
  async searchProducts(search) {
    return await sql`
      SELECT * FROM products 
      WHERE name ILIKE ${'%' + search + '%'} 
      OR description ILIKE ${'%' + search + '%'}
      ORDER BY name
    `;
  },
  
  async getProduct(id) {
    const products = await sql`SELECT * FROM products WHERE id = ${id}`;
    return products[0] || null;
  }
};