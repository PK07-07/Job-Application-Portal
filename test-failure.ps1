$abJob = Start-Job -ScriptBlock {
    docker run --rm --network host httpd:alpine ab -n 1000 -c 20 http://127.0.0.1/api/jobs
}
Write-Host "Started load test job ($($abJob.Id)). Waiting 5 seconds before stopping backend3..."
Start-Sleep -Seconds 5
Write-Host "Stopping backend3 now..."
docker compose stop backend3
Write-Host "Waiting for load test to finish..."
$output = Receive-Job -Job $abJob -Wait
$output
