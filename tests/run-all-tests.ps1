# SocialFly AI - Test Suite Runner
# This script runs all API tests

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SocialFly AI - API Test Suite" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
$BASE_URL = "http://localhost:3000"
Write-Host "Checking if server is running at $BASE_URL..." -ForegroundColor Yellow

try {
    $null = Invoke-WebRequest -Uri $BASE_URL -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running. Please start the dev server with: npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting test suite..." -ForegroundColor Cyan
Write-Host ""

# Run individual test files
$testFiles = @(
    "test-discord.ps1",
    "test-facebook.ps1",
    "test-linkedin.ps1",
    "test-x.ps1",
    "test-youtube.ps1"
)

foreach ($testFile in $testFiles) {
    $testPath = Join-Path $PSScriptRoot $testFile
    if (Test-Path $testPath) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Magenta
        Write-Host "  Running: $testFile" -ForegroundColor Magenta
        Write-Host "=========================================" -ForegroundColor Magenta
        Write-Host ""
        
        & $testPath
        
        Write-Host ""
    } else {
        Write-Host "⚠️  Test file not found: $testFile" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Test Suite Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Some tests require manual OAuth flows." -ForegroundColor Yellow
Write-Host "Use the web interface at http://localhost:3000 for complete testing." -ForegroundColor Yellow
Write-Host ""
