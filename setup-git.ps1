# PowerShell script for GitHub and Vercel deployment

Write-Host "🚀 Setting up Git and preparing for deployment..." -ForegroundColor Cyan

# Initialize git if not already initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Add all files
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Promos Ink B2B Portal"

Write-Host ""
Write-Host "✅ Git repository initialized!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub: https://github.com/new"
Write-Host "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
Write-Host ""
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/promosink-portal.git" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Then go to https://vercel.com and:" -ForegroundColor Cyan
Write-Host "   - Click 'Add New Project'"
Write-Host "   - Import your GitHub repository"
Write-Host "   - Add environment variables (see DEPLOYMENT.md)"
Write-Host "   - Deploy!"
Write-Host ""






