# Facebook API Tests

$BASE_URL = "http://localhost:3000"

Write-Host "Testing Facebook API..." -ForegroundColor Cyan

# Test 1: Post to Facebook
Write-Host "`nTest 1: Create Post" -ForegroundColor Yellow
$body = @{
    message = "Test post from SocialFly AI - $(Get-Date)"
    link = "https://example.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/facebook/post" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS: Post created" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 2: Get Facebook posts
Write-Host "`nTest 2: Get Posts" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/facebook/posts?limit=5" -Method Get
    Write-Host "✅ SUCCESS: Retrieved posts" -ForegroundColor Green
    Write-Host "Number of posts: $($response.data.Count)"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 3: Upload media
Write-Host "`nTest 3: Upload Media" -ForegroundColor Yellow
Write-Host "Note: For file uploads, use the web interface or curl commands" -ForegroundColor Cyan

Write-Host "`nFacebook API tests completed!" -ForegroundColor Cyan
