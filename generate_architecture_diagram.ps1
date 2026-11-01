Add-Type -AssemblyName System.Drawing

$width = 1650
$height = 1100
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background: Crisp off-white slate
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252)) # #F8FAFC
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Helper function to create rounded path
function Get-RoundedRectanglePath($x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc([float]$x, [float]$y, [float]$d, [float]$d, 180, 90)
    $path.AddArc([float]($x + $w - $d), [float]$y, [float]$d, [float]$d, 270, 90)
    $path.AddArc([float]($x + $w - $d), [float]($y + $h - $d), [float]$d, [float]$d, 0, 90)
    $path.AddArc([float]$x, [float]($y + $h - $d), [float]$d, [float]$d, 90, 90)
    $path.CloseFigure()
    return $path
}

# Helper to draw a component card
function Draw-ComponentCard($x, $y, $w, $h, $title, $sub, $port, $platform, $bgColor, $borderColor, $accentColor, $isDashed=$false) {
    $path = Get-RoundedRectanglePath $x $y $w $h 12

    # Subtle shadow
    $shadowPath = Get-RoundedRectanglePath ($x + 3) ($y + 3) $w $h 12
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 0, 0, 0))
    $g.FillPath($shadowBrush, $shadowPath)

    # Fill
    $fillBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillPath($fillBrush, $path)

    # Border
    $pen = New-Object System.Drawing.Pen($borderColor, 2)
    if ($isDashed) {
        $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $pen.DashPattern = @(4, 3)
    }
    $g.DrawPath($pen, $path)

    # Header bar
    $headerPath = Get-RoundedRectanglePath $x $y $w 32 12
    $headerBrush = New-Object System.Drawing.SolidBrush($accentColor)
    $g.FillPath($headerBrush, $headerPath)
    $rectPatch = New-Object System.Drawing.RectangleF([float]$x, [float]($y + 18), [float]$w, 14.0)
    $g.FillRectangle($headerBrush, $rectPatch)

    # Header text
    $hdrFont = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($platform.ToUpper(), $hdrFont, $whiteBrush, [float]($x + 12), [float]($y + 7))

    # Port badge if present
    if ($port) {
        $badgeFont = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
        $badgeText = $port
        $sz = $g.MeasureString($badgeText, $badgeFont)
        $badgeW = [float]$sz.Width
        $badgeX = [float]($x + $w - $badgeW - 12)
        $badgeY = [float]($y + 5)
        $badgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
        $g.FillRectangle($badgeBg, [float]($badgeX - 4), [float]$badgeY, [float]($badgeW + 8), 20.0)
        $g.DrawString($badgeText, $badgeFont, $whiteBrush, [float]$badgeX, [float]($y + 7))
    }

    # Card Title
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 11.5, [System.Drawing.FontStyle]::Bold)
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.DrawString($title, $titleFont, $darkBrush, [float]($x + 12), [float]($y + 40))

    # Subtitle / Details
    $subFont = New-Object System.Drawing.Font("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
    $layoutRect = New-Object System.Drawing.RectangleF([float]($x + 12), [float]($y + 64), [float]($w - 24), [float]($h - 68))
    $g.DrawString($sub, $subFont, $mutedBrush, $layoutRect)
}

# Helper to draw connecting arrows
function Draw-Arrow($x1, $y1, $x2, $y2, $label, $color, $isDashed=$false) {
    $pen = New-Object System.Drawing.Pen($color, 2.2)
    $cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(5, 5, $true)
    $pen.CustomEndCap = $cap
    if ($isDashed) {
        $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $pen.DashPattern = @(4, 3)
    }

    $g.DrawLine($pen, [float]$x1, [float]$y1, [float]$x2, [float]$y2)

    if ($label) {
        $lblFont = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
        $size = $g.MeasureString($label, $lblFont)
        $mx = ($x1 + $x2) / 2 - ($size.Width / 2)
        $my = ($y1 + $y2) / 2 - ($size.Height / 2) - 2

        $bgPad = New-Object System.Drawing.RectangleF([float]($mx - 5), [float]($my - 2), [float]($size.Width + 10), [float]($size.Height + 4))
        $bgBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
        $g.FillRectangle($bgBr, $bgPad)
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1)
        $g.DrawRectangle($borderPen, $bgPad.X, $bgPad.Y, $bgPad.Width, $bgPad.Height)

        $textBr = New-Object System.Drawing.SolidBrush($color)
        $g.DrawString($label, $lblFont, $textBr, [float]$mx, [float]$my)
    }
}

