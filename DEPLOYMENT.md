# Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/promosink-portal.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
     - `NEXTAUTH_URL` - Your Vercel deployment URL (auto-set)
     - `BLOB_READ_WRITE_TOKEN` - (Optional) Vercel Blob token
     - `EASYPOST_API_KEY` - (Optional) EasyPost API key
     - `PROMOSINK_API_URL` - (Optional) Promos Ink API URL
     - `PROMOSINK_API_KEY` - (Optional) Promos Ink API key

4. **Deploy:**
   - Vercel will automatically deploy on every push to main branch

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## GitHub Actions Auto-Deploy

The project includes GitHub Actions workflows that automatically deploy to Vercel on push.

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:

   - `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Get from Vercel project settings
   - `VERCEL_PROJECT_ID` - Get from Vercel project settings
   - `DATABASE_URL` - Your PostgreSQL connection string

### How It Works

- Every push to `main` branch triggers deployment
- GitHub Actions runs `npm run db:generate`
- Deploys to Vercel production

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)

1. In Vercel dashboard, go to Storage
2. Create a Postgres database
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

### Option 2: External Database

Use any PostgreSQL provider:
- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app

Add the connection string as `DATABASE_URL` in Vercel.

## Post-Deployment Steps

1. **Run Database Migrations:**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   npx prisma db seed
   ```

   Or use Vercel's built-in Postgres and run:
   ```bash
   vercel db push
   vercel db seed
   ```

2. **Verify Deployment:**
   - Check your Vercel deployment URL
   - Test login with seeded accounts:
     - Customer: `customer@acme.com` / `customer123`
     - Admin: `admin@promosink.com` / `admin123`

## Troubleshooting

### Build Fails

- Check that all environment variables are set in Vercel
- Verify `DATABASE_URL` is accessible from Vercel's servers
- Check build logs in Vercel dashboard

### Database Connection Issues

- Ensure `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- For Supabase/Neon, check connection pooling settings

### Prisma Generate Fails

- Make sure `prisma/schema.prisma` is committed to git
- Check that `DATABASE_URL` is set in Vercel environment variables

## Continuous Deployment

Once set up:
- Push to `main` branch → Auto-deploys to Vercel
- Pull requests → Preview deployments
- All environment variables are managed in Vercel dashboard






