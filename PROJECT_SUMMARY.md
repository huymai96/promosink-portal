# Promos Ink B2B Portal - Project Summary

## Overview

This is a comprehensive multi-tenant B2B apparel portal built with Next.js 15, TypeScript, Prisma, and Auth.js. The system supports product catalog browsing, decoration configuration, cart management, checkout with PO numbers, and order tracking with proof approval workflows.

## Quick Start Checklist

### Prerequisites (You Need to Provide)

1. **Node.js 18+ and npm**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **PostgreSQL Database** (REQUIRED)
   - Local PostgreSQL installation, OR
   - Cloud service (Supabase, Neon, Railway, etc.)
   - You'll need the connection string for `DATABASE_URL`

3. **Environment Variables** (REQUIRED)
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - `http://localhost:3000` for local dev

### What's Already Done

✅ All integrations gracefully handle missing API keys  
✅ Mock data for EasyPost, Promos Ink API, and Vercel Blob  
✅ Complete database schema and seed data  
✅ All pages and components implemented  
✅ Authentication system ready  

### What You Need to Do

1. Install Node.js if not already installed
2. Set up a PostgreSQL database
3. Copy `.env.example` to `.env` and fill in the 3 required variables
4. Run: `npm install && npm run db:generate && npm run db:push && npm run db:seed`
5. Run: `npm run dev`

## Project Structure

### Core Configuration
- **package.json**: Dependencies including Next.js 15, Prisma, Auth.js, Vercel Blob, EasyPost
- **tsconfig.json**: TypeScript configuration
- **next.config.ts**: Next.js configuration with image optimization
- **tailwind.config.ts**: Tailwind CSS configuration
- **prisma/schema.prisma**: Complete database schema

### Database Schema (Prisma)

The schema includes:

1. **Multi-tenant**: `Tenant` with branding (logo, colors)
2. **Authentication**: `User`, `Session`, `Account` (Auth.js)
3. **Customer Management**: `CustomerAccount`, `CustomerUser`
4. **Catalog**: `Supplier`, `Product`, `ProductVariant`, `Warehouse`, `InventorySnapshot`
5. **Decoration**: `DecorationMethod`, `DecorationPriceTable`
6. **Cart & Orders**: `Cart`, `CartItem`, `Order`, `OrderLine`, `OrderDecoration`
7. **Artwork & Proofs**: `ArtworkAsset`, `Proof`

### Library Modules (`lib/`)

- **auth.ts**: Auth.js configuration with Credentials provider
- **prisma.ts**: Prisma client singleton
- **tenant.ts**: Tenant resolution utilities
- **pricing.ts**: Decoration pricing engine with customer-specific pricing
- **catalog.ts**: Product catalog queries and filtering
- **search.ts**: Algolia search abstraction (stubbed)
- **easypost.ts**: EasyPost shipping rates integration
- **promosinkApi.ts**: Promos Ink API client (stubbed)

### App Routes

#### Authentication
- `/login`: Login page
- `/signup`: Signup page
- `/api/auth/[...nextauth]`: Auth.js API route
- `/api/auth/signup`: User registration

#### Products
- `/products`: Product listing with filters (category, brand, search)
- `/products/[styleCode]`: Product detail with inventory matrix and add-to-cart

#### Cart & Checkout
- `/cart`: Shopping cart with decoration wizard
- `/checkout`: Checkout form with PO number, shipping address, and EasyPost rates
- `/api/cart/add`: Add items to cart
- `/api/cart/decoration`: Save decoration configuration
- `/api/checkout/shipping`: Get shipping rates
- `/api/checkout/submit`: Submit order

#### Orders
- `/orders`: Order history list
- `/orders/[id]`: Order detail with proof approval
- `/api/orders/proofs/[id]/approve`: Approve proof
- `/api/orders/proofs/[id]/reject`: Reject proof
- `/api/orders/decorations/[id]/artwork`: Upload artwork

#### File Upload
- `/api/upload`: Generic file upload to Vercel Blob

### Components

- **Header.tsx**: Navigation header with search bar
- **SearchBar.tsx**: Global search input
- **AddToCartForm.tsx**: Product add-to-cart form with size/color selection
- **CartItemsList.tsx**: Cart items display with decoration wizard trigger
- **DecorationWizard.tsx**: Multi-step decoration configuration wizard
- **ProofApproval.tsx**: Proof approval/rejection interface

## Key Features

### 1. Multi-Tenant Support
- Tenant resolution by domain/subdomain (stubbed in middleware)
- Per-tenant branding (logo, colors)
- Tenant-scoped products and orders

