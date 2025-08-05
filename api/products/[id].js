import { storage } from '../_lib/storage.js';
import { insertProductSchema } from '../../shared/schema.js';
import { withAdminAuth } from '../_lib/auth.js';

async function getProduct(req, res) {
  try {
    const { id } = req.query;
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
}

const updateProduct = withAdminAuth(async (req, res) => {
  try {
    const { id } = req.query;
    const productData = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, productData);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: "Failed to update product" });
  }
});

const deleteProduct = withAdminAuth(async (req, res) => {
  try {
    const { id } = req.query;
    await storage.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getProduct(req, res);
    case 'PUT':
      return updateProduct(req, res);
    case 'DELETE':
      return deleteProduct(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}