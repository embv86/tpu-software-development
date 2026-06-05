# Base API Gateway URL
$GatewayUrl = "http://127.0.0.1:8080/api/v1"

# === 1. REGISTRATION OF USERS ===
Write-Host "=== 1. REGISTRATION OF USERS ===" -ForegroundColor Cyan

function Register-MarketplaceUser ($username, $email) {
    $body = @{
        username = $username
        email = $email
        password = "password123"
        firstName = $username
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$GatewayUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
        Write-Host "User $username successfully registered!" -ForegroundColor Green
        return $response.token
    } catch {
        Write-Host "Error registering $username : ${_.Exception.Message}" -ForegroundColor Red
        return $null
    }
}

$ErdemToken = Register-MarketplaceUser "Erdem" "erdem@tpu.ru"
$IvanToken  = Register-MarketplaceUser "Ivan" "ivan@tpu.ru"
$EgorToken  = Register-MarketplaceUser "Egor" "egor@tpu.ru"

Write-Host "------------------------------------------------"

# === 2. CREATING LISTINGS ===
Write-Host "=== 2. CREATING LISTINGS ===" -ForegroundColor Cyan

function Create-Listing ($token, $title, $price) {
    $headers = @{ Authorization = "Bearer $token" }
    $body = @{
        title = $title
        description = "Auto generated description for $title"
        price = $price
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$GatewayUrl/listings" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
    } catch {
        Write-Host "Error creating listing '$title' : ${_.Exception.Message}" -ForegroundColor Red
    }
}

if ($ErdemToken) {
    Write-Host "Erdem is creating 10 listings..." -ForegroundColor Yellow
    1..10 | ForEach-Object {
        Create-Listing -token $ErdemToken -title "Product Erdem No.$_" -price ($_ * 100)
        Write-Host "." -NoNewline
    }
    Write-Host " Done!" -ForegroundColor Green
}

if ($IvanToken) {
    Write-Host "Ivan is creating 5 listings..." -ForegroundColor Yellow
    1..5 | ForEach-Object {
        Create-Listing -token $IvanToken -title "Product Ivan No.$_" -price ($_ * 150)
        Write-Host "." -NoNewline
    }
    Write-Host " Done!" -ForegroundColor Green
}

Write-Host "------------------------------------------------"

# === 3. CHAT SIMULATION ===
Write-Host "=== 3. CHAT SIMULATION ===" -ForegroundColor Cyan

function Send-ChatMessage ($token, $listingId, $buyerId, $sellerId, $senderId, $text) {
    $headers = @{ Authorization = "Bearer $token" }
    $body = @{
        listingId = $listingId
        buyerId = $buyerId
        sellerId = $sellerId
        senderId = $senderId
        text = $text
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$GatewayUrl/chats/send" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
    } catch {
        Write-Host "Error sending message : ${_.Exception.Message}" -ForegroundColor Red
    }
}

# Simulate chat for listings with IDs 1, 2, 3 (Erdem = 1, Egor = 3)
if ($ErdemToken -and $EgorToken) {
    1..3 | ForEach-Object {
        $listingId = $_
        Write-Host "Starting dialog for listing #$listingId..." -ForegroundColor Yellow

        Write-Host "  Egor: Hi! Is product #$listingId still available?"
        Send-ChatMessage -token $EgorToken -listingId $listingId -buyerId 3 -sellerId 1 -senderId 3 -text "Hi! Is product #$listingId still available?"
        Start-Sleep -Milliseconds 300

        Write-Host "  Erdem: Hi! Yes, sure."
        Send-ChatMessage -token $ErdemToken -listingId $listingId -buyerId 3 -sellerId 1 -senderId 1 -text "Hi! Yes, sure."
        Start-Sleep -Milliseconds 300
    }
}

Write-Host "🚀 Automation successfully finished!" -ForegroundColor Green