# Quick Deploy Guide

## Step 1: Initialize Git and Push to GitHub

### Option A: Use the Setup Script (Windows PowerShell)

```powershell
cd C:\Users\qc\promosink-portal
.\setup-git.ps1
```

### Option B: Manual Git Setup

```powershell
cd C:\Users\qc\promosink-portal

# Initialize git
git init
git branch -M main

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Promos Ink B2B Portal"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/promosink-portal.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository** (select `promosink-portal`)
5. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these (at minimum):
     ```
     DATABASE_URL=your_postgresql_connection_string
     NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
     NEXTAUTH_URL=https://your-project.vercel.app
     ```
   - Optional (uses demo data if not set):
     ```
     BLOB_READ_WRITE_TOKEN=
     EASYPOST_API_KEY=
     PROMOSINK_API_URL=https://api.promosinkwall-e.com
     PROMOSINK_API_KEY=
     ```
7. **Click "Deploy"**

### Method 2: Via Vercel CLI

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy to production
vercel --prod
```

## Step 3: Set Up Database

### Option A: Vercel Postgres (Easiest)

1. In Vercel dashboard, go to your project
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Copy the connection string
5. Add it as `DATABASE_URL` environment variable
6. Run migrations:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   npx prisma db seed
   ```

### Option B: External Database (Supabase/Neon/Railway)

1. Create a PostgreSQL database on your chosen provider
2. Get the connection string
3. Add as `DATABASE_URL` in Vercel environment variables
4. Run migrations (see Option A)

## Step 4: Test Your Deployment

1. **Visit your Vercel URL:** `https://your-project.vercel.app`
2. **Test login:**
   - Customer: `customer@acme.com` / `customer123`
   - Admin: `admin@promosink.com` / `admin123`

## Automatic Deployments

Once set up:
- ✅ Every push to `main` branch → Auto-deploys to Vercel
- ✅ Pull requests → Preview deployments
- ✅ GitHub Actions → Automatic sync (if configured)

## Troubleshooting

### Build Fails

- Check Vercel build logs
- Ensure all environment variables are set
- Verify `DATABASE_URL` is accessible

### Database Connection Issues

- Check `DATABASE_URL` format
- Ensure database allows external connections
- For cloud databases, check IP whitelist settings

### Prisma Generate Fails

- Make sure `prisma/schema.prisma` is committed
- Check that `DATABASE_URL` is set in Vercel
- The `postinstall` script should handle this automatically

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.






