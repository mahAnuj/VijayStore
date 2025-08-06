# API Updates for Vercel Deployment

## Overview
All API endpoints have been updated to work with Vercel's serverless functions. The frontend API calls have been updated to match the new structure.

## API Changes Summary

### 1. Authentication (`/api/auth`)
- **POST** `/api/auth` with `action` in body
- **GET** `/api/auth` for user info

### 2. Products (`/api/products`)
- **GET** `/api/products` - list all products
- **GET** `/api/products?id=123` - get specific product
- **GET** `/api/products?category=valves` - filter by category
- **GET** `/api/products?search=valve` - search products
- **POST** `/api/products` - create product (admin)
- **PUT** `/api/products?id=123` - update product (admin)
- **DELETE** `/api/products?id=123` - delete product (admin)

### 3. Orders (`/api/orders`)
- **GET** `/api/orders` - get all orders (admin)
- **GET** `/api/orders?action=my-orders` - get user's orders
- **GET** `/api/orders?id=123` - get specific order
- **POST** `/api/orders` - create order
- **PUT** `/api/orders` - update order status (admin)

### 4. Payments (`/api/payments`)
- **POST** `/api/payments` with `action: "create-order"`
- **POST** `/api/payments` with `action: "verify"`

### 5. Addresses (`/api/addresses`)
- **GET** `/api/addresses` - get user's addresses
- **POST** `/api/addresses` - create address
- **PUT** `/api/addresses?id=123` - update address
- **DELETE** `/api/addresses?id=123` - delete address

### 6. Inquiries (`/api/inquiries`)
- **GET** `/api/inquiries` - get all inquiries (admin)
- **POST** `/api/inquiries` - create inquiry
- **PUT** `/api/inquiries?id=123` - update status (admin)

### 7. Profile (`/api/profile`)
- **GET** `/api/profile` - get user profile
- **POST** `/api/profile` - create/update profile

## Frontend Changes Made

### 1. Phone Login (`client/src/pages/phone-login.tsx`)
```javascript
// Before
const res = await apiRequest('POST', '/api/auth/send-otp', { phoneNumber: phone });

// After
const res = await apiRequest('POST', '/api/auth', { action: 'send-otp', phoneNumber: phone });
```

### 2. Header Logout (`client/src/components/header.tsx`)
```javascript
// Before
fetch('/api/auth/logout', { method: 'POST' })

// After
fetch('/api/auth', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'logout' })
})
```

### 3. Checkout Payments (`client/src/pages/checkout.tsx`)
```javascript
// Before
const paymentRes = await apiRequest("POST", "/api/payments/create-order", { amount });

// After
const paymentRes = await apiRequest("POST", "/api/payments", {
  action: "create-order",
  amount
});
```

### 4. Profile Orders (`client/src/pages/profile.tsx`)
```javascript
// Before
queryKey: ["/api/orders/my-orders"]

// After
queryKey: ["/api/orders?action=my-orders"]
```

### 5. Admin Panel (`client/src/components/admin-panel.tsx`)
```javascript
// Before
await apiRequest("PUT", `/api/products/${id}`, data);
await apiRequest("DELETE", `/api/products/${id}`);

// After
await apiRequest("PUT", `/api/products?id=${id}`, data);
await apiRequest("DELETE", `/api/products?id=${id}`);
```

### 6. Product Detail (`client/src/pages/product-detail.tsx`)
```javascript
// Before
queryKey: [`/api/products/${id}`]

// After
queryKey: [`/api/products?id=${id}`]
```

## API Usage Examples

### Authentication
```javascript
// Send OTP
POST /api/auth
{
  "action": "send-otp",
  "phoneNumber": "+1234567890"
}

// Verify OTP
POST /api/auth
{
  "action": "verify-otp",
  "phoneNumber": "+1234567890",
  "otp": "123456"
}

// Logout
POST /api/auth
{
  "action": "logout"
}

// Get user info
GET /api/auth
```

### Products
```javascript
// Get all products
GET /api/products

// Get specific product
GET /api/products?id=123

// Search products
GET /api/products?search=valve

// Filter by category
GET /api/products?category=valves

// Create product (admin)
POST /api/products
{
  "name": "New Product",
  "category": "valves",
  "price": 1000,
  "description": "Product description"
}

// Update product (admin)
PUT /api/products?id=123
{
  "name": "Updated Product",
  "price": 1200
}

// Delete product (admin)
DELETE /api/products?id=123
```

### Orders
```javascript
// Get all orders (admin)
GET /api/orders

// Get user's orders
GET /api/orders?action=my-orders

// Get specific order
GET /api/orders?id=123

// Create order
POST /api/orders
{
  "items": [...],
  "shippingAddress": {...}
}

// Update order status (admin)
PUT /api/orders
{
  "id": "123",
  "status": "shipped"
}
```

### Payments
```javascript
// Create payment order
POST /api/payments
{
  "action": "create-order",
  "amount": 1000,
  "currency": "inr"
}

// Verify payment
POST /api/payments
{
  "action": "verify",
  "paymentId": "pay_123",
  "orderId": "order_456",
  "signature": "signature_789"
}
```

## Testing Checklist

After deployment, test these endpoints:

- [ ] Authentication flow (send OTP, verify OTP, logout)
- [ ] Product listing and search
- [ ] Product creation, update, deletion (admin)
- [ ] Order creation and management
- [ ] Payment processing
- [ ] Address management
- [ ] Inquiry submission
- [ ] Profile management

## Notes

1. **GET requests** use query parameters
2. **POST/PUT requests** use request body for actions
3. All endpoints now work with Vercel's serverless architecture
4. Authentication is handled via session cookies
5. Admin-only endpoints require proper authentication 