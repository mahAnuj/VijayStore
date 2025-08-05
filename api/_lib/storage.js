import { 
  products, orders, inquiries, users, customerProfiles, customerAddresses
} from "../../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, ilike, and } from "drizzle-orm";

export class DatabaseStorage {
  // Users (mandatory for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(userData) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer Profiles
  async getCustomerProfile(userId) {
    const [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId));
    return profile;
  }

  async createCustomerProfile(profile) {
    const [newProfile] = await db.insert(customerProfiles).values(profile).returning();
    return newProfile;
  }

  async updateCustomerProfile(userId, profile) {
    const [updatedProfile] = await db
      .update(customerProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(customerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Customer Addresses
  async getCustomerAddresses(userId) {
    return await db.select().from(customerAddresses).where(eq(customerAddresses.userId, userId));
  }

  async createCustomerAddress(address) {
    // If this is set as default, unset other defaults for this user
    if (address.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.userId, address.userId));
    }
    const [newAddress] = await db.insert(customerAddresses).values(address).returning();
    return newAddress;
  }

  async updateCustomerAddress(id, address) {
    // If this is set as default, unset other defaults for this user
    if (address.isDefault && address.userId) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.userId, address.userId));
    }
    const [updatedAddress] = await db
      .update(customerAddresses)
      .set({ ...address, updatedAt: new Date() })
      .where(eq(customerAddresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteCustomerAddress(id) {
    await db.delete(customerAddresses).where(eq(customerAddresses.id, id));
  }

  // Products
  async getProducts() {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category) {
    return await db.select().from(products).where(and(eq(products.category, category), eq(products.isActive, true)));
  }

  async searchProducts(query) {
    return await db.select().from(products).where(
      and(
        eq(products.isActive, true),
        ilike(products.name, `%${query}%`)
      )
    );
  }

  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id, product) {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id) {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Orders
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUser(userId) {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id, status) {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Inquiries
  async getInquiries() {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async createInquiry(inquiry) {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateInquiryStatus(id, status) {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry;
  }
}

export const storage = new DatabaseStorage();