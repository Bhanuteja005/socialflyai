# Discord Bot Token Setup Helper
# Run this script to verify and update your Discord bot token

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DISCORD BOT TOKEN SETUP - SocialFlyAI" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check if server is running
Write-Host "[1] Checking if dev server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -ErrorAction Stop
    Write-Host "✓ Server is running on PORT 3000`n" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running. Please start it first with: npm run dev`n" -ForegroundColor Red
    exit 1
}

# Verify current token
Write-Host "[2] Verifying current Discord bot token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/discord/verify-token" -ErrorAction Stop
    Write-Host "✓ Token is VALID!" -ForegroundColor Green
    Write-Host "  Bot Username: $($response.bot.username)" -ForegroundColor Green
    Write-Host "  Bot ID: $($response.bot.id)" -ForegroundColor Green
    Write-Host "`n✓ Your Discord bot is ready to use!`n" -ForegroundColor Green
    exit 0
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✗ Token is INVALID!" -ForegroundColor Red
    Write-Host "  Error: $($errorResponse.details.message)`n" -ForegroundColor Red
}

# Provide instructions
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "   TO FIX: Get a new token from Discord" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Yellow

Write-Host "1. Open Discord Developer Portal:" -ForegroundColor White
Write-Host "   https://discord.com/developers/applications`n" -ForegroundColor Cyan

Write-Host "2. Select your application (or create new one)`n" -ForegroundColor White

Write-Host "3. Go to 'Bot' section → Click 'Reset Token'`n" -ForegroundColor White

Write-Host "4. Copy the new token (shown only once!)`n" -ForegroundColor White

Write-Host "5. Update your .env file:" -ForegroundColor White
Write-Host "   File: d:\Programme\Atyuttama\NovaLink\socialflyai\.env" -ForegroundColor Cyan
Write-Host "   Line: DISCORD_BOT_TOKEN=YOUR_NEW_TOKEN_HERE`n" -ForegroundColor Cyan

Write-Host "6. Restart the dev server:" -ForegroundColor White
Write-Host "   Press Ctrl+C to stop, then run: npm run dev`n" -ForegroundColor Cyan

Write-Host "7. Run this script again to verify`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Yellow

# Ask if user wants to open Discord Developer Portal
$openPortal = Read-Host "Open Discord Developer Portal now? (Y/N)"
if ($openPortal -eq "Y" -or $openPortal -eq "y") {
    Start-Process "https://discord.com/developers/applications"
    Write-Host "`n✓ Opened Discord Developer Portal in your browser`n" -ForegroundColor Green
}

# Ask if user wants to open .env file
$openEnv = Read-Host "Open .env file in editor? (Y/N)"
if ($openEnv -eq "Y" -or $openEnv -eq "y") {
    $envPath = "d:\Programme\Atyuttama\NovaLink\socialflyai\.env"
    if (Test-Path $envPath) {
        Start-Process $envPath
        Write-Host "`n✓ Opened .env file`n" -ForegroundColor Green
    } else {
        Write-Host "`n✗ .env file not found at: $envPath`n" -ForegroundColor Red
    }
}

Write-Host "`nFor detailed instructions, see: DISCORD_SETUP.md`n" -ForegroundColor Cyan