### 2. Product Catalog
- Category-based navigation
- Brand and category filters
- Search by SKU, style code, or keywords
- Inventory matrix showing warehouse × size availability
- Product detail pages with variant selection

### 3. Decoration Workflow
- Four decoration methods: Screen Printing, Embroidery, DTG, DTF
- Multi-step wizard:
  1. Method selection
  2. Location selection (Left Chest, Full Front, etc.)
  3. Method-specific configuration:
     - Screen: colors, underbase, print size
     - Embroidery: stitch count (or estimate later)
     - DTG/DTF: print size, notes
  4. Artwork upload (AI, PDF, PNG, JPG, DST)
- Pricing calculation based on customer-specific or global price tables

### 4. Pricing Engine
- Customer-specific pricing tables
- Global/default pricing fallback
- Quantity-based pricing tiers
- Method-specific constraints (max colors, max stitches)
- Setup charges support

### 5. Cart Management
- Add products with size/color breakdown
- Add decoration to cart items
- Real-time price calculation
- Decoration editing

### 6. B2B Checkout
- PO number required
- Ship-to address form
- In-hands date
- EasyPost shipping rate quotes
- Shipping method selection
- Order submission to Promos Ink API (stubbed)

### 7. Order Tracking
- Order list with status badges
- Order detail view
- Decoration details
- Proof approval workflow:
  - View proof files
  - Approve or request changes
  - Upload new artwork
  - Comment on proofs

### 8. File Storage
- Vercel Blob integration for artwork and proofs
- Public access URLs
- Support for multiple file types

## Environment Variables

### Required for Local Development

These variables **MUST** have real values:

1. **`DATABASE_URL`** (REQUIRED)
   - PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - You need a real PostgreSQL database (local or cloud service like Supabase/Neon)
   - **Cannot be mocked** - database is essential

2. **`NEXTAUTH_SECRET`** (REQUIRED)
   - Random secret string for JWT token encryption
   - Generate with: `openssl rand -base64 32`
   - **Cannot be mocked** - required for authentication

3. **`NEXTAUTH_URL`** (REQUIRED)
   - Base URL of your application
   - For local dev: `http://localhost:3000`
   - **Cannot be mocked** - required for auth callbacks

### Optional (Gracefully Mocked)

These can be left empty for local development - the app will use demo data:

4. **`BLOB_READ_WRITE_TOKEN`** (OPTIONAL)
   - Vercel Blob storage token for file uploads
   - If not set: File uploads use mock URLs (`demo.promosink.com/uploads/...`)
   - Get from: https://vercel.com/dashboard/stores

5. **`EASYPOST_API_KEY`** (OPTIONAL)
   - EasyPost API key for shipping rate quotes
   - If not set: Checkout shows demo shipping rates (UPS Ground $15.99, FedEx 2Day $35.99, etc.)
   - Get from: https://www.easypost.com/

6. **`PROMOSINK_API_URL`** (OPTIONAL)
   - External Promos Ink API URL
   - Default: `https://api.promosinkwall-e.com`
   - If not set: Orders saved locally but not submitted to external API

7. **`PROMOSINK_API_KEY`** (OPTIONAL)
   - Promos Ink API authentication key
   - If not set: Orders saved locally with mock external IDs

### Complete Environment Variable List

See `.env.example` for the complete list with detailed comments.

## Setup Instructions

### Prerequisites

- **Node.js 18+** and npm installed
- **PostgreSQL database** (local or cloud)
- **Git** (optional, for version control)

### Step-by-Step Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set the REQUIRED variables:
# - DATABASE_URL (your PostgreSQL connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (http://localhost:3000 for local dev)
```

3. **Set up database:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed
```

4. **Run development server:**
```bash
npm run dev
```

5. **Access the application:**
- Open http://localhost:3000
- Login with seeded user: `customer@acme.com` / `customer123`
- Or admin: `admin@promosink.com` / `admin123`

### Database Reset Commands

To reset and reseed the database:

```bash
# Option 1: Reset schema (drops all tables and recreates)
npx prisma migrate reset

# Option 2: Just reseed (keeps schema, clears data, reseeds)
# First, manually clear tables or use:
npx prisma db push --force-reset
npm run db:seed
```

**Note:** `prisma migrate reset` will drop all data. Use with caution in production.

## Seed Data

