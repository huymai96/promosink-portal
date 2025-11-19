# Manual Setup Steps

## Current Status

✅ **Completed:**
- npm install completed successfully
- package.json created with correct dependencies
- tsconfig.json created
- next.config.ts created
- prisma/schema.prisma created
- .env file created (needs your DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)

## Next Steps (Run These Commands)

Since terminal commands are hanging, please run these manually in your terminal:

### 1. Navigate to project directory
```powershell
cd C:\Users\qc\promosink-portal
```

### 2. Generate Prisma Client
```powershell
npm run db:generate
```

### 3. Push Schema to Database (requires DATABASE_URL in .env)
```powershell
npm run db:push
```

**Note:** This requires a real PostgreSQL database. If you don't have one yet:
- Use a cloud service like Supabase (free tier): https://supabase.com
- Or install PostgreSQL locally
- Update DATABASE_URL in .env file

### 4. Seed Database
```powershell
npm run db:seed
```

### 5. Start Development Server
```powershell
npm run dev
```

## Environment Variables Needed

Make sure your `.env` file has these three REQUIRED variables:

```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

## What Works Without Real API Keys

- ✅ Product catalog
- ✅ Shopping cart
- ✅ Decoration wizard
- ✅ Checkout (with demo shipping rates)
- ✅ Order tracking
- ✅ File uploads (mock URLs)

All integrations gracefully fall back to demo data when API keys are missing.

## If You Get Errors

1. **Database connection errors**: Make sure DATABASE_URL is correct and database is accessible
2. **Prisma errors**: Make sure you ran `npm run db:generate` first
3. **Next.js errors**: Make sure all dependencies installed (`npm install` completed)

## Test Accounts (After Seeding)

- Customer: `customer@acme.com` / `customer123`
- Admin: `admin@promosink.com` / `admin123`

