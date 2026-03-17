# PowerShell测试脚本

# 测试1：健康检查
Write-Host "测试1：健康检查" -ForegroundColor Green
$healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -Method Get
$healthResponse | ConvertTo-Json | Write-Host
Write-Host ""

# 测试2：登录（正确凭证）
Write-Host "测试2：登录（正确凭证）" -ForegroundColor Green
$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginResponse | ConvertTo-Json | Write-Host
Write-Host ""

# 测试3：获取项目列表
Write-Host "测试3：获取项目列表" -ForegroundColor Green
$projectsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/projects" -Method Get
$projectsResponse | ConvertTo-Json | Write-Host
Write-Host ""

# 测试4：获取条目列表
Write-Host "测试4：获取条目列表" -ForegroundColor Green
$entriesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/projects/45bd01fd-aa2d-40b1-ab23-5785375ac588/entries" -Method Get
$entriesResponse | ConvertTo-Json | Write-Host
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "所有测试完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
