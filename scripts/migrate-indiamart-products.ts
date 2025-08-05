#!/usr/bin/env tsx
/**
 * Migration script to populate Vijay Traders product catalog
 * Data sourced from: https://www.indiamart.com/vijaytraders-india/products-and-services.html
 * 
 * Usage: npm run migrate:products
 */

import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";

const INDIAMART_PRODUCTS = [
  // Solenoid Valves
  {
    name: "Airmax AJCS-01-202 Direct Acting Solenoid Valve",
    description: "High-quality direct acting solenoid valve from Airmax, suitable for industrial pneumatic applications with reliable performance and durability.",
    category: "Solenoid Valve",
    price: "2500.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2024/1/375919563/JG/HY/QY/41831494/airmax-ajcs-01-202-direct-acting-solenoid-valve-500x500.jpg",
    specifications: {
      type: "Direct Acting",
      brand: "Airmax",
      model: "AJCS-01-202",
      application: "Pneumatic"
    },
    stock: 50
  },
  {
    name: "Techno Brass Solenoid Operated Valve",
    description: "Brass construction solenoid operated valve by Techno, designed for high-pressure applications with excellent corrosion resistance.",
    category: "Solenoid Valve",
    price: "3200.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963061/RB/NK/CV/41831494/techno-brass-solenoid-operated-valve-500x500.jpg",
    specifications: {
      material: "Brass",
      brand: "Techno",
      type: "Solenoid Operated",
      pressure_rating: "High"
    },
    stock: 45
  },
  {
    name: "1/2 Inch Direct Acting Solenoid Valve",
    description: "Compact 1/2 inch direct acting solenoid valve suitable for various industrial automation and control applications.",
    category: "Solenoid Valve",
    price: "1800.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963132/PS/JE/HE/41831494/1-2-inch-direct-acting-solenoid-valve-500x500.jpg",
    specifications: {
      size: "1/2 inch",
      type: "Direct Acting",
      application: "Industrial Automation"
    },
    stock: 60
  },

  // Air Filter Regulators
  {
    name: "Black Pneumax Air Regulator",
    description: "Professional grade pneumax air regulator in black finish, providing precise pressure control for pneumatic systems.",
    category: "Air Filter Regulator",
    price: "4500.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963090/AJ/FD/JK/41831494/black-pneumax-air-regulator-500x500.jpg",
    specifications: {
      brand: "Pneumax",
      color: "Black",
      type: "Air Regulator",
      application: "Pneumatic Systems"
    },
    stock: 35
  },
  {
    name: "1/2 Inch Stainless Steel Air Filter Regulator",
    description: "Stainless steel construction air filter regulator with 1/2 inch connection, ideal for corrosive environments and food-grade applications.",
    category: "Air Filter Regulator",
    price: "5800.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963116/KP/PY/LV/41831494/1-2-inch-stainless-steel-air-filter-regulator-500x500.jpg",
    specifications: {
      material: "Stainless Steel",
      size: "1/2 inch",
      type: "Filter Regulator",
      grade: "Food Grade"
    },
    stock: 30
  },

  // Air Pressure Gauges
  {
    name: "2inch H Guru Air Pressure Gauge",
    description: "Accurate 2-inch H Guru air pressure gauge with clear dial reading, suitable for monitoring pneumatic system pressure.",
    category: "Air Pressure Gauge",
    price: "850.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963103/FB/LE/KC/41831494/2inch-h-guru-air-pressure-gauge-500x500.jpg",
    specifications: {
      brand: "H Guru",
      size: "2 inch",
      type: "Air Pressure Gauge",
      accuracy: "High"
    },
    stock: 80
  },
  {
    name: "1.5inch Stainless Steel Pneumatic Pressure Gauge",
    description: "Durable 1.5-inch stainless steel pneumatic pressure gauge designed for harsh industrial environments with long-lasting performance.",
    category: "Air Pressure Gauge",
    price: "1200.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963145/WI/FD/WG/41831494/1-5inch-stainless-steel-pneumatic-pressure-gauge-500x500.jpg",
    specifications: {
      material: "Stainless Steel",
      size: "1.5 inch",
      type: "Pneumatic Pressure Gauge",
      durability: "High"
    },
    stock: 70
  },

  // Hydraulic Ball Valves
  {
    name: "3/4inch BSP Techno SW12 Hydraulic Ball Valve",
    description: "Professional 3/4 inch BSP threaded Techno SW12 hydraulic ball valve with full port design for maximum flow capacity.",
    category: "Hydraulic Ball Valves",
    price: "6500.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963077/BC/ZF/BK/41831494/3-4inch-bsp-techno-sw12-hydraulic-ball-valve-500x500.jpg",
    specifications: {
      brand: "Techno",
      model: "SW12",
      size: "3/4 inch BSP",
      type: "Hydraulic Ball Valve",
      port: "Full Port"
    },
    stock: 25
  },
  {
    name: "Hydraulic Ball Valve",
    description: "Standard hydraulic ball valve designed for high-pressure hydraulic systems with reliable sealing and smooth operation.",
    category: "Hydraulic Ball Valves",
    price: "4200.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963151/GV/QC/MY/41831494/hydraulic-ball-valve-500x500.jpg",
    specifications: {
      type: "Hydraulic Ball Valve",
      application: "High Pressure Systems",
      operation: "Manual"
    },
    stock: 40
  },

  // Air Blow Guns
  {
    name: "1/4inch Techno ABG-06 Air Blow Gun",
    description: "Ergonomic 1/4 inch Techno ABG-06 air blow gun with comfortable grip and precise air flow control for cleaning applications.",
    category: "Air Blow Gun",
    price: "750.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963084/JY/RM/GT/41831494/1-4inch-techno-abg-06-air-blow-gun-500x500.jpg",
    specifications: {
      brand: "Techno",
      model: "ABG-06",
      size: "1/4 inch",
      application: "Cleaning",
      grip: "Ergonomic"
    },
    stock: 100
  },
  {
    name: "Techno DG-10 Air Blow Gun",
    description: "Heavy-duty Techno DG-10 air blow gun designed for industrial use with robust construction and reliable performance.",
    category: "Air Blow Gun",
    price: "950.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963096/GH/LA/ZV/41831494/techno-dg-10-air-blow-gun-500x500.jpg",
    specifications: {
      brand: "Techno",
      model: "DG-10",
      type: "Heavy Duty",
      application: "Industrial"
    },
    stock: 85
  },

  // Roto Seal Couplings
  {
    name: "Stainless Steel Roto Seal Coupling",
    description: "High-grade stainless steel roto seal coupling providing secure and leak-proof connections for pneumatic systems.",
    category: "Roto Seal Coupling",
    price: "1850.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963125/NW/TN/NE/41831494/stainless-steel-roto-seal-coupling-500x500.jpg",
    specifications: {
      material: "Stainless Steel",
      type: "Roto Seal Coupling",
      feature: "Leak Proof",
      grade: "High Grade"
    },
    stock: 60
  },
  {
    name: "Brass Roto Seal Coupling",
    description: "Brass roto seal coupling offering excellent corrosion resistance and reliable sealing for various industrial applications.",
    category: "Roto Seal Coupling",
    price: "1200.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963138/NJ/CF/FG/41831494/brass-roto-seal-coupling-500x500.jpg",
    specifications: {
      material: "Brass",
      type: "Roto Seal Coupling",
      resistance: "Corrosion Resistant",
      application: "Industrial"
    },
    stock: 75
  },

  // Pressure Switches
  {
    name: "Danfoss KP 36 Pressure Switches",
    description: "Professional Danfoss KP 36 pressure switch with adjustable set points and reliable switching for industrial automation systems.",
    category: "Pressure Switch",
    price: "3500.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963109/LW/JH/SI/41831494/danfoss-kp-36-pressure-switches-500x500.jpg",
    specifications: {
      brand: "Danfoss",
      model: "KP 36",
      type: "Pressure Switch",
      feature: "Adjustable Set Points",
      application: "Industrial Automation"
    },
    stock: 40
  },
  {
    name: "Digital Pressure Switch",
    description: "Advanced digital pressure switch with LCD display and programmable settings for precise pressure monitoring and control.",
    category: "Pressure Switch",
    price: "4800.00",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963157/PG/CH/PZ/41831494/digital-pressure-switch-500x500.jpg",
    specifications: {
      type: "Digital Pressure Switch",
      display: "LCD",
      feature: "Programmable Settings",
      function: "Monitoring and Control"
    },
    stock: 35
  }
];

