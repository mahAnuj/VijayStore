# VijayStore Setup Guide

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication (Required)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Payment Gateways (Optional for development)
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SMS Service (Optional for development)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Database Setup

1. **Create a Neon Database** (Recommended)
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string to `DATABASE_URL`

2. **Alternative: Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally
   # Create a database
   createdb vijaystore
   # Set DATABASE_URL=postgresql://localhost:5432/vijaystore
   ```

3. **Push Database Schema**
   ```bash
   npm run db:push
   ```

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:5000`
   - API: `http://localhost:5000/api/*`

## 🚀 Deployment Setup

### Vercel Deployment

1. **Connect Repository**
   - Fork/clone this repository
   - Connect to Vercel

2. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all required environment variables

3. **Deploy**
   - Push to main branch
   - Vercel will automatically deploy

### Build Issues Resolution

If you encounter build issues:

1. **Vercel Analytics Import Error**
   ```javascript
   // ✅ Correct import for React/Vite
   import { Analytics } from "@vercel/analytics/react"
   
   // ❌ Wrong import (Next.js specific)
   import { Analytics } from "@vercel/analytics/next"
   ```

2. **Database Connection Error**
   - Ensure `DATABASE_URL` is set in environment variables
   - Verify database is accessible
   - Check if database schema is pushed

3. **Missing Dependencies**
   ```bash
   npm install
   npm run build
   ```

## 🔍 Troubleshooting

### Common Issues

1. **"No database connection string provided"**
   - Set `DATABASE_URL` environment variable
   - Ensure database is running and accessible

2. **Build fails with import errors**
   - Check import paths (React vs Next.js)
   - Ensure all dependencies are installed
   - Clear node_modules and reinstall if needed

3. **Authentication not working**
   - Verify `JWT_SECRET` is set
   - Check if OTP table exists in database
   - Ensure Twilio credentials are correct (for SMS)

4. **Payment integration issues**
   - Verify Stripe/Razorpay keys are correct
   - Check webhook endpoints are configured
   - Ensure payment gateway is in correct mode (test/live)

### Development Tips

1. **Use Demo Mode**
   - In development, OTP is always `123456`
   - No actual SMS is sent
   - Payment gateways use test keys

2. **Database Management**
   ```bash
   # Push schema changes
   npm run db:push
   
   # Generate migrations
   npx drizzle-kit generate
   
   # Seed data
   npm run seed
   ```

3. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for development/production
   - Test all integrations in development first

## 📞 Support

If you encounter issues:

1. Check the [README.md](README.md) for detailed documentation
2. Review the [JWT_IMPLEMENTATION.md](JWT_IMPLEMENTATION.md) for authentication details
3. Create an issue in the GitHub repository
4. Contact: [anuj@anujmahajan.dev](mailto:anuj@anujmahajan.dev)
5. Visit: [https://anujmahajan.dev](https://anujmahajan.dev)

---

**Happy coding! 🚀**

*Developed by [Anuj Mahajan](https://anujmahajan.dev)* 