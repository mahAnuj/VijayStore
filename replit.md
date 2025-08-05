# Vijay Traders Industrial Equipment E-commerce Platform

## Overview

Vijay Traders is a full-stack e-commerce platform specializing in industrial pneumatic and hydraulic equipment. The application serves as a wholesale trading platform for industrial components, featuring product catalogs, shopping cart functionality, payment processing via Stripe, and customer inquiry management. Built with modern web technologies, it provides both customer-facing features and administrative capabilities for managing products, orders, and customer inquiries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand for cart state with persistence middleware
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom industrial theme colors and CSS variables
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework (converted to Vercel serverless functions)
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with JSON responses and proper HTTP status codes
- **Deployment**: Dual architecture - Express.js for development, serverless functions for production
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request logging middleware for API endpoint monitoring
- **Session Management**: Stateless session handling for serverless environment

### Data Storage
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM with type-safe queries and migrations
- **Schema**: Structured tables for products, orders, and inquiries with proper relationships
- **Connection**: Connection pooling for efficient database resource management

### Authentication & Authorization
- **Current State**: No authentication system implemented
- **Admin Access**: Direct route access without protection (suitable for internal use)
- **Payment Security**: Stripe integration handles payment data security

### External Dependencies

#### Payment Processing
- **Stripe**: Complete payment infrastructure with React components and server-side processing
- **Features**: Payment intents, customer data collection, and transaction handling

#### Cloud Storage
- **Google Cloud Storage**: File upload and asset management capabilities
- **Uppy**: Modern file uploader with drag-drop, dashboard, and AWS S3 support

#### Development & Build Tools
- **Vite**: Development server with HMR and optimized production builds
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **ESBuild**: Fast bundling for production server builds

#### UI & User Experience
- **React Query**: Server state management with caching and synchronization
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Consistent iconography throughout the application

#### Database & Migrations
- **Drizzle Kit**: Database migrations and schema management
- **Neon Database**: Serverless PostgreSQL with WebSocket connections

## Recent Changes

### Vercel Serverless Conversion (January 2025)
- **Date**: January 5, 2025
- **Change**: Converted all Express.js routes to Vercel serverless functions
- **Details**: 
  - Created comprehensive `/api` folder structure with 18+ serverless functions
  - Implemented session management for stateless Vercel environment
  - Added authentication middleware wrappers for protected routes
  - Maintained all existing functionality: auth, products, orders, payments, profiles
  - Created deployment configuration with `vercel.json`
  - Added complete deployment guide in `DEPLOYMENT.md`
- **Impact**: Project now ready for Vercel deployment with serverless architecture while maintaining full functionality

### Authentication and UI Updates (January 2025)
- **Date**: January 4, 2025
- **Change**: Implemented phone OTP authentication and updated UI branding
- **Details**: 
  - Replaced Replit Auth with custom phone OTP system using Twilio
  - Added authentication requirement for "Add to Cart" functionality
  - Updated rating displays to show "4.0 on IndiaMART" with clickable links
  - Removed "Verified Plus Supplier" badges throughout the application
  - Removed "Bank Of Maharashtra" references from all components
  - Added IndiaMART profile link: https://www.indiamart.com/vijaytraders-india/
- **Impact**: Better user experience for Indian customers with phone-based authentication and accurate business representation

### Product Catalog Update (January 2025)
- **Date**: January 4, 2025
- **Change**: Added complete product catalog from IndiaMART
- **Details**: Imported 14 products across 7 categories with authentic product images and descriptions:
  - 3 Solenoid Valves (Airmax, Techno models)
  - 2 Air Blow Guns (Techno ABG-06, DG-10)
  - 2 Air Filter Regulators (Pneumax, Stainless Steel)
  - 2 Roto Seal Couplings (Stainless Steel, Brass)
  - 2 Pressure Gauges (H Guru, Stainless Steel models)
  - 2 Pressure Switches (Danfoss KP 36, Digital)
  - 1 Hydraulic Ball Valve (Techno SW12)
- **Impact**: Fully populated product catalog with real inventory data