# ==============================================================================
# HEADER BLOCK
# ==============================================================================
$mainTitleFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$titleBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 58, 138)) # Navy #1E3A8A
$g.DrawString("Job Application Portal - Scaled & Resilient Cloud Architecture", $mainTitleFont, $titleBr, 45, 28)

$subTitleFont = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Regular)
$subTitleBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
$g.DrawString("BACSE344 Digital Assignment 3 | Multi-Instance Container Cluster, High-Availability Failover & Cloud Bursting / Edge Tier", $subTitleFont, $subTitleBr, 45, 68)

# Top separator line
$sepPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
$g.DrawLine($sepPen, 45, 96, ($width - 45), 96)

# ==============================================================================
# SECTION 1: CLIENTS & INGRESS (LEFT)
# ==============================================================================
# Users Box
$userColor = [System.Drawing.Color]::FromArgb(241, 245, 249)
$userBorder = [System.Drawing.Color]::FromArgb(148, 163, 184)
$userAccent = [System.Drawing.Color]::FromArgb(71, 85, 105)
Draw-ComponentCard 45 130 270 120 "Candidate & Recruiter" "Web & Mobile Clients`nPlacement Blitz (10,000+ Reqs)`nHigh Concurrency Ingress" "HTTPS" "Client Layer" $userColor $userBorder $userAccent

# Assignment 1 Frontend (Vercel)
$feColor = [System.Drawing.Color]::FromArgb(238, 242, 255)
$feBorder = [System.Drawing.Color]::FromArgb(99, 102, 241)
$feAccent = [System.Drawing.Color]::FromArgb(79, 70, 229)
Draw-ComponentCard 45 310 270 145 "frontend (Next.js 14)" "Hosted on Vercel Edge Network`njob-application-portal-theta.vercel.app`nCandidate UI, Job Filters & Auth" "PORT 443" "Vercel Hosting (Asg 1)" $feColor $feBorder $feAccent

# Assignment 1 Render PaaS Reference Box
$rndColor = [System.Drawing.Color]::FromArgb(245, 243, 255)
$rndBorder = [System.Drawing.Color]::FromArgb(168, 85, 247)
$rndAccent = [System.Drawing.Color]::FromArgb(126, 34, 206)
Draw-ComponentCard 45 520 270 145 "Web Service (Render PaaS)" "job-application-portal-111q.onrender.com`nOriginal Assignment 1 Deployment`nManaged Cloud Node.js Container" "PORT 443" "Render Cloud (Asg 1)" $rndColor $rndBorder $rndAccent

# ==============================================================================
# SECTION 2: CORE CONTAINER CLUSTER (MIDDLE)
# ==============================================================================
# Large container boundary
$clusterBox = Get-RoundedRectanglePath 360 130 710 745 16
$clusterBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 249, 255))
$g.FillPath($clusterBg, $clusterBox)
$clusterBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(56, 189, 248), 2)
$clusterBorderPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$g.DrawPath($clusterBorderPen, $clusterBox)

# Cluster Header
$clusterHdrFont = New-Object System.Drawing.Font("Segoe UI", 11.5, [System.Drawing.FontStyle]::Bold)
$clusterHdrBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(3, 105, 161))
$g.DrawString("DOCKER ENGINE CLUSTER (Docker Compose: jobapplicationportal_default)", $clusterHdrFont, $clusterHdrBr, 385, 146)

