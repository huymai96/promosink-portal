# Promos Ink B2B Portal

Multi-tenant B2B apparel portal for Promos Ink.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Auth.js** - Authentication
- **Vercel Blob** - File storage
- **EasyPost** - Shipping rates
- **Tailwind CSS** - Styling

## Environment Variables

See `.env.example` for all required variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL

**Optional (uses demo data if not set):**
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
- `EASYPOST_API_KEY` - EasyPost API key
- `PROMOSINK_API_URL` - Promos Ink API URL
- `PROMOSINK_API_KEY` - Promos Ink API key

## Features

- ✅ Multi-tenant support
- ✅ Product catalog with inventory
- ✅ Shopping cart with decoration wizard
- ✅ B2B checkout with PO numbers
- ✅ Order tracking with proof approval
- ✅ File uploads for artwork
- ✅ Graceful fallback to demo data

## Test Accounts

After seeding:
- **Customer:** `customer@acme.com` / `customer123`
- **Admin:** `admin@promosink.com` / `admin123`

## Documentation

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SETUP_STATUS.md](./SETUP_STATUS.md) - Setup status and checklist

## License

Private - Promos Ink
