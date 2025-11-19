#!/bin/bash
# Setup script for GitHub and Vercel deployment

echo "🚀 Setting up Git and preparing for deployment..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Promos Ink B2B Portal"

echo ""
echo "✅ Git repository initialized!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/promosink-portal.git"
echo "   git push -u origin main"
echo ""
echo "3. Then go to https://vercel.com and:"
echo "   - Click 'Add New Project'"
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo "   - Deploy!"
echo ""






