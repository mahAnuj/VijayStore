// Product seeding endpoint for Vercel
import { storage } from './_lib/storage.js';

const products = [
  {
    id: 'f02dc4d7-af26-43f7-8933-8dbec2b213f0',
    name: 'Airmax Solenoid Valve 2/2 Way',
    description: 'High-quality pneumatic solenoid valve for industrial automation applications. Features reliable operation and long service life.',
    category: 'Solenoid Valves',
    price: '1250.00',
    imageUrl: '/api/images/airmax-solenoid-valve.jpg',
    specifications: {
      "Port Size": "1/4 inch",
      "Pressure Range": "0-10 bar",
      "Media": "Compressed Air",
      "Voltage": "24V DC",
      "Material": "Brass Body"
    },
    stock: 25,
    isActive: true
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Techno Air Blow Gun ABG-06',
    description: 'Professional pneumatic air blow gun for cleaning and drying applications. Ergonomic design with adjustable air flow.',
    category: 'Air Blow Guns',
    price: '850.00',
    imageUrl: '/api/images/techno-air-blow-gun.jpg',
    specifications: {
      "Inlet Size": "1/4 inch BSP",
      "Maximum Pressure": "10 bar",
      "Material": "Aluminum Body",
      "Weight": "250g"
    },
    stock: 40,
    isActive: true
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    name: 'Pneumax Air Filter Regulator',
    description: 'Precision air filter regulator for pneumatic systems. Removes moisture and particles while maintaining consistent pressure.',
    category: 'Air Filter Regulators',
    price: '2100.00',
    imageUrl: '/api/images/pneumax-filter-regulator.jpg',
    specifications: {
      "Port Size": "1/2 inch",
      "Pressure Range": "0.5-10 bar",
      "Flow Rate": "1200 L/min",
      "Filtration": "5 micron",
      "Drain": "Manual"
    },
    stock: 15,
    isActive: true
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    name: 'Stainless Steel Roto Seal Coupling',
    description: 'Durable stainless steel rotary coupling for pneumatic applications. Self-sealing design prevents air leakage.',
    category: 'Roto Seal Couplings',
    price: '750.00',
    imageUrl: '/api/images/ss-roto-seal-coupling.jpg',
    specifications: {
      "Material": "SS 316",
      "Size": "1/4 inch",
      "Working Pressure": "15 bar",
      "Temperature Range": "-20°C to 180°C"
    },
    stock: 30,
    isActive: true
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    name: 'H Guru Pressure Gauge 0-16 Bar',
    description: 'High-accuracy pressure gauge for pneumatic and hydraulic systems. Clear dial face with precise markings.',
    category: 'Pressure Gauges',
    price: '450.00',
    imageUrl: '/api/images/h-guru-pressure-gauge.jpg',
    specifications: {
      "Range": "0-16 bar",
      "Accuracy": "±1.6%",
      "Dial Size": "63mm",
      "Connection": "1/4 inch BSP",
      "Case Material": "Steel"
    },
    stock: 50,
    isActive: true
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    name: 'Danfoss KP 36 Pressure Switch',
    description: 'Reliable pressure switch for automatic control applications. Adjustable set point with differential control.',
    category: 'Pressure Switches',
    price: '1850.00',
    imageUrl: '/api/images/danfoss-pressure-switch.jpg',
    specifications: {
      "Pressure Range": "0.5-8 bar",
      "Switch Type": "SPDT",
      "Connection": "1/4 inch BSP",
      "Electrical Rating": "16A/250V",
      "Adjustment": "External"
    },
    stock: 20,
    isActive: true
  },
  {
    id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
    name: 'Techno Hydraulic Ball Valve SW12',
    description: 'Heavy-duty hydraulic ball valve for high-pressure applications. Chrome-plated brass construction.',
    category: 'Hydraulic Ball Valves',
    price: '1650.00',
    imageUrl: '/api/images/techno-hydraulic-valve.jpg',
    specifications: {
      "Size": "1/2 inch",
      "Working Pressure": "200 bar",
      "Material": "Chrome Plated Brass",
      "Port": "Full Port",
      "Seals": "Viton"
    },
    stock: 18,
    isActive: true
  },
  {
    id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
    name: 'Techno Solenoid Valve 5/2 Way',
    description: 'Multi-position solenoid valve for complex pneumatic control systems. Double acting with spring return.',
    category: 'Solenoid Valves',
    price: '2250.00',
    imageUrl: '/api/images/techno-solenoid-valve-5-2.jpg',
    specifications: {
      "Port Size": "1/4 inch",
      "Positions": "5/2 Way",
      "Voltage": "220V AC",
      "Flow Rate": "800 L/min",
      "Material": "Aluminum Body"
    },
    stock: 12,
    isActive: true
  },
  {
    id: 'h8i9j0k1-l2m3-4567-hijk-890123456789',
    name: 'Techno Air Blow Gun DG-10',
    description: 'Industrial-grade air blow gun with safety trigger. Extended nozzle for hard-to-reach areas.',
    category: 'Air Blow Guns',
    price: '1100.00',
    imageUrl: '/api/images/techno-air-blow-gun-dg10.jpg',
    specifications: {
      "Inlet Size": "1/4 inch BSP",
      "Nozzle Length": "150mm",
      "Maximum Pressure": "12 bar",
      "Material": "Steel Body",
      "Safety": "Trigger Lock"
    },
    stock: 35,
    isActive: true
  },
  {
    id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890',
    name: 'Stainless Steel Air Filter Regulator',
    description: 'Corrosion-resistant filter regulator for harsh environments. Food-grade stainless steel construction.',
    category: 'Air Filter Regulators',
    price: '3200.00',
    imageUrl: '/api/images/ss-air-filter-regulator.jpg',
    specifications: {
      "Material": "SS 316L",
      "Port Size": "1/2 inch",
      "Pressure Range": "1-16 bar",
      "Flow Rate": "1500 L/min",
      "Temperature": "-40°C to 150°C"
    },
    stock: 8,
    isActive: true
  },
  {
    id: 'j0k1l2m3-n4o5-6789-jklm-012345678901',
    name: 'Brass Roto Seal Coupling',
    description: 'Economic brass rotary coupling for general pneumatic applications. Compact design with reliable sealing.',
    category: 'Roto Seal Couplings',
    price: '550.00',
    imageUrl: '/api/images/brass-roto-seal-coupling.jpg',
    specifications: {
      "Material": "Brass",
      "Size": "1/4 inch",
      "Working Pressure": "10 bar",
      "Temperature Range": "0°C to 80°C"
    },
    stock: 45,
    isActive: true
  },
  {
    id: 'k1l2m3n4-o5p6-7890-klmn-123456789012',
    name: 'Stainless Steel Pressure Gauge',
    description: 'Premium stainless steel pressure gauge for demanding applications. Glycerin-filled for vibration damping.',
    category: 'Pressure Gauges',
    price: '850.00',
    imageUrl: '/api/images/ss-pressure-gauge.jpg',
    specifications: {
      "Range": "0-25 bar",
      "Accuracy": "±1%",
      "Dial Size": "100mm",
      "Material": "SS 316",
      "Filling": "Glycerin"
    },
    stock: 25,
    isActive: true
  },
  {
    id: 'l2m3n4o5-p6q7-8901-lmno-234567890123',
    name: 'Digital Pressure Switch',
    description: 'Modern digital pressure switch with LED display. Programmable set points and alarm functions.',
    category: 'Pressure Switches',
    price: '2750.00',
    imageUrl: '/api/images/digital-pressure-switch.jpg',
    specifications: {
      "Display": "LED Digital",
      "Range": "0-100 bar",
      "Accuracy": "±0.5%",
      "Output": "PNP/NPN",
      "Programming": "Push Button"
    },
    stock: 15,
    isActive: true
  },
  {
    id: 'm3n4o5p6-q7r8-9012-mnop-345678901234',
    name: 'Airmax Solenoid Valve 3/2 Way',
    description: 'Compact 3-way solenoid valve for pneumatic control circuits. Energy-efficient design with low power consumption.',
    category: 'Solenoid Valves',
    price: '1450.00',
    imageUrl: '/api/images/airmax-solenoid-valve-3-2.jpg',
    specifications: {
      "Port Size": "1/8 inch",
      "Positions": "3/2 Way",
      "Voltage": "12V DC",
      "Flow Rate": "400 L/min",
      "Power": "3W"
    },
    stock: 20,
    isActive: true
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check if products already exist
    const existingProducts = await storage.getProducts();
    if (existingProducts.length > 0) {
      return res.json({ 
        message: `Found ${existingProducts.length} existing products`,
        products: existingProducts.length 
      });
    }
    
    // Insert products
    const insertedProducts = [];
    for (const product of products) {
      const inserted = await storage.createProduct(product);
      insertedProducts.push(inserted);
    }
    
    // Create admin user if not exists
    const adminPhone = '+917878787878';
    try {
      await storage.createUser({
        id: 'admin-user-id',
        phone: adminPhone,
        role: 'admin'
      });
    } catch (error) {
      // User probably already exists
    }
    
    res.json({ 
      message: `Successfully seeded ${insertedProducts.length} products and admin user`,
      products: insertedProducts.length,
      categories: [...new Set(products.map(p => p.category))]
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Failed to seed products', error: error.message });
  }
}