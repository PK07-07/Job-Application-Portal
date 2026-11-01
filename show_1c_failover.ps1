Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host " BACSE344 - CONTAINER CRASH & ACTIVE FAILOVER COMPARISON (Question 1c)" -ForegroundColor Cyan
Write-Host " Failure Event: backend-instance-3 abruptly stopped mid-load test" -ForegroundColor Cyan
Write-Host " Benchmark: 1,000 HTTP Requests | Concurrency: 20 Simultaneous Clients" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""

$data = @(
    [PSCustomObject]@{ "Condition" = "Simulated Event"; "Before (Unprotected)" = "backend3 killed 5s into test"; "After (Resilient Nginx)" = "backend3 killed 5s into test"; "Result / Delta" = "Identical Trigger" },
    [PSCustomObject]@{ "Condition" = "Total Attempted"; "Before (Unprotected)" = "1,000 requests"; "After (Resilient Nginx)" = "1,000 requests"; "Result / Delta" = "1,000 requests" },
    [PSCustomObject]@{ "Condition" = "Completed Requests"; "Before (Unprotected)" = "991 (Premature failure)"; "After (Resilient Nginx)" = "1,000 completed"; "Result / Delta" = "100% Completed" },
    [PSCustomObject]@{ "Condition" = "Failed Requests"; "Before (Unprotected)" = "9 Failed Requests"; "After (Resilient Nginx)" = "0 Failed Requests"; "Result / Delta" = "100% Failures Eliminated" },
    [PSCustomObject]@{ "Condition" = "HTTP Errors"; "Before (Unprotected)" = "HTTP 502 Bad Gateway"; "After (Resilient Nginx)" = "None (100% HTTP 200 OK)"; "Result / Delta" = "Zero Client Errors" },
    [PSCustomObject]@{ "Condition" = "Throughput Under Crash"; "Before (Unprotected)" = "12.92 req/sec"; "After (Resilient Nginx)" = "27.67 req/sec"; "Result / Delta" = "Over 2.1x Throughput" },
    [PSCustomObject]@{ "Condition" = "Mean Latency"; "Before (Unprotected)" = "1,547.65 ms"; "After (Resilient Nginx)" = "722.78 ms"; "Result / Delta" = "53.3% Faster Recovery" },
    [PSCustomObject]@{ "Condition" = "End-User Experience"; "Before (Unprotected)" = "Application drop / error alert"; "After (Resilient Nginx)" = "Seamless retry re-routing"; "Result / Delta" = "Zero-Downtime Achieved" }
)

$data | Format-Table -AutoSize

Write-Host "RESILIENT NGINX FAILOVER CONFIGURATION:" -ForegroundColor Yellow
Write-Host "proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;" -ForegroundColor Green
Write-Host "proxy_connect_timeout 2s; proxy_next_upstream_tries 3; max_fails=3 fail_timeout=10s;" -ForegroundColor Green
Write-Host "=================================================================================" -ForegroundColor Cyan
