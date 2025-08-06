# JWT Authentication Implementation

## Overview

This document outlines the JWT-based authentication system implemented for the VijayStore project, designed to work with Vercel's serverless environment.

## Authentication Strategy

### 🔐 **Route Protection Levels**

We have three levels of route protection:

1. **Public Routes** - No authentication required
2. **Protected Routes** - JWT token required
3. **Admin Routes** - JWT token + admin role required

### 📋 **Route Classification**

#### **Public Routes** (No JWT Required)
```
GET  /api/products          # Browse products
GET  /api/products?id=123   # Get specific product
POST /api/auth              # Send OTP (action: send-otp)
POST /api/auth              # Verify OTP (action: verify-otp)
```

#### **Protected Routes** (JWT Required)
```
GET  /api/auth              # Get current user info
GET  /api/orders?action=my-orders  # Get user's orders
GET  /api/orders?id=123     # Get specific order (if user owns it)
POST /api/orders            # Create new order
GET  /api/profile           # Get user profile
PUT  /api/profile           # Update user profile
GET  /api/addresses         # Get user addresses
POST /api/addresses         # Create address
PUT  /api/addresses         # Update address
DELETE /api/addresses       # Delete address
POST /api/inquiries         # Create inquiry
GET  /api/payments          # Get payment history
```

#### **Admin Routes** (JWT + Admin Role Required)
```
GET  /api/orders            # Get all orders (admin only)
PUT  /api/orders            # Update order status
POST /api/products          # Create product
PUT  /api/products          # Update product
DELETE /api/products        # Delete product
```

### 🛡️ **Implementation Pattern**

#### **For Public Routes**
```javascript
export default async function handler(req, res) {
  // No authentication middleware needed
  // Handle request directly
}
```

#### **For Protected Routes**
```javascript
import { authenticateUser } from './_lib/jwtAuth.js';

export default async function handler(req, res) {
  // Apply authentication middleware
  return authenticateUser(req, res, async () => {
    // Handle authenticated request
    // req.userId is available here
  });
}
```

#### **For Admin Routes**
```javascript
import { authenticateUser, authenticateAdmin } from './_lib/jwtAuth.js';

export default async function handler(req, res) {
  // Apply both authentication and admin middleware
  return authenticateUser(req, res, () => {
    return authenticateAdmin(req, res, async () => {
      // Handle admin request
      // req.userId is available here
    });
  });
}
```

## Practical Examples

### **Example 1: Public Product Listing**
```javascript
// api/products.js - Public product browsing
export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    // Public route - no authentication needed
    const { category, search, id } = req.query;
    
    // Handle product retrieval logic
    const products = await getProducts({ category, search, id });
    res.json(products);
  }
  
  // Admin operations require authentication
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return authenticateUser(req, res, () => {
      return authenticateAdmin(req, res, async () => {
        // Admin-only product management
        // req.userId and req.userRole available
      });
    });
  }
}
```

### **Example 2: Protected User Profile**
```javascript
// api/profile.js - User profile management
import { authenticateUser } from './_lib/jwtAuth.js';

export default async function handler(req, res) {
  const { method } = req;
  
  // All profile operations require authentication
  return authenticateUser(req, res, async () => {
    if (method === 'GET') {
      // Get user profile
      const profile = await getUserProfile(req.userId);
      res.json(profile);
    }
    
    if (method === 'PUT') {
      // Update user profile
      const updatedProfile = await updateUserProfile(req.userId, req.body);
      res.json(updatedProfile);
    }
  });
}
```