async function migrateProducts() {
  console.log("🚀 Starting Vijay Traders product migration...");
  console.log(`📦 Total products to migrate: ${INDIAMART_PRODUCTS.length}`);

  try {
    // Check if products already exist
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length > 0) {
      console.log(`⚠️  Found ${existingProducts.length} existing products in database`);
      console.log("❓ Do you want to clear existing products and re-import? (y/N)");
      
      // For automated migration, we'll skip if products exist
      console.log("ℹ️  Skipping migration - products already exist");
      console.log("💡 To force re-import, manually clear the products table first");
      return;
    }

    // Insert products
    let insertedCount = 0;
    
    for (const product of INDIAMART_PRODUCTS) {
      await db.insert(products).values({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        specifications: product.specifications,
        stock: product.stock,
        isActive: true
      });
      
      insertedCount++;
      console.log(`✅ Inserted: ${product.name} (${insertedCount}/${INDIAMART_PRODUCTS.length})`);
    }

    console.log(`🎉 Migration completed successfully!`);
    console.log(`📊 Total products inserted: ${insertedCount}`);
    
    // Verify migration
    const finalCount = await db.select().from(products);
    console.log(`🔍 Verification: ${finalCount.length} products now in database`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

async function clearProducts() {
  console.log("🗑️  Clearing existing products...");
  try {
    const result = await db.delete(products);
    console.log("✅ Products cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear products:", error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clear') || args.includes('-c')) {
    await clearProducts();
    console.log("🔄 Now running migration...");
    await migrateProducts();
  } else if (args.includes('--force') || args.includes('-f')) {
    await clearProducts();
    await migrateProducts();
  } else {
    await migrateProducts();
  }
  
  process.exit(0);
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { migrateProducts, clearProducts, INDIAMART_PRODUCTS };