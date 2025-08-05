import { storage } from '../../server/storage.js';
import { insertProductSchema } from '../../shared/schema.js';
import { withAdminAuth } from '../_lib/auth.js';

async function getProducts(req, res) {
  try {
    const { category, search } = req.query;
    let products;
    
    if (search) {
      products = await storage.searchProducts(search);
    } else if (category) {
      products = await storage.getProductsByCategory(category);
    } else {
      products = await storage.getProducts();
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

const createProduct = withAdminAuth(async (req, res) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: "Invalid product data" });
  }
});

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}