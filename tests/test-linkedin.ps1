# LinkedIn API Tests

$BASE_URL = "http://localhost:3000"

Write-Host "Testing LinkedIn API..." -ForegroundColor Cyan

# Test 1: Get Profile
Write-Host "`nTest 1: Get Profile" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/linkedin/profile" -Method Get
    Write-Host "✅ SUCCESS: Profile retrieved" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 2: Create text post
Write-Host "`nTest 2: Create Text Post" -ForegroundColor Yellow
$body = @{
    text = "Test post from SocialFly AI - $(Get-Date) #Testing #SocialFlyAI"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/linkedin/text-post" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS: Text post created" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 3: Create image post
Write-Host "`nTest 3: Create Image Post" -ForegroundColor Yellow
$body = @{
    text = "Test image post from SocialFly AI - $(Get-Date)"
    imageUrl = "https://via.placeholder.com/800x600"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/linkedin/image-post" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS: Image post created" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host "`nLinkedIn API tests completed!" -ForegroundColor Cyan