### **Example 3: Mixed Access Orders**
```javascript
// api/orders.js - Mixed public/protected/admin access
import { authenticateUser, authenticateAdmin, optionalAuth } from './_lib/jwtAuth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { action, id } = req.query;
  
  if (method === 'GET') {
    if (!action && !id) {
      // GET /api/orders - Admin only (all orders)
      return authenticateUser(req, res, () => {
        return authenticateAdmin(req, res, async () => {
          const allOrders = await getAllOrders();
          res.json(allOrders);
        });
      });
    }
    
    if (action === 'my-orders') {
      // GET /api/orders?action=my-orders - User's own orders
      return authenticateUser(req, res, async () => {
        const userOrders = await getUserOrders(req.userId);
        res.json(userOrders);
      });
    }
    
    if (id) {
      // GET /api/orders?id=123 - Specific order (if user owns it or is admin)
      return authenticateUser(req, res, async () => {
        const order = await getOrder(id);
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if user owns this order or is admin
        const isOwner = order.userId === req.userId;
        const isAdmin = await isUserAdmin(req.userId);
        
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(order);
      });
    }
  }
  
  if (method === 'POST') {
    // POST /api/orders - Create order (authenticated users)
    return authenticateUser(req, res, async () => {
      const newOrder = await createOrder({ ...req.body, userId: req.userId });
      res.status(201).json(newOrder);
    });
  }
}
```

### **Example 4: Optional Authentication**
```javascript
// api/products.js - Optional authentication for enhanced features
import { optionalAuth } from './_lib/jwtAuth.js';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    // Apply optional authentication
    return optionalAuth(req, res, async () => {
      const { id } = req.query;
      const product = await getProduct(id);
      
      // Add user-specific data if authenticated
      if (req.userId) {
        const userPreferences = await getUserPreferences(req.userId);
        product.recommended = userPreferences.recommended;
      }
      
      res.json(product);
    });
  }
}
```

## Current Implementation Status

### ✅ **Completed**
- JWT token generation and verification
- Database-based OTP storage
- Authentication middleware (`api/_lib/jwtAuth.js`)
- Frontend JWT token management
- `/api/auth` endpoint with JWT flow

### 🔄 **Needs Update**
- `/api/products` - Currently public, needs admin protection for POST/PUT/DELETE
- `/api/orders` - Using old auth system, needs JWT middleware
- `/api/profile` - Needs JWT middleware
- `/api/addresses` - Needs JWT middleware  
- `/api/inquiries` - Needs JWT middleware
- `/api/payments` - Needs JWT middleware

## Next Steps

1. **Update API Endpoints** - Apply JWT middleware to protected routes
2. **Add Role-Based Access** - Implement proper admin role checking
3. **Error Handling** - Standardize authentication error responses
4. **Testing** - Verify all routes work with proper authentication

## Environment Variables

```bash
# Required for JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Required for database
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Schema

### OTP Table
```sql
CREATE TABLE IF NOT EXISTS otps (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Integration

### Token Management
```typescript
// Automatic token inclusion in all API requests
const token = localStorage.getItem('auth_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Authentication Hook
```typescript
const { user, isAuthenticated, sendOtpMutation, verifyOtpMutation, logout } = useAuth();
```

## Security Considerations

1. **JWT Secret** - Use a strong, unique secret in production
2. **Token Expiration** - Tokens expire after 24 hours
3. **HTTPS Only** - Always use HTTPS in production
4. **Token Storage** - Tokens stored in localStorage (consider httpOnly cookies for enhanced security)
5. **Role Validation** - Always verify user roles on the server side

## Migration Guide

### From Session-Based to JWT

1. **Remove Session Dependencies**
   - Delete session storage code
   - Remove cookie-based authentication
   - Update frontend to use JWT tokens

2. **Update API Calls**
   - Add `Authorization: Bearer <token>` headers
   - Handle 401 responses for token expiration
   - Implement token refresh logic if needed

3. **Database Changes**
   - Create OTP table for persistent storage
   - Ensure user table has role field
   - Run migration scripts

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if JWT token is present in Authorization header
   - Verify token hasn't expired
   - Ensure JWT_SECRET is set correctly

2. **OTP Not Working**
   - Verify DATABASE_URL is configured
   - Check if OTP table exists
   - Ensure OTP expiration logic is working

3. **Role-Based Access Denied**
   - Verify user has correct role in database
   - Check admin middleware implementation
   - Ensure role checking logic is correct 