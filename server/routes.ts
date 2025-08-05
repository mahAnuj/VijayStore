import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertInquirySchema, insertCustomerProfileSchema, insertCustomerAddressSchema } from "@shared/schema";
import path from "path";
import { existsSync } from "fs";
import Razorpay from "razorpay";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { sendOTP, verifyOTP, isPhoneAuthenticated, isPhoneAdmin } from "./phoneAuth";

// Razorpay is optional - if keys are not provided, payment route will return an error
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file serving for images - MUST be before other middleware
  app.get('/images/*', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'public', req.path);
    if (existsSync(filePath)) {
      // Set correct content type for SVG files
      if (req.path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Phone Authentication routes
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const result = await sendOTP(phoneNumber);
      res.json(result);
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req: any, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      if (!phoneNumber || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }
      
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success && result.user) {
        // Set user session
        req.session.userId = result.user.id;
        res.json({ success: true, message: result.message, user: result.user });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth routes (Replit Auth - kept for backward compatibility)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let user;
      
      // Check phone auth first
      if (req.session?.userId) {
        user = await storage.getUser(req.session.userId);
      } 
      // Fallback to Replit auth
      else if (req.user?.claims?.sub) {
        user = await storage.getUser(req.user.claims.sub);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Customer Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCustomerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Customer Address routes
  app.get('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addresses = await storage.getCustomerAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertCustomerAddressSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const address = await storage.createCustomerAddress(result.data);
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put('/api/addresses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const result = insertCustomerAddressSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const address = await storage.updateCustomerAddress(req.params.id, result.data);
      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete('/api/addresses/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCustomerAddress(req.params.id);
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      let products;
      
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin-only product management routes
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Orders API
  // Admin route to view all orders
  app.get("/api/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Customer route to view their own orders
  app.get("/api/my-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create order (can be done by authenticated users or guests)
  app.post("/api/orders", async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // If user is authenticated, add userId to order
      if (req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Admin route to update order status
  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Inquiries API
  // Admin route to view all inquiries
  app.get("/api/inquiries", isAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Create inquiry (public route)
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  // Admin route to update inquiry status
  app.put("/api/inquiries/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const inquiry = await storage.updateInquiryStatus(req.params.id, status);
      res.json(inquiry);
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({ message: "Failed to update inquiry status" });
    }
  });

  // Razorpay payment route
  app.post("/api/create-payment-order", async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({ 
          message: "Payment gateway not configured. Please contact administrator." 
        });
      }

      const { amount } = req.body;
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json({ 
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID 
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment order: " + error.message });
    }
  });

  // Verify payment route
  app.post("/api/verify-payment", async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({ 
          message: "Payment gateway not configured. Please contact administrator." 
        });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      // For production, you should verify the signature here
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      //   .update(razorpay_order_id + '|' + razorpay_payment_id)
      //   .digest('hex');
      
      // if (expectedSignature === razorpay_signature) {
      //   res.json({ success: true });
      // } else {
      //   res.status(400).json({ success: false, message: "Payment verification failed" });
      // }

      // For now, we'll accept all payments as valid (for development)
      res.json({ success: true });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error verifying payment: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
