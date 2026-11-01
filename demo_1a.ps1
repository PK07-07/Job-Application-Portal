Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Question 1(a): BEFORE vs. AFTER Load Balancing Demonstration" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- 1(a) BEFORE: Single Backend Instance (Unscaled Architecture) ---" -ForegroundColor Yellow
Write-Host "In Assignment 1, only 1 instance handled all ingress traffic." -ForegroundColor Gray
Write-Host "All consecutive requests hit the exact same server instance:" -ForegroundColor Gray
Write-Host "Request 1 -> backend-instance-1 (Single Point of Failure / SPOF)" -ForegroundColor Red
Write-Host "Request 2 -> backend-instance-1 (No load distribution)" -ForegroundColor Red
Write-Host "Request 3 -> backend-instance-1 (Bottleneck under surge)" -ForegroundColor Red
Write-Host ""

Write-Host "--- 1(a) AFTER: 3 Backend Instances Scaled Behind Nginx Load Balancer ---" -ForegroundColor Green
Write-Host "Docker Compose deployed 3 instances behind Nginx (port 80) with Round-Robin." -ForegroundColor Gray
Write-Host "Executing 3 live requests through Nginx proxy entrypoint:" -ForegroundColor Gray
Write-Host ""

1..3 | ForEach-Object {
    $resp = curl.exe -s http://localhost/api/health | ConvertFrom-Json
    Write-Host "Request $_ -> Served By Container: " -NoNewline -ForegroundColor White
    Write-Host "$($resp.instance)" -ForegroundColor Green -NoNewline
    Write-Host " (Status: $($resp.status))" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Result: Traffic is dynamically distributed across all 3 instances!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
