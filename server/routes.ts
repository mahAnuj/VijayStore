import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../api/_lib/storage";
import { insertProductSchema, insertOrderSchema, insertInquirySchema, insertCustomerProfileSchema, insertCustomerAddressSchema } from "@shared/schema";
import path from "path";
import { existsSync } from "fs";
import Razorpay from "razorpay";
import { setupAuth, isAuthenticated, isAdmin } from "../api/_lib/replitAuth";
import { sendOTP, verifyOTP, isPhoneAuthenticated, isPhoneAdmin } from "../api/_lib/phoneAuth";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET ? new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (using phone auth instead of Replit Auth)
  // await setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ message: "Server is healthy" });
  });

  // Phone Authentication routes
  app.post("/api/auth/send-otp", async (req, res) => {
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

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!phoneNumber || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }
      
      const result = await verifyOTP(phoneNumber, otp);
      
      if (result.success && result.user) {
        (req as any).session.userId = result.user.id;
        res.json({ success: true, message: result.message, user: result.user });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isPhoneAuthenticated, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // Public product routes (no auth required)
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
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

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Admin product routes (auth required)
  app.post("/api/products", isPhoneAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isPhoneAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isPhoneAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes (auth required)
  app.get("/api/orders", isPhoneAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/my-orders", isPhoneAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser((req as any).user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isPhoneAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns this order or is admin
      if (order.userId !== (req as any).user.id && (req as any).user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isPhoneAuthenticated, async (req, res) => {
    try {
      const orderData = {
        ...insertOrderSchema.parse(req.body),
        userId: (req as any).user.id
      };
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", isPhoneAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Inquiry routes
  app.get("/api/inquiries", isPhoneAdmin, async (_req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({ message: "Failed to create inquiry" });
    }
  });

  app.put("/api/inquiries/:id/status", isPhoneAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const inquiry = await storage.updateInquiryStatus(req.params.id, status);
      res.json(inquiry);
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(400).json({ message: "Failed to update inquiry status" });
    }
  });

  // Customer Profile routes (auth required)
  app.get("/api/profile", isPhoneAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile((req as any).user.id);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isPhoneAuthenticated, async (req, res) => {
    try {
      const profileData = {
        ...insertCustomerProfileSchema.parse(req.body),
        userId: (req as any).user.id
      };
      const profile = await storage.createCustomerProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile", isPhoneAuthenticated, async (req, res) => {
    try {
      const profileData = insertCustomerProfileSchema.partial().parse(req.body);
      const profile = await storage.updateCustomerProfile((req as any).user.id, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Customer Address routes (auth required)
  app.get("/api/addresses", isPhoneAuthenticated, async (req, res) => {
    try {
      const addresses = await storage.getCustomerAddresses((req as any).user.id);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", isPhoneAuthenticated, async (req, res) => {
    try {
      const addressData = {
        ...insertCustomerAddressSchema.parse(req.body),
        userId: (req as any).user.id
      };
      const address = await storage.createCustomerAddress(addressData);
      res.status(201).json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(400).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/addresses/:id", isPhoneAuthenticated, async (req, res) => {
    try {
      const addressData = insertCustomerAddressSchema.partial().parse(req.body);
      const address = await storage.updateCustomerAddress(req.params.id, addressData);
      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(400).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", isPhoneAuthenticated, async (req, res) => {
    try {
      await storage.deleteCustomerAddress(req.params.id);
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Payment routes
  app.post("/api/payment/create-payment-intent", isPhoneAuthenticated, async (req, res) => {
    try {
      const { amount, currency = 'inr' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (STRIPE_SECRET_KEY) {
        // Stripe payment intent
        const stripe = (await import('stripe')).default(STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to paisa
          currency,
          metadata: {
            userId: (req as any).user.id
          }
        });

        res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      } else if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
        // Razorpay order
        const options = {
          amount: Math.round(amount * 100), // Convert to paisa
          currency: currency.toUpperCase(),
          receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay!.orders.create(options);
        res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: RAZORPAY_KEY_ID
        });
      } else {
        res.status(500).json({ message: "Payment gateway not configured" });
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/payment/verify", isPhoneAuthenticated, async (req, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;
      
      // Verify Razorpay signature
      const crypto = await import('crypto');
      const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET!)
        .update(orderId + "|" + paymentId)
        .digest('hex');

      if (expectedSignature === signature) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Serve uploaded images
  app.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(process.cwd(), "uploads", filename);
    
    if (existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}