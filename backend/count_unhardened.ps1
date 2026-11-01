$raw = Get-Content "d:\Projects\Job Application Portal\trivy_unhardened.json" -Raw
$data = $raw | ConvertFrom-Json
$criticalCount = 0
$highCount = 0

foreach ($res in $data.Results) {
    if ($res.Vulnerabilities) {
        foreach ($vuln in $res.Vulnerabilities) {
            if ($vuln.Severity -eq "CRITICAL") { $criticalCount++ }
            if ($vuln.Severity -eq "HIGH") { $highCount++ }
        }
    }
}

Write-Host "=========================================="
Write-Host "UNHARDENED DOCKER IMAGE SCAN RESULTS"
Write-Host "Base Image: node:20 (Debian 12 Bookworm, Root User)"
Write-Host "=========================================="
Write-Host "CRITICAL Vulnerabilities: $criticalCount"
Write-Host "HIGH Vulnerabilities:     $highCount"
Write-Host "TOTAL HIGH + CRITICAL:    $($criticalCount + $highCount)"
Write-Host "=========================================="
