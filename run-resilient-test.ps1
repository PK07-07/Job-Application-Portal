Write-Host "=========================================="
Write-Host "STARTING APACHE BENCH ON RESILIENT NGINX..."
Write-Host "=========================================="
$ab = Start-Process -FilePath "docker" -ArgumentList "run --rm --network host httpd:alpine ab -n 1000 -c 20 http://127.0.0.1/api/jobs" -PassThru -NoNewWindow
Start-Sleep -Seconds 4

Write-Host "=========================================="
Write-Host "STOPPING BACKEND-INSTANCE-3 WHILE UNDER LOAD..."
Write-Host "=========================================="
docker compose stop backend3

Write-Host "Waiting for Apache Bench to complete with automatic failover..."
$ab.WaitForExit()

Write-Host "=========================================="
Write-Host "RESTORING BACKEND-3 FOR NORMAL OPERATION..."
Write-Host "=========================================="
docker compose start backend3