# Nginx Load Balancer Card
$lbColor = [System.Drawing.Color]::FromArgb(255, 255, 255)
$lbBorder = [System.Drawing.Color]::FromArgb(2, 132, 199)
$lbAccent = [System.Drawing.Color]::FromArgb(2, 132, 199)
Draw-ComponentCard 390 195 650 145 "nginx-load-balancer (Nginx 1.25 Alpine)" "Reverse Proxy & Load Balancer | Host Port 80 -> Container 80`nScheduling: Round-Robin Algorithm | Health Checks: max_fails=3 fail_timeout=10s`nActive Zero-Downtime Failover: proxy_next_upstream error timeout http_502 http_503`nConnection Management: proxy_connect_timeout 2s | Retries: 3 attempts" "PORT 80" "Reverse Proxy & Load Balancer" $lbColor $lbBorder $lbAccent

# Three Backend Instances
$b1Color = [System.Drawing.Color]::FromArgb(255, 255, 255)
$b1Border = [System.Drawing.Color]::FromArgb(14, 165, 233)
$b1Accent = [System.Drawing.Color]::FromArgb(14, 165, 233)

Draw-ComponentCard 390 405 200 170 "backend-instance-1" "Node.js 20 Express`nPrivate IP: 172.19.0.4`nJobs API, Auth & RBAC`nX-Served-By Header`nMongoose Connection Pool" "PORT 5000" "Docker Node 1" $b1Color $b1Border $b1Accent
Draw-ComponentCard 615 405 200 170 "backend-instance-2" "Node.js 20 Express`nPrivate IP: 172.19.0.2`nJobs API, Auth & RBAC`nX-Served-By Header`nMongoose Connection Pool" "PORT 5000" "Docker Node 2" $b1Color $b1Border $b1Accent
Draw-ComponentCard 840 405 200 170 "backend-instance-3" "Node.js 20 Express`nPrivate IP: 172.19.0.3`nFailover Evaluated`nAuto-Rerouted Mid-Test`nMongoose Connection Pool" "PORT 5000" "Docker Node 3" $b1Color $b1Border $b1Accent

# Failover & High Availability Feature Badge inside Docker
$faBox = Get-RoundedRectanglePath 390 625 650 100 10
$faBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(224, 242, 254))
$g.FillPath($faBg, $faBox)
$faBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(56, 189, 248), 1.5)
$g.DrawPath($faBorderPen, $faBox)

$faFont = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$faTextBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(3, 105, 161))
$g.DrawString("HIGH AVAILABILITY & ACTIVE FAILOVER MECHANISM (Question 1c)", $faFont, $faTextBr, 410, 638)

$faSubFont = New-Object System.Drawing.Font("Segoe UI", 8.8, [System.Drawing.FontStyle]::Regular)
$faSubTextBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.DrawString("- Mid-Test Crash: backend-instance-3 was abruptly killed 5s into active load test (1,000 reqs, c=20)`n- Unprotected Nginx (proxy_next_upstream off): Produced 9 failed requests (HTTP 502 Bad Gateway)`n- Resilient Nginx (proxy_next_upstream active): Intercepted dead socket in 2s, replaying 100% of requests`n- Result: ZERO dropped requests (9 -> 0) | Throughput: 27.67 req/sec | Mean latency: 722 ms", $faSubFont, $faSubTextBr, 410, 658)

# Multi-Instance Connection Pooling Summary Box
$statBox = Get-RoundedRectanglePath 390 745 650 110 10
$statBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
$g.FillPath($statBg, $statBox)
$statBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1.5)
$g.DrawPath($statBorderPen, $statBox)

$statFont = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$statTextBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.DrawString("APACHE BENCH LOAD TEST BENCHMARK RESULTS (Question 1b: 1,000 Reqs, Concurrency 20)", $statFont, $statTextBr, 410, 757)

$statSubFont = New-Object System.Drawing.Font("Segoe UI", 8.8, [System.Drawing.FontStyle]::Regular)
$statSubTextBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))
$g.DrawString("- 1 Backend Instance (Baseline):  12.21 req/sec | Mean Latency: 1,638.06 ms | Max Tail Lag: 19,116 ms`n- 3 Backend Instances (Load Balanced): 22.06 req/sec | Mean Latency: 906.78 ms   | Max Tail Lag: 4,267 ms`n- QUANTITATIVE IMPROVEMENT: +80.7% Throughput (+1.81x) | 44.6% Latency Reduction | 77.7% Lower Max Lag`n- 95th Percentile Latency: Reduced from 6,341 ms down to 2,636 ms (58.4% faster high-concurrency response)", $statSubFont, $statSubTextBr, 410, 777)

