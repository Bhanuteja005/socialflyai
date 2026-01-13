# SocialFly AI - Quick Start Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SocialFly AI - Quick Start" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if dependencies are installed
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env.local file
Write-Host "`nChecking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
    
    # Check if it has actual values or just placeholders
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "your_.*_here") {
        Write-Host "⚠️  Warning: .env.local contains placeholder values" -ForegroundColor Yellow
        Write-Host "   Please update with your actual API credentials" -ForegroundColor Yellow
        Write-Host "   See SETUP.md for detailed instructions" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Environment variables appear to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "   The template has been created. Please update it with your credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Ready to Start!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start the development server with:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Additional Resources:" -ForegroundColor Cyan
Write-Host "  - Setup Guide: SETUP.md" -ForegroundColor White
Write-Host "  - Testing Guide: tests/README.md" -ForegroundColor White
Write-Host "  - Main Documentation: README.md" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Would you like to start the dev server now? (y/n)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host "`nStarting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host "`nYou can start the server anytime with: npm run dev" -ForegroundColor Cyan
}
