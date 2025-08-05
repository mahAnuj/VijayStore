#!/usr/bin/env tsx
/**
 * Creates local product images using high-quality industrial equipment SVGs
 * and updates the database with local image paths
 * 
 * Usage: tsx scripts/create-local-product-images.ts
 */

import { db } from "../server/db";
import { products } from "../shared/schema";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// SVG templates for different product categories
const createSolenoidValveSVG = (color: string = "#4a90e2") => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b8b8b8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="100" y="150" width="200" height="100" fill="url(#metalGrad)" stroke="#666" stroke-width="2" rx="10"/>
  <circle cx="200" cy="200" r="30" fill="${color}" stroke="#333" stroke-width="2"/>
  <rect x="180" y="120" width="40" height="30" fill="#333" rx="5"/>
  <line x1="190" y1="120" x2="190" y2="80" stroke="#333" stroke-width="3"/>
  <line x1="210" y1="120" x2="210" y2="80" stroke="#333" stroke-width="3"/>
  <rect x="50" y="190" width="50" height="20" fill="url(#metalGrad)" stroke="#666" stroke-width="1"/>
  <rect x="300" y="190" width="50" height="20" fill="url(#metalGrad)" stroke="#666" stroke-width="1"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Solenoid Valve</text>
</svg>`;

const createPressureGaugeSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <circle cx="200" cy="200" r="80" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="200" cy="200" r="70" fill="none" stroke="#666" stroke-width="2"/>
  <g stroke="#333" stroke-width="2">
    <line x1="200" y1="140" x2="200" y2="150" />
    <line x1="260" y1="200" x2="250" y2="200" />
    <line x1="200" y1="260" x2="200" y2="250" />
    <line x1="140" y1="200" x2="150" y2="200" />
  </g>
  <line x1="200" y1="200" x2="230" y2="170" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="8" fill="#333"/>
  <rect x="170" y="280" width="60" height="20" fill="#333" rx="3"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Pressure Gauge</text>
</svg>`;

const createHydraulicValveSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="120" y="180" width="160" height="40" fill="#c0c0c0" stroke="#666" stroke-width="2" rx="20"/>
  <circle cx="200" cy="200" r="25" fill="#4a90e2" stroke="#333" stroke-width="2"/>
  <rect x="190" y="160" width="20" height="20" fill="#333" rx="3"/>
  <rect x="60" y="190" width="60" height="20" fill="#888" stroke="#666" stroke-width="1"/>
  <rect x="280" y="190" width="60" height="20" fill="#888" stroke="#666" stroke-width="1"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Hydraulic Ball Valve</text>
</svg>`;

const createAirBlowGunSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="80" y="180" width="120" height="40" fill="#333" rx="20"/>
  <rect x="200" y="185" width="100" height="30" fill="#666" rx="15"/>
  <circle cx="320" cy="200" r="15" fill="#4a90e2" stroke="#333" stroke-width="2"/>
  <rect x="70" y="190" width="30" height="20" fill="#e74c3c" rx="5"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Air Blow Gun</text>
</svg>`;

const createAirRegulatorSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="140" y="160" width="120" height="80" fill="#ddd" stroke="#666" stroke-width="2" rx="10"/>
  <circle cx="200" cy="140" r="20" fill="#4a90e2" stroke="#333" stroke-width="2"/>
  <rect x="180" y="100" width="40" height="40" fill="#fff" stroke="#333" stroke-width="2" rx="5"/>
  <circle cx="200" cy="120" r="15" fill="none" stroke="#666" stroke-width="2"/>
  <line x1="200" y1="110" x2="205" y2="120" stroke="#e74c3c" stroke-width="2"/>
  <rect x="70" y="190" width="70" height="20" fill="#888"/>
  <rect x="260" y="190" width="70" height="20" fill="#888"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Air Filter Regulator</text>
</svg>`;

const createCouplingSSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="120" y="180" width="160" height="40" fill="#c0c0c0" stroke="#666" stroke-width="2" rx="5"/>
  <rect x="100" y="185" width="40" height="30" fill="#999" stroke="#666" stroke-width="1"/>
  <rect x="260" y="185" width="40" height="30" fill="#999" stroke="#666" stroke-width="1"/>
  <circle cx="160" cy="200" r="8" fill="#333"/>
  <circle cx="200" cy="200" r="8" fill="#333"/>
  <circle cx="240" cy="200" r="8" fill="#333"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Roto Seal Coupling</text>
</svg>`;

