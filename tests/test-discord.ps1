# Discord API Tests
# Update the CHANNEL_ID with your actual Discord channel ID

$BASE_URL = "http://localhost:3000"
$CHANNEL_ID = "YOUR_CHANNEL_ID_HERE"

Write-Host "Testing Discord API..." -ForegroundColor Cyan

# Test 1: Send text message
Write-Host "`nTest 1: Send Text Message" -ForegroundColor Yellow
$body = @{
    channelId = $CHANNEL_ID
    content = "Test message from SocialFly AI - $(Get-Date)"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/discord/send-message" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS: Message sent" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 2: Send message with media (if test file exists)
Write-Host "`nTest 2: Send Message with Media" -ForegroundColor Yellow
$testImagePath = ".\tests\test-image.jpg"

if (Test-Path $testImagePath) {
    $boundary = [System.Guid]::NewGuid().ToString()
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"channelId`"",
        "",
        $CHANNEL_ID,
        "--$boundary",
        "Content-Disposition: form-data; name=`"content`"",
        "",
        "Test message with media - $(Get-Date)",
        "--$boundary",
        "Content-Disposition: form-data; name=`"files`"; filename=`"test-image.jpg`"",
        "Content-Type: image/jpeg",
        "",
        [System.IO.File]::ReadAllText($testImagePath),
        "--$boundary--"
    )
    
    Write-Host "Note: For file uploads, use the web interface or curl commands" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Skipped: Test image not found at $testImagePath" -ForegroundColor Yellow
}

Write-Host "`nDiscord API tests completed!" -ForegroundColor Cyan
