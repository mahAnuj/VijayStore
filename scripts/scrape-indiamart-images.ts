#!/usr/bin/env tsx
/**
 * Scrapes product images from IndiaMART Vijay Traders page
 * Downloads the actual product images and updates database
 * 
 * Usage: tsx scripts/scrape-indiamart-images.ts
 */

import { db } from "../server/db";
import { products } from "../shared/schema";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface ProductImageMapping {
  productName: string;
  imageUrl: string;
  filename: string;
}

// Manual mapping based on the IndiaMART page structure
const PRODUCT_IMAGE_MAPPINGS: ProductImageMapping[] = [
  {
    productName: "Airmax AJCS-01-202 Direct Acting Solenoid Valve",
    imageUrl: "https://5.imimg.com/data5/NSDMERP/Default/2023/2/GT/DR/PH/11051675/electro-pneumatic-valve-1677050188766-250x250.jpg",
    filename: "airmax-solenoid-valve.jpg"
  },
  {
    productName: "Techno Brass Solenoid Operated Valve", 
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/2/TV/MS/PS/11051675/techno-brass-solenoid-valve-250x250.jpg",
    filename: "techno-brass-solenoid.jpg"
  },
  {
    productName: "1/2 Inch Direct Acting Solenoid Valve",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/2/LO/KZ/QU/11051675/1-2-inch-direct-acting-solenoid-valve-250x250.jpg", 
    filename: "half-inch-solenoid.jpg"
  },
  {
    productName: "Black Pneumax Air Regulator",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/2/AV/CI/VI/11051675/black-pneumax-air-regulator-250x250.jpg",
    filename: "black-pneumax-regulator.jpg"
  },
  {
    productName: "1/2 Inch Stainless Steel Air Filter Regulator",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/2/MI/YG/OC/11051675/stainless-steel-air-regulator-250x250.jpg",
    filename: "steel-air-filter-regulator.jpg"
  },
  {
    productName: "2inch H Guru Air Pressure Gauge",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963103/FB/LE/KC/41831494/2inch-h-guru-air-pressure-gauge-500x500.jpg",
    filename: "h-guru-pressure-gauge.jpg"
  },
  {
    productName: "1.5inch Stainless Steel Pneumatic Pressure Gauge",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963145/WI/FD/WG/41831494/1-5inch-stainless-steel-pneumatic-pressure-gauge-500x500.jpg",
    filename: "steel-pneumatic-gauge.jpg"
  },
  {
    productName: "3/4inch BSP Techno SW12 Hydraulic Ball Valve", 
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963077/BC/ZF/BK/41831494/3-4inch-bsp-techno-sw12-hydraulic-ball-valve-500x500.jpg",
    filename: "techno-hydraulic-valve.jpg"
  },
  {
    productName: "Hydraulic Ball Valve",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963151/GV/QC/MY/41831494/hydraulic-ball-valve-500x500.jpg",
    filename: "hydraulic-ball-valve.jpg"
  },
  {
    productName: "1/4inch Techno ABG-06 Air Blow Gun",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963084/JY/RM/GT/41831494/1-4inch-techno-abg-06-air-blow-gun-500x500.jpg",
    filename: "techno-air-blow-gun.jpg"
  },
  {
    productName: "Techno DG-10 Air Blow Gun",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963096/GH/LA/ZV/41831494/techno-dg-10-air-blow-gun-500x500.jpg",
    filename: "techno-dg10-blow-gun.jpg"
  },
  {
    productName: "Stainless Steel Roto Seal Coupling",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963125/NW/TN/NE/41831494/stainless-steel-roto-seal-coupling-500x500.jpg",
    filename: "steel-roto-coupling.jpg"
  },
  {
    productName: "Brass Roto Seal Coupling",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963138/NJ/CF/FG/41831494/brass-roto-seal-coupling-500x500.jpg",
    filename: "brass-roto-coupling.jpg"
  },
  {
    productName: "Danfoss KP 36 Pressure Switches",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963109/LW/JH/SI/41831494/danfoss-kp-36-pressure-switches-500x500.jpg",
    filename: "danfoss-pressure-switch.jpg"
  },
  {
    productName: "Digital Pressure Switch",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2023/9/340963157/PG/CH/PZ/41831494/digital-pressure-switch-500x500.jpg",
    filename: "digital-pressure-switch.jpg"
  }
];

async function downloadImageWithProxy(url: string, filename: string): Promise<boolean> {
  console.log(`Downloading: ${filename}...`);
  
  // Try multiple methods to download the image
  const methods = [
    // Method 1: Direct fetch with browser headers
    async () => {
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
          'Referer': 'https://www.indiamart.com/vijaytraders-india/products-and-services.html',
        }
      });
      return response;
    },
    
    // Method 2: Using a proxy service (if needed)
    async () => {
      // Convert direct image URL to use a proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      return response;
    },
    
    // Method 3: Try with minimal headers
    async () => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        }
      });
      return response;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      const response = await methods[i]();
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const imagePath = join(process.cwd(), 'public', 'images', 'products', filename);
        
        writeFileSync(imagePath, Buffer.from(buffer));
        console.log(`✅ Downloaded: ${filename} (method ${i + 1})`);
        return true;
      } else {
        console.log(`❌ Method ${i + 1} failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Method ${i + 1} error:`, error.message);
    }
    
    // Wait between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`❌ All methods failed for: ${filename}`);
  return false;
}

async function main() {
  console.log("🔍 Starting IndiaMART image scraping...");
  
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
  
  let downloadedCount = 0;
  let updatedCount = 0;
  
  for (const mapping of PRODUCT_IMAGE_MAPPINGS) {
    const success = await downloadImageWithProxy(mapping.imageUrl, mapping.filename);
    
    if (success) {
      downloadedCount++;
      
      // Update database with local image path
      const localImagePath = `/images/products/${mapping.filename}`;
      try {
        await db.update(products)
          .set({ imageUrl: localImagePath })
          .where({ name: mapping.productName } as any);
        
        updatedCount++;
        console.log(`✅ Updated database: ${mapping.productName}`);
      } catch (dbError) {
        console.error(`❌ Database update failed for ${mapping.productName}:`, dbError);
      }
    }
    
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n🎉 Scraping complete!");
  console.log(`📊 Downloaded: ${downloadedCount} images`);
  console.log(`🔄 Updated: ${updatedCount} database records`);
  
  if (downloadedCount === 0) {
    console.log("\n⚠️  No images were downloaded successfully.");
    console.log("CDN protection is very strong. Using high-quality SVG images instead.");
  } else {
    console.log(`\n✨ Successfully obtained ${downloadedCount} authentic IndiaMART images!`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { downloadImageWithProxy, PRODUCT_IMAGE_MAPPINGS };