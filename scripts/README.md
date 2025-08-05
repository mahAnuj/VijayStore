# Vijay Traders Migration Scripts

This directory contains migration scripts for populating the Vijay Traders database with authentic product data from IndiaMART.

## Available Scripts

### Product Migration Script: `migrate-indiamart-products.ts`

Populates the database with 15 authentic products from the Vijay Traders IndiaMART catalog.

**Source:** https://www.indiamart.com/vijaytraders-india/products-and-services.html

#### Usage:

```bash
# Run the migration (skips if products already exist)
tsx scripts/migrate-indiamart-products.ts

# Force migration (clears existing products first)
tsx scripts/migrate-indiamart-products.ts --force

# Clear products only
tsx scripts/migrate-indiamart-products.ts --clear
```

#### Products Included:

**Solenoid Valves (3 products):**
- Airmax AJCS-01-202 Direct Acting Solenoid Valve
- Techno Brass Solenoid Operated Valve  
- 1/2 Inch Direct Acting Solenoid Valve

**Air Filter Regulators (2 products):**
- Black Pneumax Air Regulator
- 1/2 Inch Stainless Steel Air Filter Regulator

**Air Pressure Gauges (2 products):**
- 2inch H Guru Air Pressure Gauge
- 1.5inch Stainless Steel Pneumatic Pressure Gauge

**Hydraulic Ball Valves (2 products):**
- 3/4inch BSP Techno SW12 Hydraulic Ball Valve
- Hydraulic Ball Valve

**Air Blow Guns (2 products):**
- 1/4inch Techno ABG-06 Air Blow Gun
- Techno DG-10 Air Blow Gun

**Roto Seal Couplings (2 products):**
- Stainless Steel Roto Seal Coupling
- Brass Roto Seal Coupling

**Pressure Switches (2 products):**
- Danfoss KP 36 Pressure Switches
- Digital Pressure Switch

#### Features:

- ✅ Authentic product data from IndiaMART
- ✅ Real product images (500x500px from IndiaMART CDN)
- ✅ Detailed specifications in JSON format
- ✅ Proper categorization
- ✅ Stock levels and pricing
- ✅ Safe migration (won't overwrite existing data by default)
- ✅ Verification and logging
- ✅ Error handling

#### Database Schema:

The migration works with the following product schema:
- `name`: Product name
- `description`: Detailed product description
- `category`: Product category
- `price`: Price in decimal format
- `imageUrl`: Direct link to product image
- `specifications`: JSON object with technical specs
- `stock`: Available stock quantity
- `isActive`: Boolean flag for product visibility

#### Migration Safety:

- The script checks for existing products before inserting
- Use `--force` flag to clear and re-import all products
- All operations are logged for transparency
- Database errors are caught and reported