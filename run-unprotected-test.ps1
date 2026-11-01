Write-Host "=========================================="
Write-Host "STARTING APACHE BENCH IN BACKGROUND..."
Write-Host "=========================================="
$ab = Start-Process -FilePath "docker" -ArgumentList "run --rm --network host httpd:alpine ab -n 1000 -c 20 http://127.0.0.1/api/jobs" -PassThru -NoNewWindow
Start-Sleep -Seconds 4

Write-Host "=========================================="
Write-Host "STOPPING BACKEND-INSTANCE-3 WHILE UNDER LOAD..."
Write-Host "=========================================="
docker compose stop backend3

Write-Host "Waiting for Apache Bench to complete..."
$ab.WaitForExit()

Write-Host "=========================================="
Write-Host "CHECKING FAILED REQUESTS (502 ERRORS) IN NGINX LOGS:"
Write-Host "=========================================="
docker logs nginx-load-balancer --tail 25 | Select-String -Pattern "502|connect\(\) failed"
