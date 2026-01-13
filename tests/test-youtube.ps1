# YouTube API Tests

$BASE_URL = "http://localhost:3000"

Write-Host "Testing YouTube API..." -ForegroundColor Cyan

# Test 1: Generate auth URL
Write-Host "`nTest 1: Generate Auth URL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/youtube/auth-url" -Method Get
    Write-Host "✅ SUCCESS: Auth URL generated" -ForegroundColor Green
    Write-Host "Auth URL: $($response.url)"
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host "`nNote: To complete the OAuth flow:" -ForegroundColor Yellow
Write-Host "1. Visit the auth URL above" -ForegroundColor Cyan
Write-Host "2. Authorize the application" -ForegroundColor Cyan
Write-Host "3. Copy the authorization code from the callback" -ForegroundColor Cyan
Write-Host "4. Run the token exchange test with the code" -ForegroundColor Cyan

# Test 2: Exchange token (requires manual code input)
Write-Host "`nTest 2: Exchange Token (Manual)" -ForegroundColor Yellow
$authCode = Read-Host "Enter the authorization code (or press Enter to skip)"

if ($authCode) {
    $body = @{
        code = $authCode
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/youtube/callback" -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ SUCCESS: Token obtained" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10)
        
        # Save access token
        $global:YouTubeAccessToken = $response.tokens.access_token
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped: No authorization code provided" -ForegroundColor Yellow
}

# Test 3: Upload video (requires access token and video file)
if ($global:YouTubeAccessToken) {
    Write-Host "`nTest 3: Upload Video" -ForegroundColor Yellow
    Write-Host "Note: For video uploads, use the web interface" -ForegroundColor Cyan
    Write-Host "Video uploads require multipart/form-data which is complex in PowerShell" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Skipped: Upload Video (No access token available)" -ForegroundColor Yellow
}

Write-Host "`nYouTube API tests completed!" -ForegroundColor Cyan
