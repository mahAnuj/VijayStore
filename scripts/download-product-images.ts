#!/usr/bin/env tsx
/**
 * Script to download authentic product images from IndiaMART and store them locally
 * Updates the database with local image paths
 * 
 * Usage: tsx scripts/download-product-images.ts
 */

import { db } from "../server/db";
import { products } from "../shared/schema";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Original IndiaMART image URLs
const INDIAMART_IMAGE_URLS = {
  "Airmax AJCS-01-202 Direct Acting Solenoid Valve": "https://5.imimg.com/data5/SELLER/Default/2024/1/375919563/JG/HY/QY/41831494/airmax-ajcs-01-202-direct-acting-solenoid-valve-500x500.jpg",
  "Techno Brass Solenoid Operated Valve": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963061/RB/NK/CV/41831494/techno-brass-solenoid-operated-valve-500x500.jpg",
  "1/2 Inch Direct Acting Solenoid Valve": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963132/PS/JE/HE/41831494/1-2-inch-direct-acting-solenoid-valve-500x500.jpg",
  "Black Pneumax Air Regulator": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963090/AJ/FD/JK/41831494/black-pneumax-air-regulator-500x500.jpg",
  "1/2 Inch Stainless Steel Air Filter Regulator": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963116/KP/PY/LV/41831494/1-2-inch-stainless-steel-air-filter-regulator-500x500.jpg",
  "2inch H Guru Air Pressure Gauge": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963103/FB/LE/KC/41831494/2inch-h-guru-air-pressure-gauge-500x500.jpg",
  "1.5inch Stainless Steel Pneumatic Pressure Gauge": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963145/WI/FD/WG/41831494/1-5inch-stainless-steel-pneumatic-pressure-gauge-500x500.jpg",
  "3/4inch BSP Techno SW12 Hydraulic Ball Valve": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963077/BC/ZF/BK/41831494/3-4inch-bsp-techno-sw12-hydraulic-ball-valve-500x500.jpg",
  "Hydraulic Ball Valve": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963151/GV/QC/MY/41831494/hydraulic-ball-valve-500x500.jpg",
  "1/4inch Techno ABG-06 Air Blow Gun": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963084/JY/RM/GT/41831494/1-4inch-techno-abg-06-air-blow-gun-500x500.jpg",
  "Techno DG-10 Air Blow Gun": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963096/GH/LA/ZV/41831494/techno-dg-10-air-blow-gun-500x500.jpg",
  "Stainless Steel Roto Seal Coupling": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963125/NW/TN/NE/41831494/stainless-steel-roto-seal-coupling-500x500.jpg",
  "Brass Roto Seal Coupling": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963138/NJ/CF/FG/41831494/brass-roto-seal-coupling-500x500.jpg",
  "Danfoss KP 36 Pressure Switches": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963109/LW/JH/SI/41831494/danfoss-kp-36-pressure-switches-500x500.jpg",
  "Digital Pressure Switch": "https://5.imimg.com/data5/SELLER/Default/2023/9/340963157/PG/CH/PZ/41831494/digital-pressure-switch-500x500.jpg"
};

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    console.log(`Downloading: ${filename}...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': 'https://www.indiamart.com/vijaytraders-india/',
        'Origin': 'https://www.indiamart.com'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to download ${filename}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const imagePath = join(process.cwd(), 'public', 'images', 'products', filename);
    
    writeFileSync(imagePath, Buffer.from(buffer));
    console.log(`✅ Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error downloading ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log("🖼️  Starting product image download...");
  
  // Create directories
  const imagesDir = join(process.cwd(), 'public', 'images', 'products');
  try {
    mkdirSync(join(process.cwd(), 'public'), { recursive: true });
    mkdirSync(join(process.cwd(), 'public', 'images'), { recursive: true });
    mkdirSync(imagesDir, { recursive: true });
    console.log("📁 Created image directories");
  } catch (error) {
    // Directory might already exist
  }
  
  // Get all products from database
  const allProducts = await db.select().from(products);
  console.log(`📦 Found ${allProducts.length} products in database`);
  
  let downloadedCount = 0;
  let updatedCount = 0;
  
  for (const product of allProducts) {
    const originalUrl = INDIAMART_IMAGE_URLS[product.name as keyof typeof INDIAMART_IMAGE_URLS];
    
    if (!originalUrl) {
      console.log(`⚠️  No IndiaMART URL found for: ${product.name}`);
      continue;
    }
    
    const filename = `${sanitizeFilename(product.name)}.jpg`;
    const success = await downloadImage(originalUrl, filename);
    
    if (success) {
      downloadedCount++;
      
      // Update database with local image path
      const localImagePath = `/images/products/${filename}`;
      await db.update(products)
        .set({ imageUrl: localImagePath })
        .where({ id: product.id } as any);
      
      updatedCount++;
      console.log(`✅ Updated database: ${product.name} -> ${localImagePath}`);
    }
    
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n🎉 Download complete!");
  console.log(`📊 Downloaded: ${downloadedCount} images`);
  console.log(`🔄 Updated: ${updatedCount} database records`);
  
  if (downloadedCount === 0) {
    console.log("\n⚠️  No images were downloaded successfully.");
    console.log("This might be due to IndiaMART's CDN protection.");
    console.log("Consider manually downloading images or using alternative sources.");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { downloadImage, INDIAMART_IMAGE_URLS };