# ==============================================================================
# SECTION 3: CLOUD BURSTING & EDGE / FOG TIER (RIGHT - DISTINCT AMBER/ORANGE)
# ==============================================================================
# Distinct Amber Outline Container
$burstBox = Get-RoundedRectanglePath 1120 130 480 475 16
$burstBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 243, 199)) # #FEF3C7
$g.FillPath($burstBg, $burstBox)
$burstBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(217, 119, 6), 2.5) # #D97706
$burstBorderPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$burstBorderPen.DashPattern = @(6, 4)
$g.DrawPath($burstBorderPen, $burstBox)

# Distinct Tier Header
$burstHdrFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$burstHdrBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 83, 9))
$g.DrawString("CLOUD BURSTING & EDGE / FOG TIER", $burstHdrFont, $burstHdrBr, 1145, 146)

$burstBadgeFont = New-Object System.Drawing.Font("Segoe UI", 8.8, [System.Drawing.FontStyle]::Bold)
$burstBadgeBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(146, 64, 14))
$g.DrawString("(Distinct Color: Peak Surge Offloading & Autoscaling Tier)", $burstBadgeFont, $burstBadgeBr, 1145, 170)

# Edge Computing Component
$edgeColor = [System.Drawing.Color]::FromArgb(255, 251, 235)
$edgeBorder = [System.Drawing.Color]::FromArgb(245, 158, 11)
$edgeAccent = [System.Drawing.Color]::FromArgb(217, 119, 6)
Draw-ComponentCard 1145 200 430 170 "Cloudflare Edge Workers & KV" "Edge / Fog Caching Tier | Sub-10ms Cache Hits`nGlobal Anycast Points of Presence (PoPs)`nAbsorbs 85-90% of Placement Browse Traffic`nCached API: GET /api/jobs (Search Queries & Filters)`nShields origin servers and database during surges" "PORT 443 HTTPS" "Edge / Fog Computing Tier" $edgeColor $edgeBorder $edgeAccent

# Cloud Bursting Serverless Containers Component
$cbColor = [System.Drawing.Color]::FromArgb(255, 251, 235)
$cbBorder = [System.Drawing.Color]::FromArgb(245, 158, 11)
$cbAccent = [System.Drawing.Color]::FromArgb(217, 119, 6)
Draw-ComponentCard 1145 395 430 185 "Elastic Serverless Burst Containers" "AWS ECS Fargate / Render Autoscaling Tier`nSurge Trigger: Nginx CPU > 75% or Backlog > 200`nAuto-provisions ephemeral Express containers`nAbsorbs write-heavy spikes (mass job applications)`nScales down to ZERO idle instances when surge subsides" "PORT 5000 DYNAMIC" "Cloud Bursting Tier" $cbColor $cbBorder $cbAccent

# ==============================================================================
# SECTION 4: CLOUD DATABASE TIER (BOTTOM RIGHT)
# ==============================================================================
$dbColor = [System.Drawing.Color]::FromArgb(236, 253, 245) # Mint #ECFDF5
$dbBorder = [System.Drawing.Color]::FromArgb(16, 185, 129)
$dbAccent = [System.Drawing.Color]::FromArgb(5, 150, 105)
Draw-ComponentCard 1120 635 480 240 "MongoDB Atlas Cloud Database (M0)" "cluster0.9j1tt89.mongodb.net | Database: jobportal`n3-Node Managed Replica Set | TLS/SSL Encrypted SRV`nCollections: users, jobs, applications`nSecurity: 12-round salted bcrypt hashes (`$2b`$12$`)`nConnection Limits: Max 500 shared concurrent sockets`nPreserved by Edge Caching offloading read traffic" "PORT 27017 TLS" "Managed Cloud Database (Asg 1)" $dbColor $dbBorder $dbAccent

