Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host " BACSE344 - APACHE BENCH PERFORMANCE COMPARISON (Question 1b)" -ForegroundColor Cyan
Write-Host " Workload: 1,000 Requests | Concurrency: 20 Simultaneous Clients" -ForegroundColor Cyan
Write-Host " Hardest-Hit API: GET /api/jobs (Regex Match + Relational Population)" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""

$data = @(
    [PSCustomObject]@{ "Metric" = "Total Workload"; "1 Instance (Baseline)" = "1,000 requests"; "3 Instances (Scaled)" = "1,000 requests"; "Improvement / Delta" = "Identical Stress" },
    [PSCustomObject]@{ "Metric" = "Concurrency Level"; "1 Instance (Baseline)" = "20 concurrent"; "3 Instances (Scaled)" = "20 concurrent"; "Improvement / Delta" = "Identical Pressure" },
    [PSCustomObject]@{ "Metric" = "Total Elapsed Time"; "1 Instance (Baseline)" = "81.903 seconds"; "3 Instances (Scaled)" = "45.339 seconds"; "Improvement / Delta" = "44.6% Faster Completion" },
    [PSCustomObject]@{ "Metric" = "Throughput (Req/Sec)"; "1 Instance (Baseline)" = "12.21 req/sec"; "3 Instances (Scaled)" = "22.06 req/sec"; "Improvement / Delta" = "+80.7% Throughput (+1.81x)" },
    [PSCustomObject]@{ "Metric" = "Mean Response Time"; "1 Instance (Baseline)" = "1,638.06 ms"; "3 Instances (Scaled)" = "906.78 ms"; "Improvement / Delta" = "44.6% Latency Reduction (-731ms)" },
    [PSCustomObject]@{ "Metric" = "Median Latency (p50)"; "1 Instance (Baseline)" = "708 ms"; "3 Instances (Scaled)" = "668 ms"; "Improvement / Delta" = "5.6% Lower Median" },
    [PSCustomObject]@{ "Metric" = "90th Percentile Lag"; "1 Instance (Baseline)" = "3,589 ms"; "3 Instances (Scaled)" = "1,778 ms"; "Improvement / Delta" = "50.5% Lower High-Load Lag" },
    [PSCustomObject]@{ "Metric" = "95th Percentile Lag"; "1 Instance (Baseline)" = "6,341 ms"; "3 Instances (Scaled)" = "2,636 ms"; "Improvement / Delta" = "58.4% Lower Tail Lag" },
    [PSCustomObject]@{ "Metric" = "Worst-Case Tail Lag"; "1 Instance (Baseline)" = "19,116 ms (~19.1s)"; "3 Instances (Scaled)" = "4,267 ms (~4.3s)"; "Improvement / Delta" = "77.7% Reduction in Max Lag" },
    [PSCustomObject]@{ "Metric" = "Failed Requests"; "1 Instance (Baseline)" = "0 failed"; "3 Instances (Scaled)" = "0 failed"; "Improvement / Delta" = "100% Success Rate" }
)

$data | Format-Table -AutoSize

Write-Host "ANALYSIS:" -ForegroundColor Yellow
Write-Host "Single Node: Node.js event-loop starvation pushed tail latency to 19.1 seconds." -ForegroundColor Gray
Write-Host "3-Node Cluster: +80.7% throughput boost and 44.6% latency reduction across CPU cores." -ForegroundColor Green
Write-Host "=================================================================================" -ForegroundColor Cyan