const createPressureSwitchSVG = () => `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#f8f9fa"/>
  <rect x="140" y="140" width="120" height="120" fill="#333" rx="10"/>
  <rect x="150" y="150" width="100" height="60" fill="#000" rx="5"/>
  <text x="200" y="185" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#0f0">88.8</text>
  <rect x="170" y="220" width="60" height="20" fill="#666" rx="3"/>
  <circle cx="180" cy="230" r="3" fill="#0f0"/>
  <circle cx="200" cy="230" r="3" fill="#f00"/>
  <circle cx="220" cy="230" r="3" fill="#ff0"/>
  <rect x="180" y="270" width="40" height="20" fill="#888"/>
  <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Pressure Switch</text>
</svg>`;

const PRODUCT_IMAGE_CONFIGS = [
  { name: "Airmax AJCS-01-202 Direct Acting Solenoid Valve", svg: createSolenoidValveSVG("#4a90e2"), filename: "airmax-solenoid-valve.svg" },
  { name: "Techno Brass Solenoid Operated Valve", svg: createSolenoidValveSVG("#DAA520"), filename: "techno-brass-solenoid.svg" },
  { name: "1/2 Inch Direct Acting Solenoid Valve", svg: createSolenoidValveSVG("#666"), filename: "half-inch-solenoid.svg" },
  { name: "Black Pneumax Air Regulator", svg: createAirRegulatorSVG(), filename: "black-pneumax-regulator.svg" },
  { name: "1/2 Inch Stainless Steel Air Filter Regulator", svg: createAirRegulatorSVG(), filename: "steel-air-filter-regulator.svg" },
  { name: "2inch H Guru Air Pressure Gauge", svg: createPressureGaugeSVG(), filename: "h-guru-pressure-gauge.svg" },
  { name: "1.5inch Stainless Steel Pneumatic Pressure Gauge", svg: createPressureGaugeSVG(), filename: "steel-pneumatic-gauge.svg" },
  { name: "3/4inch BSP Techno SW12 Hydraulic Ball Valve", svg: createHydraulicValveSVG(), filename: "techno-hydraulic-valve.svg" },
  { name: "Hydraulic Ball Valve", svg: createHydraulicValveSVG(), filename: "hydraulic-ball-valve.svg" },
  { name: "1/4inch Techno ABG-06 Air Blow Gun", svg: createAirBlowGunSVG(), filename: "techno-air-blow-gun.svg" },
  { name: "Techno DG-10 Air Blow Gun", svg: createAirBlowGunSVG(), filename: "techno-dg10-blow-gun.svg" },
  { name: "Stainless Steel Roto Seal Coupling", svg: createCouplingSSVG(), filename: "steel-roto-coupling.svg" },
  { name: "Brass Roto Seal Coupling", svg: createCouplingSSVG(), filename: "brass-roto-coupling.svg" },
  { name: "Danfoss KP 36 Pressure Switches", svg: createPressureSwitchSVG(), filename: "danfoss-pressure-switch.svg" },
  { name: "Digital Pressure Switch", svg: createPressureSwitchSVG(), filename: "digital-pressure-switch.svg" }
];

async function main() {
  console.log("🎨 Creating local product images...");
  
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
  
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const config of PRODUCT_IMAGE_CONFIGS) {
    const imagePath = join(imagesDir, config.filename);
    
    try {
      // Write SVG file
      writeFileSync(imagePath, config.svg);
      createdCount++;
      console.log(`✅ Created: ${config.filename}`);
      
      // Update database with local image path
      const localImagePath = `/images/products/${config.filename}`;
      const updateResult = await db.update(products)
        .set({ imageUrl: localImagePath })
        .where({ name: config.name } as any);
      
      updatedCount++;
      console.log(`🔄 Updated database: ${config.name}`);
      
    } catch (error) {
      console.error(`❌ Error creating ${config.filename}:`, error);
    }
  }
  
  console.log("\n🎉 Image creation complete!");
  console.log(`🎨 Created: ${createdCount} SVG images`);
  console.log(`🔄 Updated: ${updatedCount} database records`);
  console.log("\n📍 Images are now stored locally and served from /images/products/");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}