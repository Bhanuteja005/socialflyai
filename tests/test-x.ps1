# X (Twitter) API Tests

$BASE_URL = "http://localhost:3000"

Write-Host "Testing X (Twitter) API..." -ForegroundColor Cyan

# Test 1: Generate auth URL
Write-Host "`nTest 1: Generate Auth URL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/x/auth-url" -Method Get
    Write-Host "✅ SUCCESS: Auth URL generated" -ForegroundColor Green
    Write-Host "Auth URL: $($response.url)"
    Write-Host "Code Verifier: $($response.code_verifier)"
    Write-Host "State: $($response.state)"
    
    # Save for later use
    $global:XCodeVerifier = $response.code_verifier
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
        code_verifier = $global:XCodeVerifier
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/x/callback" -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ SUCCESS: Token obtained" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10)
        
        # Save access token
        $global:XAccessToken = $response.tokens.access_token
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped: No authorization code provided" -ForegroundColor Yellow
}

# Test 3: Post tweet (requires access token)
if ($global:XAccessToken) {
    Write-Host "`nTest 3: Post Tweet" -ForegroundColor Yellow
    $body = @{
        text = "Test tweet from SocialFly AI - $(Get-Date)"
        accessToken = $global:XAccessToken
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/x/post" -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ SUCCESS: Tweet posted" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10)
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
} else {
    Write-Host "`n⚠️  Skipped: Post Tweet (No access token available)" -ForegroundColor Yellow
}

Write-Host "`nX (Twitter) API tests completed!" -ForegroundColor Cyan