The seed script (`prisma/seed.ts`) creates:
- Default tenant
- Admin user (admin@promosink.com / admin123)
- Customer account (Acme Corporation)
- Customer user (customer@acme.com / customer123)
- Decoration methods (SCREEN, EMB, DTG, DTF)
- Price tables (global and customer-specific)
- Warehouses (LA, NY)
- Sample products (T-Shirts, Polos, Sweatshirts) with variants and inventory

## Integration Points

### EasyPost Shipping Rates
- **Location:** `lib/easypost.ts`
- **Status:** Gracefully mocked for local dev
- **Behavior:**
  - If `EASYPOST_API_KEY` is not set: Returns demo shipping rates
  - Demo rates: UPS Ground ($15.99), FedEx 2Day ($35.99), FedEx Overnight ($55.99)
  - Console logs: "EasyPost API key not configured, using demo data"
- **Production:** Set `EASYPOST_API_KEY` to enable real rate quotes

### Promos Ink API
- **Location:** `lib/promosinkApi.ts`
- **Status:** Gracefully mocked for local dev
- **Functions:** `submitOrder`, `getOrder`, `listOrdersForCustomer`
- **Behavior:**
  - If `PROMOSINK_API_KEY` is not set: Returns mock responses
  - Orders are still saved to local database
  - Mock external IDs are generated (e.g., `ext_demo_1234567890`)
  - Console logs: "Promos Ink API key not configured, using demo data"
- **Production:** Set `PROMOSINK_API_URL` and `PROMOSINK_API_KEY` to enable real API calls

### Vercel Blob Storage
- **Location:** `app/api/upload/route.ts`, `app/api/orders/decorations/[id]/artwork/route.ts`
- **Status:** Gracefully mocked for local dev
- **Behavior:**
  - If `BLOB_READ_WRITE_TOKEN` is not set: Returns mock URLs
  - Mock URLs: `https://demo.promosink.com/uploads/{timestamp}-{filename}`
  - Console logs: "Vercel Blob token not configured, using mock URL"
  - File uploads appear to work but files are not actually stored
- **Production:** Set `BLOB_READ_WRITE_TOKEN` to enable real file storage

### Algolia Search
- **Location:** `lib/search.ts`
- **Status:** Stubbed (returns empty array)
- **Behavior:**
  - Currently returns empty search results
  - Search functionality falls back to Prisma database queries
  - No environment variables needed yet
- **Production:** Implement Algolia indexing and search

## Known Limitations of Mock Integrations

### EasyPost
- ✅ Checkout flow works with demo rates
- ✅ Shipping method selection works
- ⚠️ Rates are static and don't reflect actual shipping costs
- ⚠️ No real carrier validation

### Promos Ink API
- ✅ Orders are saved to local database
- ✅ Order tracking works locally
- ⚠️ Orders are not submitted to external system
- ⚠️ External order status updates won't sync

### Vercel Blob
- ✅ Upload UI works
- ✅ File metadata is saved to database
- ⚠️ Files are not actually stored (mock URLs only)
- ⚠️ Proof images won't be viewable (mock URLs don't resolve)
- **Workaround:** For local dev, you can use a local file storage solution or set up Vercel Blob

### Algolia
- ✅ Product listing works via Prisma queries
- ✅ Search works via database search
- ⚠️ No advanced search features (fuzzy matching, typo tolerance, etc.)
- ⚠️ Search performance may degrade with large catalogs

## Next Steps for Production

1. **Multi-tenant routing**: Implement domain/subdomain resolution in middleware
2. **Tenant theming**: Apply tenant colors and logo in UI components
3. **Real API integrations**: Replace stubbed EasyPost and Promos Ink API calls
4. **Algolia integration**: Implement product search indexing
5. **Email notifications**: Add order confirmation and proof notification emails
6. **Admin dashboard**: Build admin interface for managing tenants, products, pricing
7. **Inventory management**: Real-time inventory updates from suppliers
8. **Payment processing**: If needed (currently PO-based)
9. **Advanced search**: Implement Algolia search with filters
10. **Mobile optimization**: Enhance mobile responsiveness

## Architecture Notes

- **Separation of concerns**: UI components, domain logic (lib/), and integration clients are separated
- **Type safety**: Full TypeScript coverage
- **Server components**: Leverages Next.js 15 App Router with server components where possible
- **Client components**: Used for interactive features (forms, wizards)
- **API routes**: RESTful API routes for mutations and data fetching
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: Auth.js with JWT sessions
- **File storage**: Vercel Blob for artwork and proofs

## File Organization

```
promosink-portal/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order pages
│   └── ...
├── components/            # React components
├── lib/                   # Business logic and utilities
├── prisma/                # Prisma schema and migrations
└── ...
```

