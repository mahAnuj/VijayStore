# VijayStore - Modern Ecommerce Platform

A full-stack ecommerce platform built with React, Node.js, and modern web technologies. Visit the live site at [https://vijaystore.anujmahajan.dev/](https://vijaystore.anujmahajan.dev/)

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse products by category with search functionality
- **User Authentication**: JWT-based phone number authentication with OTP
- **Shopping Cart**: Add/remove items with real-time updates
- **User Profiles**: Manage personal information and business details
- **Address Management**: Save multiple shipping addresses
- **Order Management**: View order history and track status
- **Secure Checkout**: Multiple payment gateway integration
- **Responsive Design**: Mobile-first design for all devices

### Admin Features
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order status
- **Customer Management**: Access customer information
- **Analytics Dashboard**: Sales and performance insights

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JWT Authentication** - Stateless authentication
- **Neon Database** - Serverless PostgreSQL
- **Drizzle ORM** - Type-safe database queries
- **Vercel Analytics** - Performance monitoring

### Payment & Services
- **Stripe** - International payment processing
- **Razorpay** - Indian payment gateway
- **Twilio** - SMS OTP delivery
- **Vercel** - Deployment and hosting

## 📁 Project Structure

```
VijayStore/
├── api/                    # Vercel serverless functions
│   ├── _lib/              # Shared utilities
│   ├── auth.js            # JWT authentication
│   ├── products.js        # Product management
│   ├── orders.js          # Order processing
│   ├── payments.js        # Payment integration
│   └── profile.js         # User profile management
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utility functions
├── shared/                # Shared types and schemas
├── public/                # Static assets
└── scripts/               # Database and utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Vercel account for deployment

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VijayStore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key
   
   # Payment Gateways
   STRIPE_SECRET_KEY=sk_test_...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   # SMS Service
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npm run db:push
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🔧 Configuration

### Database Setup
The project uses Neon (serverless PostgreSQL) for the database. Key tables include:
- `users` - User accounts and basic info
- `customer_profiles` - Extended user information
- `products` - Product catalog
- `orders` - Order management
- `customer_addresses` - Shipping addresses
- `otps` - OTP storage for authentication

### Authentication Flow
1. User enters phone number
2. System sends OTP via SMS (Twilio)
3. User verifies OTP
4. JWT token generated and stored
5. Token used for subsequent API calls

### Payment Integration
- **Stripe**: International payments with card, UPI, etc.
- **Razorpay**: Indian payment methods (UPI, cards, net banking)
- Both gateways support webhook verification

## 📱 Key Features Explained

### JWT Authentication
- Stateless authentication perfect for serverless deployment
- Token-based with 24-hour expiration
- Automatic token inclusion in API requests
- Secure logout with token removal

### Product Management
- Category-based organization
- Search functionality
- Image management with cloud storage
- Stock tracking and management

### Order Processing
- Multi-step checkout process
- Address validation
- Payment gateway integration
- Order status tracking
- Email notifications

### Responsive Design
- Mobile-first approach
- Progressive Web App features
- Optimized for all screen sizes
- Fast loading with Vite

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=your_stripe_live_key
RAZORPAY_KEY_ID=your_razorpay_live_key
RAZORPAY_KEY_SECRET=your_razorpay_live_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **HTTPS Only**: All production traffic encrypted
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin settings
- **Environment Variables**: Secure credential management

## 📊 Performance

- **Vite Build**: Fast development and optimized production builds
- **TanStack Query**: Intelligent caching and background updates
- **Image Optimization**: Optimized product images
- **CDN**: Static assets served via CDN
- **Database Indexing**: Optimized queries with proper indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved by Anuj Mahajan.

**No permission is granted to use, copy, modify, or distribute this code without explicit written consent.**

For licensing inquiries, contact: [anujmahajan.dev@gmail.com](mailto:anujmahajan.dev@gmail.com)

See the [LICENSE](LICENSE) file for full terms and conditions.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [Anuj Mahajan](mailto:anujmahajan.dev@gmail.com)
- Live site: [https://vijaystore.anujmahajan.dev/](https://vijaystore.anujmahajan.dev/)

## 🙏 Acknowledgments

- [Vercel](https://vercel.com/) for hosting and analytics
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Stripe](https://stripe.com/) and [Razorpay](https://razorpay.com/) for payments

---

**Built with ❤️ by [Anuj Mahajan](https://anujmahajan.dev)**

*Full-stack developer specializing in modern web applications and ecommerce solutions.* 