# ==============================================================================
# CONNECTING FLOW ARROWS
# ==============================================================================
$flowBlue = [System.Drawing.Color]::FromArgb(37, 99, 235)
$flowGreen = [System.Drawing.Color]::FromArgb(5, 150, 105)
$flowAmber = [System.Drawing.Color]::FromArgb(217, 119, 6)
$flowPurple = [System.Drawing.Color]::FromArgb(126, 34, 206)

# User -> Frontend
Draw-Arrow 180 250 180 310 "1. Page Load" $flowBlue

# Frontend -> Nginx
Draw-Arrow 315 370 390 260 "2. API Calls (Port 80)" $flowBlue

# Users -> Direct API (Alternative)
Draw-Arrow 315 190 390 215 "Direct Ingress" $flowBlue

# Nginx -> Backend 1, 2, 3
Draw-Arrow 490 340 490 405 "Round-Robin #1" $flowBlue
Draw-Arrow 715 340 715 405 "Round-Robin #2" $flowBlue
Draw-Arrow 940 340 940 405 "Round-Robin #3" $flowBlue

# Backends -> MongoDB Atlas (Bottom)
Draw-Arrow 590 535 1120 720 "Mongoose TLS Connection Pool" $flowGreen
Draw-Arrow 815 535 1120 755 "Mongoose TLS Connection Pool" $flowGreen
Draw-Arrow 940 575 1120 790 "Mongoose Queries" $flowGreen

# Surge Flow: User -> Edge Cache
Draw-Arrow 315 150 1145 230 "Peak Read Surge (GET /api/jobs)" $flowAmber $true

# Surge Flow: Edge Cache Hit (Sub-10ms)
Draw-Arrow 1145 260 315 175 "Sub-10ms Edge Hits (85-90% Traffic Absorbed)" $flowAmber $true

# Surge Flow: Nginx -> Cloud Bursting Tier (Trigger >75% CPU)
Draw-Arrow 1040 270 1145 440 "CPU > 75%: Burst Trigger" $flowAmber $true

# Cloud Bursting -> MongoDB Atlas
Draw-Arrow 1360 580 1360 635 "Dynamic Scaled Pool" $flowAmber $true

# Assignment 1 Render baseline link
Draw-Arrow 315 590 390 590 "Assignment 1 Base" $flowPurple $true

# ==============================================================================
# BOTTOM FOOTER / LEGEND
# ==============================================================================
$footerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)
$g.DrawLine($footerPen, 45, 910, ($width - 45), 910)

$legendFont = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)

# Legend 1: Core Docker
$g.FillRectangle((New-Object System.Drawing.SolidBrush($flowBlue)), 55, 935, 18, 18)
$g.DrawString("Core Docker Compose & Nginx Tier (Part 1a/1b/1c)", $legendFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 80, 935)

# Legend 2: Cloud Bursting / Edge
$g.FillRectangle((New-Object System.Drawing.SolidBrush($flowAmber)), 530, 935, 18, 18)
$g.DrawString("Cloud Bursting & Edge/Fog Tier (Part 1d - Marked in Distinct Amber/Orange)", $legendFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 83, 9))), 555, 935)

# Legend 3: Database
$g.FillRectangle((New-Object System.Drawing.SolidBrush($flowGreen)), 1150, 935, 18, 18)
$g.DrawString("Managed Database & PaaS (Assignment 1)", $legendFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))), 1175, 935)

$footNoteFont = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Italic)
$footNoteBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$g.DrawString("Architecture Design for BACSE344 Digital Assignment 3 | GitHub Branch: https://github.com/PK07-07/Job-Application-Portal/tree/assignment-3", $footNoteFont, $footNoteBr, 55, 970)

# ==============================================================================
# SAVE BITMAP
# ==============================================================================
$outputPath = "D:\Projects\Job Application Portal\architecture_diagram.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Host "Architecture diagram successfully regenerated at: $outputPath"
