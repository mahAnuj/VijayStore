# Deployment Guide

## Vercel Deployment (Serverless Functions)

### Prerequisites
1. Vercel account (free)
2. Neon PostgreSQL database (already configured)
3. Environment variables from Replit

### ✅ Conversion Complete
All Express.js routes have been converted to Vercel serverless functions:

**API Structure:**
```
api/
├── _lib/
│   ├── auth.js          # Authentication utilities
│   └── razorpay.js      # Payment processing
├── auth/
│   ├── user.js          # Get user profile
│   ├── send-otp.js      # Send OTP
│   ├── verify-otp.js    # Verify OTP
│   └── logout.js        # Logout
├── products/
│   ├── index.js         # List/create products
│   └── [id].js          # Get/update/delete product
├── orders/
│   ├── index.js         # List/create orders
│   └── [id]/status.js   # Update order status
├── inquiries/
│   ├── index.js         # List/create inquiries
│   └── [id]/status.js   # Update inquiry status
├── addresses/
│   ├── index.js         # List/create addresses
│   └── [id].js          # Update/delete address
├── my-orders.js         # Customer's orders
├── profile.js           # Customer profile
├── create-payment-order.js  # Razorpay payment
└── verify-payment.js    # Payment verification
```

### Step 1: Environment Variables
Add these to your Vercel project settings:

**Database:**
- `DATABASE_URL` - Your Neon database connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

**Authentication:**
- `SESSION_SECRET` - Random string for session encryption
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token  
- `TWILIO_PHONE_NUMBER` - Twilio phone number

**Payments:**
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

### Step 2: Deploy to Vercel

**Using Vercel CLI:**
```bash
npx vercel
```

**Using Git Integration:**
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy automatically

### Step 3: Frontend Configuration
The frontend will automatically use `/api/*` endpoints in production.
No changes needed to existing React code.

### Step 4: Session Handling (Important!)
Vercel serverless functions are stateless. You'll need to implement:
1. JWT tokens in cookies
2. External session store (Redis/MongoDB)
3. Or use Vercel's Edge Functions with KV storage

### Features Ready for Deployment:
✅ Phone OTP authentication  
✅ Product catalog management  
✅ Shopping cart functionality  
✅ Order processing  
✅ Customer profiles & addresses  
✅ Admin panel  
✅ Razorpay payment integration  
✅ Inquiry management  

## Alternative Platforms

### Railway (Easiest Full-Stack)
- No conversion needed - use existing Express.js code
- Automatic deployments from Git
- Built-in PostgreSQL option
- Simple environment variable setup

### Render
- Free tier available
- Supports both static sites and web services
- Easy PostgreSQL add-on
- Docker support

### Heroku
- Classic choice for Node.js apps
- Extensive add-on marketplace
- Easy scaling options
- Built-in CI/CD

## Recommendations

1. **For Vercel**: Use the converted serverless functions (ready to deploy)
2. **For simplicity**: Use Railway with your existing Express.js code
3. **For free hosting**: Use Render free tier
4. **For enterprise**: Use Heroku with add-ons

Your Neon PostgreSQL database will work seamlessly with any platform.