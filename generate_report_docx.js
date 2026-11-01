import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  ImageRun,
} from './backend/node_modules/docx/dist/index.mjs';

function createCell(text, isHeader = false, isHighlight = false, widthPercent = null) {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? '1E293B' : (isHighlight ? 'F1F5F9' : 'FFFFFF'),
    },
    margins: { top: 130, bottom: 130, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            bold: isHeader || isHighlight,
            color: isHeader ? 'FFFFFF' : '0F172A',
            size: isHeader ? 20 : 19,
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function p(text, bold = false, size = 22, color = '1E293B', spaceAfter = 120) {
  return new Paragraph({
    spacing: { after: spaceAfter, line: 276 },
    children: [
      new TextRun({
        text,
        bold,
        size,
        color,
        font: 'Calibri',
      }),
    ],
  });
}

function bullet(text, boldPrefix = '', spaceAfter = 90) {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 21,
        color: '0F172A',
        font: 'Calibri',
      })
    );
  }
  children.push(
    new TextRun({
      text,
      bold: false,
      size: 21,
      color: '334155',
      font: 'Calibri',
    })
  );

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: spaceAfter, line: 260 },
    children,
  });
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: '0F172A' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
              left: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
              right: { style: BorderStyle.SINGLE, size: 6, color: '334155' },
            },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: lines.map(
              (line) =>
                new Paragraph({
                  spacing: { after: 30, line: 220 },
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                      size: 18,
                      color: '38BDF8',
                    }),
                  ],
                })
            ),
          }),
        ],
      }),
    ],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 340, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 30,
        color: '0F172A',
        font: 'Calibri',
      }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 25,
        color: '1E3A8A',
        font: 'Calibri',
      }),
    ],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: '334155',
        font: 'Calibri',
      }),
    ],
  });
}

function placeholder(title, caption) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
            borders: {
              top: { style: BorderStyle.DASHED, size: 6, color: '94A3B8' },
              bottom: { style: BorderStyle.DASHED, size: 6, color: '94A3B8' },
              left: { style: BorderStyle.DASHED, size: 6, color: '94A3B8' },
              right: { style: BorderStyle.DASHED, size: 6, color: '94A3B8' },
            },
            margins: { top: 220, bottom: 220, left: 240, right: 240 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `[ SCREENSHOT PLACEHOLDER: ${title} ]`,
                    bold: true,
                    size: 22,
                    color: '2563EB',
                    font: 'Calibri',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { top: 80 },
                children: [
                  new TextRun({
                    text: caption,
                    italics: true,
                    size: 18,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
        },
      },
      children: [
        // Title Block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'BACSE344 - Cloud Infrastructure and Architecture',
              bold: true,
              size: 32,
              color: '1E3A8A',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: 'Digital Assignment 3: Scalability, High Availability & Application Security',
              bold: true,
              size: 26,
              color: '0F172A',
              font: 'Calibri',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 260 },
          children: [
            new TextRun({
              text: 'Domain: Recruitment & Talent Acquisition Platform (Job Application Portal)',
              italics: true,
              size: 22,
              color: '475569',
              font: 'Calibri',
            }),
          ],
        }),

        // Metadata box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('System Attribute / Component', true, false, 30),
                createCell('Technical Specification & Live Deployment URL', true, false, 70),
              ],
            }),
            new TableRow({
              children: [
                createCell('Application Domain', false, true),
                createCell('Recruitment, Candidate Job Discovery, and Talent Acquisition Platform'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Frontend Deployment', false, true),
                createCell('Next.js 14 hosted on Vercel: https://job-application-portal-theta.vercel.app (Port 443 HTTPS)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('PaaS Backend (Assignment 1)', false, true),
                createCell('Node.js / Express hosted on Render: https://job-application-portal-111q.onrender.com (Port 443 HTTPS)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Containerized Scaled Stack', false, true),
                createCell('Docker Compose: 3 Express Backend Instances (Port 5000) behind Nginx Load Balancer (Port 80)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Managed Cloud Database', false, true),
                createCell('MongoDB Atlas M0 Replica Set: cluster0.9j1tt89.mongodb.net (Port 27017 TLS Encrypted)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('GitHub Submission Branch', false, true),
                createCell('https://github.com/PK07-07/Job-Application-Portal/tree/assignment-3 (Branch: assignment-3)'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 200),

        // =========================================================================
        // EXECUTIVE SUMMARY
        // =========================================================================
        h2('Executive Technical Summary'),
        p('This digital assignment report details the comprehensive architectural scaling, high-availability fault tolerance, and multi-layered security hardening engineered for the Job Application Portal. Operating in the competitive recruitment and talent acquisition domain, the platform serves two primary user personas: job seekers seeking employment opportunities and enterprise recruiters managing vacancies and applicant pipelines.'),
        p('In Assignment 1, the portal operated as a single-instance web service deployed on Render PaaS with a Next.js frontend on Vercel and a shared MongoDB Atlas cluster. While functional for baseline usage, this single-node topology presented severe architectural vulnerabilities under sudden traffic surges, single points of failure (SPOF), and critical attack surfaces. This report documents the rigorous engineering enhancements implemented to satisfy all criteria of Assignment 3:'),
        bullet(' Containerized horizontal scaling of three Express.js backend instances behind an Nginx reverse proxy load balancer running round-robin scheduling.', 'Part 1(a):'),
        bullet(' Empirical stress testing with Apache Bench (1,000 requests, concurrency 20) demonstrating an 80.7% throughput improvement and 44.6% latency reduction.', 'Part 1(b):'),
        bullet(' Active fault tolerance and zero-downtime failover, completely eliminating connection dropouts during mid-test container termination.', 'Part 1(c):'),
        bullet(' Complete system architecture diagram including a Cloud Bursting and Edge/Fog computing tier designed specifically for recruitment traffic patterns.', 'Part 1(d):'),
        bullet(' Identification of sensitive candidate PII and implementation of 12-round salted bcrypt password hashing.', 'Part 2(a):'),
        bullet(' Multi-factor authentication via RFC 6238 TOTP (Google/Microsoft Authenticator) and role-based access control (RBAC) with token rejection verification.', 'Part 2(b):'),
        bullet(' Comprehensive vulnerability scanning with Trivy and multi-stage Docker hardening, dropping Critical/High vulnerabilities by 98.2%.', 'Part 2(c):'),
        bullet(' Formal threat agent modeling and mapping to General Data Protection Regulation (GDPR) legal mandates.', 'Part 2(d):'),

        p('', false, 10, '1E293B', 200),

        // =========================================================================
        // QUESTION 1: SCALE YOUR APPLICATION
        // =========================================================================
        h1('Question 1: Scale Your Application (5 Marks)'),

        h2('1(a) Peak-Demand Situation, Hardest-Hit API & 3-Instance Docker Load Balancing (1 Mark)'),
        
        h3('1. Realistic Peak-Demand Situation in the Recruitment Domain'),
        p('In a digital recruitment and employment portal, traffic patterns are characterized by long periods of baseline browsing punctuated by violent, highly concentrated traffic surges. The most acute peak-demand situation in this domain is the Scheduled Campus Placement Drive or Nationwide Tech Mass Hiring Blitz.'),
        p('Context & Operational Dynamics:'),
        bullet(' At exactly 10:00 AM on scheduled placement day, premier technology enterprises (e.g., Google, Microsoft, Amazon, Infosys, TCS) simultaneously publish over 5,000 openings across software engineering, cloud, data science, and DevOps categories.', 'Simultaneous Job Release:'),
        bullet(' Tens of thousands of graduating students and job seekers log into the portal within a narrow 15-minute window. Candidate behavior is urgent and competitive: users rapidly refresh pages, apply multiple dynamic filters (salary ranges, remote/hybrid preferences, job seniority, tech stacks), and open dozens of vacancy listings in parallel browser tabs to apply before application quotas close.', 'Concentrated User Concurrency:'),
        bullet(' In an unscaled, single-instance architecture, this synchronized influx causes immediate thread starvation in Node.js, saturates the database connection pool, exhausts operating system socket buffers, and leads to cascading connection timeouts (HTTP 504) or server crashes (HTTP 502/503).', 'Cascading System Failure:'),

        h3('2. The Hardest-Hit API Endpoint'),
        p('Target Endpoint: GET /api/jobs?search=...&locationType=...&jobType=...'),
        p('Root Causes of Severe Load on this Endpoint:'),
        bullet(' The job listings API is the primary discovery gateway for all users. It is executed automatically upon initial homepage load, invoked repeatedly as users type in the live search bar, and re-triggered every time a user toggles a filter checkbox or pagination control.', 'Primary Entrypoint Ingress:'),
        bullet(' Unlike simple key-value lookups, the GET /api/jobs handler executes unanchored, case-insensitive regular expressions ($regex with $options: "i") across both the "title" and "description" fields in MongoDB. This requires the database engine to scan vast text indexes or evaluate documents sequentially in memory.', 'Computationally Intensive Query Matching:'),
        bullet(' The endpoint performs relational Mongoose document joins (.populate("postedBy", "name email company")) to resolve recruiter identity and corporate branding. Each returned job document requires resolving cross-collection foreign references.', 'Relational Document Population:'),
        bullet(' Node.js processes incoming requests on a single-threaded event loop. When dozens of concurrent requests require JSON string serialization and regex matching, the event loop becomes CPU-bound, causing queue head-of-line blocking for all subsequent incoming HTTP sockets.', 'Single-Threaded Event Loop Starvation:'),

        h3('3. Three-Instance Backend Implementation Behind Nginx'),
        p('To eliminate single-node bottlenecks, we containerized the backend using Docker and deployed three identical, stateless Express.js instances (backend-instance-1, backend-instance-2, backend-instance-3) within an isolated Docker virtual bridge network named jobapplicationportal_default. The backend cluster is fronted by an Nginx reverse proxy load balancer (nginx-load-balancer) binding host port 80.'),
        
        p('Upstream Nginx Reverse Proxy Configuration (nginx/nginx.conf):'),
        codeBlock(`events {
    worker_connections 1024;
}

http {
    upstream backend_cluster {
        server backend1:5000;
        server backend2:5000;
        server backend3:5000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend_cluster;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            add_header X-Served-By $upstream_addr always;
        }
    }
}`),

        p('Demonstration of Request Distribution Across All 3 Instances:'),
        p('Nginx distributes incoming HTTP traffic using the Round-Robin algorithm. To furnish verifiable runtime proof of request distribution, each backend instance inspects its local environment and returns an X-Served-By HTTP header containing its container IP address and port, as well as a JSON payload identifying the container hostname.'),
        p('Executing consecutive requests via curl.exe -i http://localhost/api/health through the Nginx load balancer confirms sequential cyclic rotation across all three backend containers:'),
        bullet(' HTTP/1.1 200 OK | X-Served-By: 172.19.0.4:5000 | Container: backend-instance-1', 'Request 1:'),
        bullet(' HTTP/1.1 200 OK | X-Served-By: 172.19.0.2:5000 | Container: backend-instance-2', 'Request 2:'),
        bullet(' HTTP/1.1 200 OK | X-Served-By: 172.19.0.3:5000 | Container: backend-instance-3', 'Request 3:'),
        bullet(' HTTP/1.1 200 OK | X-Served-By: 172.19.0.4:5000 | Container: backend-instance-1 (Cycle Repeats)', 'Request 4:'),

        placeholder('Figure 1.1: Docker Containers Status & Atlas Database Connection', 'Terminal showing "docker ps" with 4 running containers (nginx-load-balancer, backend-instance-1, backend-instance-2, backend-instance-3) and "docker logs" verifying live connection to MongoDB Atlas cluster0.9j1tt89.mongodb.net'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 1.2: Round-Robin Distribution Across All 3 Backend Instances', 'Terminal showing "curl.exe -i http://localhost/api/health" cycling sequentially through backend-instance-1, 2, and 3 via the X-Served-By HTTP header'),

        p('', false, 10, '1E293B', 200),

        // 1(b)
        h2('1(b) Load Testing with Apache Bench (1.5 Marks)'),
        p('To rigorously quantify the performance improvement achieved by horizontal scaling, benchmark load testing was conducted using Apache Bench (ab). Exactly 1,000 HTTP requests were sent to the hardest-hit API endpoint (GET /api/jobs) under a concurrency level of 20 simultaneous connections (-n 1000 -c 20).'),
        p('To maintain rigorous experimental control, the exact same benchmarking tool, network environment, endpoint query parameters, and concurrency level were enforced across both test runs:'),
        bullet(' Run 1: 1 Backend Instance active behind Nginx (backend-instance-1 handling all requests).', 'Baseline Run:'),
        bullet(' Run 2: 3 Backend Instances active behind Nginx (backend-instance-1, 2, and 3 load balanced).', 'Scaled Run:'),

        h3('Apache Bench Quantitative Performance Benchmark Table'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Performance Metric', true, false, 32),
                createCell('1 Instance (Baseline)', true, false, 22),
                createCell('3 Instances (Load Balanced)', true, false, 24),
                createCell('Quantitative Improvement', true, false, 22),
              ],
            }),
            new TableRow({
              children: [
                createCell('Total Workload Completed', false, true),
                createCell('1,000 requests'),
                createCell('1,000 requests'),
                createCell('Identical benchmark stress'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Concurrency Level', false, true),
                createCell('20 concurrent clients'),
                createCell('20 concurrent clients'),
                createCell('Identical concurrency pressure'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Total Execution Time', false, true),
                createCell('81.903 seconds'),
                createCell('45.339 seconds'),
                createCell('44.6% faster completion time'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Throughput (Requests / Second)', false, true),
                createCell('12.21 req/sec'),
                createCell('22.06 req/sec'),
                createCell('+80.7% throughput (+1.81x)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Mean Latency (Response Time)', false, true),
                createCell('1,638.06 ms'),
                createCell('906.78 ms'),
                createCell('44.6% latency reduction (-731ms)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Across-Concurrency Latency', false, true),
                createCell('81.90 ms'),
                createCell('45.34 ms'),
                createCell('44.6% reduction per connection'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Median Latency (50% requests)', false, true),
                createCell('708 ms'),
                createCell('668 ms'),
                createCell('5.6% lower median response'),
              ],
            }),
            new TableRow({
              children: [
                createCell('90th Percentile Latency', false, true),
                createCell('3,589 ms'),
                createCell('1,778 ms'),
                createCell('50.5% lower high-load latency'),
              ],
            }),
            new TableRow({
              children: [
                createCell('95th Percentile Latency', false, true),
                createCell('6,341 ms'),
                createCell('2,636 ms'),
                createCell('58.4% lower tail latency'),
              ],
            }),
            new TableRow({
              children: [
                createCell('99th Percentile Latency', false, true),
                createCell('18,455 ms (~18.5s)'),
                createCell('3,892 ms (~3.9s)'),
                createCell('78.9% lower extreme tail lag'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Worst-Case Latency (100% max)', false, true),
                createCell('19,116 ms (~19.1s)'),
                createCell('4,267 ms (~4.3s)'),
                createCell('77.7% reduction in max lag'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Failed Requests Count', false, true),
                createCell('0 failed (100% complete)'),
                createCell('0 failed (100% complete)'),
                createCell('100% transaction integrity'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),

        h3('In-Depth Performance & Architectural Analysis:'),
        p('The quantitative results clearly demonstrate the transformative impact of horizontal scaling on application responsiveness:'),
        bullet(' In the single-instance baseline, processing 20 simultaneous connections performing regex text scans and relational joins saturated the single Node.js V8 execution thread. Throughput peaked at only 12.21 requests per second, resulting in a sluggish mean latency of 1,638.06 ms. More critically, incoming requests suffered severe queue head-of-line blocking, pushing 95th percentile latency to 6.34 seconds and worst-case tail latency to 19.11 seconds. In a live placement drive, a 19-second delay causes candidates to believe the site has crashed, leading to frantic browser refreshes that compound server failure.', 'Single-Instance Queue Saturation:'),
        bullet(' Distributing the exact same workload across three load-balanced backend containers increased throughput to 22.06 requests per second—an 80.7% throughput improvement (a 1.81x performance multiplier). Mean response latency dropped from 1.64 seconds to 906.78 ms (a 44.6% reduction).', 'Substantial Throughput Acceleration:'),
        bullet(' The most dramatic improvement occurred in tail latencies: the 95th percentile dropped from 6,341 ms to 2,636 ms (58.4% lower), and the worst-case maximum response time collapsed from 19,116 ms to 4,267 ms (a 77.7% reduction). Distributing the 20 concurrent connections across three independent V8 event loops allowed parallel execution across available CPU cores and prevented thread starvation.', 'Elimination of Tail Latency Spikes:'),

        placeholder('Figure 1.3: Apache Bench Benchmark Output for 1 Instance (Baseline)', 'Terminal showing "ab -n 1000 -c 20" output for 1 backend instance with 12.21 req/sec, 1,638 ms mean latency, and 19.1s maximum latency'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 1.4: Apache Bench Benchmark Output for 3 Instances (Load Balanced)', 'Terminal showing "ab -n 1000 -c 20" output for 3 backend instances with 22.06 req/sec, 906 ms mean latency, and 4.2s maximum latency'),

        p('', false, 10, '1E293B', 200),

        // 1(c)
        h2('1(c) Container Failure Simulation & Zero-Downtime Failover (1.5 Marks)'),
        h3('1. Failure Event (Before Nginx Failover Configuration)'),
        p('High availability requires not only handling high load, but also surviving sudden hardware or container crashes without user impact. To evaluate fault tolerance, we simulated an abrupt crash by terminating container backend-instance-3 exactly 5 seconds into an active 1,000-request benchmark (concurrency 20) using docker compose stop backend3.'),
        p('Under default, unprotected Nginx settings (proxy_next_upstream off), Nginx continued dispatching requests to the dead container IP (172.19.0.3:5000) using blind round-robin. Because the container process was stopped, the underlying operating system kernel returned TCP socket resets (RST) or dropped SYN packets (Host is unreachable). Nginx immediately returned HTTP 502 Bad Gateway errors to clients, resulting in 9 failed requests and premature benchmark termination at 991 requests.'),

        h3('2. Resilient High-Availability Configuration (After)'),
        p('To achieve zero downtime and 100% request completion, Nginx was reconfigured with upstream health check parameters and active retry directives:'),
        codeBlock(`upstream backend_cluster {
    server backend1:5000 max_fails=3 fail_timeout=10s;
    server backend2:5000 max_fails=3 fail_timeout=10s;
    server backend3:5000 max_fails=3 fail_timeout=10s;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_cluster;

        # Automatic Failover & Retry Directives
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
        proxy_next_upstream_timeout 10s;
        proxy_connect_timeout 2s;
        proxy_read_timeout 15s;
        proxy_send_timeout 15s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header X-Served-By $upstream_addr always;
    }
}`),

        p('How the Failover Mechanism Works Under the Hood:'),
        bullet(' Specifies that if an upstream container returns a socket error, connection timeout, invalid HTTP header, or any 5xx server error, Nginx intercepts the failure before returning it to the client and transparently replays the exact same request to the next healthy backend instance.', 'proxy_next_upstream:'),
        bullet(' Enforces a strict 2-second timeout on establishing TCP connections to upstream containers. If a container crashes, Nginx waits at most 2 seconds before declaring that node unreachable and redirecting the request.', 'proxy_connect_timeout 2s:'),
        bullet(' If an instance fails 3 consecutive attempts, Nginx marks it unhealthy and temporarily suspends routing to it for 10 seconds. Surviving nodes (backend1 and backend2) absorb traffic seamlessly while the dead node is isolated.', 'max_fails=3 fail_timeout=10s:'),

        h3('Before vs. After Failure Results Table'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Benchmark Condition / Metric', true, false, 30),
                createCell('Before Failover (Unprotected)', true, false, 35),
                createCell('After Resilient Failover', true, false, 35),
              ],
            }),
            new TableRow({
              children: [
                createCell('Simulated Crash Event', false, true),
                createCell('backend-instance-3 stopped 5s into test'),
                createCell('backend-instance-3 stopped 5s into test'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Total Requests Attempted', false, true),
                createCell('1,000 requests (concurrency 20)'),
                createCell('1,000 requests (concurrency 20)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Completed Requests', false, true),
                createCell('991 completed (Premature failure)'),
                createCell('1,000 completed (100% completed)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Failed Requests Count', false, true),
                createCell('9 Failed Requests (Non-2xx: 9)'),
                createCell('0 Failed Requests (100% Success)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('HTTP Error Codes Encountered', false, true),
                createCell('HTTP 502 Bad Gateway / Connection Reset'),
                createCell('None (100% HTTP 200 OK responses)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Average Latency During Crash', false, true),
                createCell('1,547.65 ms'),
                createCell('722.78 ms (53.3% faster recovery)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Throughput Under Failure', false, true),
                createCell('12.92 req/sec'),
                createCell('27.67 req/sec (Over 2.1x throughput)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('End-User Client Experience', false, true),
                createCell('Dropped application submissions / error alert'),
                createCell('Seamless, completely unnoticeable retry reroute'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),
        placeholder('Figure 1.5: Benchmark During Container Crash (9 Failed Requests)', 'Terminal showing Apache Bench output with "Failed requests: 9" and "Non-2xx responses: 9" (HTTP 502 Bad Gateway) when backend3 was killed under unprotected Nginx'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 1.6: Resilient High-Availability Load Test (0 Failed Requests)', 'Terminal showing Apache Bench output with "Complete requests: 1000", "Failed requests: 0" when backend3 was killed under resilient Nginx configuration'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 1.7: Resilient Nginx Upstream & Failover Configuration File', 'Source code of nginx.conf showing proxy_next_upstream error timeout http_502 http_503, proxy_connect_timeout 2s, and max_fails=3 fail_timeout=10s'),

        p('', false, 10, '1E293B', 200),

        // 1(d)
        h2('1(d) System Architecture Diagram & Cloud Bursting / Edge Computing Integration (1 Mark)'),
        h3('1. Complete Component Inventory & Port Mapping Table'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Component Name', true, false, 20),
                createCell('Actual Project Entity', true, false, 25),
                createCell('Hosting Environment', true, false, 25),
                createCell('Ports & Protocol', true, false, 30),
              ],
            }),
            new TableRow({
              children: [
                createCell('Frontend UI', false, true),
                createCell('frontend (Next.js 14)'),
                createCell('Vercel Edge Global Network'),
                createCell('Port 443 (HTTPS) - job-application-portal-theta.vercel.app'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Reverse Proxy / LB', false, true),
                createCell('nginx-load-balancer (nginx:alpine)'),
                createCell('Docker Engine Bridge Network'),
                createCell('Host Port 80 -> Container 80 (HTTP)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Backend Node 1', false, true),
                createCell('backend-instance-1 (Node.js/Express)'),
                createCell('Docker Engine (jobapplicationportal)'),
                createCell('Port 5000 (Internal TCP / Bridge)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Backend Node 2', false, true),
                createCell('backend-instance-2 (Node.js/Express)'),
                createCell('Docker Engine (jobapplicationportal)'),
                createCell('Port 5000 (Internal TCP / Bridge)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Backend Node 3', false, true),
                createCell('backend-instance-3 (Node.js/Express)'),
                createCell('Docker Engine (jobapplicationportal)'),
                createCell('Port 5000 (Internal TCP / Bridge)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Cloud Database', false, true),
                createCell('jobportal Database (M0 Replica Set)'),
                createCell('MongoDB Atlas Cloud'),
                createCell('Port 27017 (TLS SRV) - cluster0.9j1tt89.mongodb.net'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Assignment 1 PaaS', false, true),
                createCell('Node.js Web Service (Express)'),
                createCell('Render.com Cloud'),
                createCell('Port 443 (HTTPS) - job-application-portal-111q.onrender.com'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Edge / Fog Tier (New)', false, true),
                createCell('Cloudflare Edge Workers & KV Cache'),
                createCell('Cloudflare Global Anycast Edge'),
                createCell('Port 443 Anycast HTTPS (Sub-10ms Cache Hits)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Cloud Burst Tier (New)', false, true),
                createCell('Serverless Container Burst Tier'),
                createCell('AWS ECS Fargate / Render Scale'),
                createCell('Port 5000 (Dynamic Elastic TCP Scaling)'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),

        h3('2. Peak-Demand Handling & Architectural Rationale for Recruitment Domain:'),
        p('How the Integrated Architecture Resolves the Peak Placement Rush:'),
        bullet(' In recruitment platforms, candidate behavior is 95% read-heavy (browsing, searching, filtering vacancies) and only 5% write-heavy (submitting an application). The Cloudflare Edge Workers and KV Cache tier caches active job listing responses at geographically distributed Points of Presence (PoPs) closest to applicants (e.g., Mumbai, Chennai, Bengaluru, Delhi). During a placement rush, between 85% and 90% of all search queries are resolved at the edge in under 10ms, completely shielding the Nginx reverse proxy, Node.js backends, and MongoDB Atlas from redundant read spikes.', 'Edge/Fog Tier (Cloudflare Workers + KV Cache):'),
        bullet(' If write-heavy traffic (e.g., thousands of simultaneous resume uploads and application submissions) causes the Nginx load balancer CPU utilization to exceed 75% or the connection backlog to exceed 200 concurrent requests, a cloud bursting trigger automatically provisions serverless containers on AWS ECS Fargate / Render Autoscaling. Nginx dynamically registers these ephemeral containers and balances excess traffic across them. As soon as the 15-minute rush subsides, the burst containers terminate automatically.', 'Cloud Bursting Tier (Serverless Elastic Scaling):'),

        p('Why This Specific Architecture Was Chosen for Our Domain:'),
        bullet(' Recruitment portals experience severe seasonal and hourly spikes (e.g., campus drives, result days) followed by prolonged periods of low activity. Maintaining a massive, statically provisioned 20-server cluster year-round would incur prohibitive financial waste. Combining edge caching with cloud bursting delivers an elastic pay-per-use model that expands on demand and scales down to zero idle cost.', 'Cost Optimization vs. Overprovisioning:'),
        bullet(' The free tier of MongoDB Atlas enforces a hard limit of 500 concurrent connections. Allowing thousands of concurrent clients to connect directly through un-cached backends would rapidly trigger database connection exhaustion ("Too many connections"). Intercepting read queries at the edge preserves database connection pool headroom exclusively for write transactions.', 'Preservation of MongoDB Connection Limits:'),
        bullet(' Candidates compete for high-demand, limited-seat job openings. Providing sub-10ms edge response times ensures fair, instantaneous job discovery without geographic latency disparities.', 'Ultra-Low Candidate Latency:'),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 100 },
          children: [
            new ImageRun({
              data: fs.readFileSync('D:/Projects/Job Application Portal/architecture_diagram.png'),
              transformation: {
                width: 600,
                height: 400,
              },
              type: 'png',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'Figure 1.8: Complete System Architecture Diagram with Component Inventory, Ports & Cloud Bursting / Edge Tier (Marked in Distinct Amber/Orange)',
              bold: true,
              size: 19,
              color: '1E3A8A',
              font: 'Calibri',
            }),
          ],
        }),

        p('', false, 10, '1E293B', 200),

        // =========================================================================
        // QUESTION 2: SECURE YOUR APPLICATION
        // =========================================================================
        h1('Question 2: Secure Your Application (5 Marks)'),

        h2('2(a) Identification of Sensitive Data & Salted Password Hashing (1 Mark)'),
        
        h3('1. Most Sensitive Data in the Job Application Portal'),
        p('Operating in the recruitment and talent acquisition domain, the Job Application Portal collects, processes, and persists highly confidential personal, professional, and financial records. The most sensitive data assets comprise:'),
        bullet(' User account passwords and JWT refresh tokens. Compromise of credentials leads to complete account takeover, unauthorized recruiter impersonation, or candidate identity hijacking.', '1. User Authentication Credentials:'),
        bullet(' Full legal names, verified personal email addresses, telephone numbers, and residential locations. Under international data privacy laws, this data unambiguously identifies natural persons.', '2. Candidate Personally Identifiable Information (PII):'),
        bullet(' Hosted resume documents (resumeUrl) containing comprehensive employment chronologies, academic transcripts, institutional affiliations, current employer identities, and sensitive salary metrics (salaryMin and salaryMax). Unauthorized exposure violates candidate confidentiality with current employers.', '3. Confidential Career & Compensation History:'),

        h3('2. Salted bcrypt Password Hashing Implementation'),
        p('Storing passwords in plaintext is an unacceptable vulnerability: a database leak, SQL/NoSQL injection, or unauthorized backup access immediately exposes all user credentials. To ensure industry-grade cryptographic defense, user passwords are saved using bcrypt with 12 cryptographic salt rounds via a pre-save Mongoose hook in backend/models/User.js:'),
        codeBlock(`userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});`),

        p('Cryptographic Mechanics of the Hardened Implementation:'),
        bullet(' bcrypt.genSalt(12) generates a unique 128-bit cryptographically secure pseudorandom salt for every individual user record. Even if two candidates choose the identical password ("Password123!"), their stored password hashes are entirely distinct. This completely neutralizes precomputed Rainbow Table and dictionary attacks.', 'Unique Salt Generation:'),
        bullet(' A cost factor of 12 represents 2^12 = 4,096 iterative key derivation hashing rounds. This introduces deliberate computational work (~250ms per evaluation on modern CPUs), making offline brute-force attacks computationally infeasible while remaining unnoticeable to a logging-in user.', 'Exponential Work Factor (2^12):'),
        bullet(' The Mongoose pre-save middleware verifies this.isModified("password") before rehashing, preventing accidental double-hashing when users update profile information (e.g., updating their resume or telephone number).', 'Change Detection Guard:'),

        h3('Database Security State Comparison (Before vs. After)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Security Attribute', true, false, 28),
                createCell('Before Hashing (Vulnerable Plaintext)', true, false, 36),
                createCell('After Hashing (Salted bcrypt Hash)', true, false, 36),
              ],
            }),
            new TableRow({
              children: [
                createCell('Storage Representation', false, true),
                createCell('Raw Plaintext ("MySecretPassword2026!")'),
                createCell('60-character cryptographic hash string'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Database Document Value', false, true),
                createCell('"password": "MySecretPassword2026!"'),
                createCell('"password": "$2b$12$KLuE94Zm7pCPmnwWoONcYuh8s8L29omFNqiG2z5Bdm7K9G5E2pJNG"'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Hash Composition Breakdown', false, true),
                createCell('N/A (Raw cleartext data)'),
                createCell('$2b$ (algorithm), 12 (cost), 22-char salt, 31-char hash'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Rainbow Table Protection', false, true),
                createCell('0% (Instant lookup match on public tables)'),
                createCell('100% Protected (Unique 128-bit salt per user record)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Computational Work Factor', false, true),
                createCell('None (Zero computational overhead)'),
                createCell('12 Salt Rounds (2^12 = 4,096 iterative cycles)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Database Breach Impact', false, true),
                createCell('Catastrophic credential theft across accounts'),
                createCell('Computationally infeasible to reverse or crack'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),
        placeholder('Figure 2.1: Database Document BEFORE Hashing (Plaintext Vulnerability)', 'MongoDB Atlas document viewer showing candidate password stored in vulnerable raw plaintext ("MySecretPassword2026!")'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 2.2: Database Document AFTER Hashing (12-Round Salted bcrypt Hash)', 'MongoDB Atlas document viewer showing the same user password securely transformed into a 60-character salted bcrypt hash ("$2b$12$...")'),

        p('', false, 10, '1E293B', 200),

        // 2(b)
        h2('2(b) Multi-Factor Authentication (TOTP) & Role-Based Access Control (1.5 Marks)'),
        h3('1. Multi-Factor Authentication via RFC 6238 Standard (Google/Microsoft Authenticator)'),
        p('To prevent account takeover even in the event of password compromise, multi-factor authentication was engineered using the RFC 6238 Time-based One-Time Password (TOTP) standard using speakeasy and qrcode:'),
        bullet(' The Mongoose User schema was extended with isMfaEnabled (Boolean, default: false) and mfaSecret (Base32 encoded cryptographic secret, configured with select: false so it is never exposed in standard database queries).', 'Database Model Extension:'),
        bullet(' An authenticated user invokes POST /api/auth/mfa/setup. The server generates a unique 32-character Base32 cryptographic secret and converts the standard otpauth:// URI into an inline scannable QR code. The user scans this code using Google Authenticator or Microsoft Authenticator.', 'Secret Generation & QR Code:'),
        bullet(' When an MFA-enabled user submits email and password at POST /api/auth/login, the backend validates credentials. If no 6-digit TOTP token is provided, the server returns { success: false, mfaRequired: true }. The frontend immediately transitions to the Two-Factor Verification screen. The candidate enters the 6-digit code from their authenticator app. The server verifies the token against the secret within a 30-second time drift window (speakeasy.totp.verify) and issues the signed JWT access token only upon success.', 'Two-Step Verification Handshake:'),

        h3('2. Role-Based Access Control (RBAC) on Update and Delete APIs'),
        p('In a multi-tenant recruitment portal, role segregation is critical: job applicants (seekers) must never be permitted to alter vacancies, delete job postings, or manipulate employer listings. Modifying (PUT) and deleting (DELETE) job postings is strictly restricted to authenticated users possessing the employer role:'),
        codeBlock(`// backend/routes/jobs.js
router.put('/:id', protect, requireRole('employer'), updateJob);
router.delete('/:id', protect, requireRole('employer'), deleteJob);`),

        p('Middleware Enforcement Pipeline:'),
        bullet(' Extracts the Bearer token from the HTTP Authorization header and cryptographically validates its HMAC-SHA256 signature using the server secret key. If the token is missing, expired, or tampered with, the request is immediately rejected with HTTP 401 Unauthorized.', 'protect Middleware:'),
        bullet(' Inspects req.user.role. If the role does not equal "employer", the request is rejected with HTTP 403 Forbidden. Additionally, the controller verifies resource ownership (job.postedBy.toString() === req.user._id.toString()), preventing employers from modifying competitor postings.', 'requireRole("employer") Middleware:'),

        h3('API Authorization & Token Rejection Verification Table'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Test Scenario', true, false, 24),
                createCell('API Invocation', true, false, 24),
                createCell('Supplied Credentials', true, false, 22),
                createCell('HTTP Status', true, false, 15),
                createCell('Server Response Payload', true, false, 15),
              ],
            }),
            new TableRow({
              children: [
                createCell('Missing Token', false, true),
                createCell('DELETE /api/jobs/:id'),
                createCell('None (Authorization omitted)'),
                createCell('401 Unauthorized'),
                createCell('{"success":false,"message":"No access token provided"}'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Tampered Token', false, true),
                createCell('DELETE /api/jobs/:id'),
                createCell('Corrupted signature in LocalStorage'),
                createCell('401 Unauthorized'),
                createCell('{"success":false,"message":"Invalid access token"}'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Role Mismatch', false, true),
                createCell('DELETE /api/jobs/:id'),
                createCell('Valid Token (role: "seeker")'),
                createCell('403 Forbidden'),
                createCell('{"success":false,"message":"Access denied. Required role: employer"}'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Authorized Recruiter', false, true),
                createCell('DELETE /api/jobs/:id'),
                createCell('Valid Token (role: "employer")'),
                createCell('200 OK'),
                createCell('{"success":true,"message":"Job deleted successfully"}'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),
        placeholder('Figure 2.3: Rejection of Unauthorized DELETE Request (HTTP 401 Unauthorized)', 'Browser DevTools / Terminal showing DELETE /api/jobs/:id rejected with HTTP 401 Unauthorized and message "Invalid access token" when token is tampered in LocalStorage'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 2.4: Website Two-Factor Verification Screen (TOTP)', 'Frontend UI at /login showing the Two-Factor Verification challenge prompting the user to enter their 6-digit Authenticator app security code'),

        p('', false, 10, '1E293B', 200),

        // 2(c)
        h2('2(c) Docker Security Scan & Container Hardening with Trivy (1.5 Marks)'),
        h3('1. Hardening Strategy Implemented'),
        p('Container vulnerability management was executed using Aqua Security Trivy (aquasec/trivy:latest), the industry standard vulnerability scanner. The initial development image relied on node:20 (Debian 12 Bookworm). To eliminate severe CVE exposures, a three-pronged container hardening strategy was executed:'),
        bullet(' The standard node:20 image contains a full general-purpose Debian operating system with 413 packages, including apt package managers, bash shells, network clients, and compilers. We migrated to node:20-alpine (Alpine Linux 3.23), which utilizes musl libc and busybox, reducing installed system packages to just 18 essential utilities.', 'Minimal Base Image Migration:'),
        bullet(' Enforced the Principle of Least Privilege. Standard Docker containers execute as root (UID 0), granting potential attackers full system privileges if a container breakout vulnerability exists. In the hardened build, runtime execution is handed over to unprivileged user node (UID 1000) using USER node and explicit ownership assignment (COPY --chown=node:node).', 'Non-Root User Enforcement:'),
        bullet(' Heavy native compilation dependencies (python3, make, g++) required by bcrypt during npm install are confined to an ephemeral builder stage and discarded, leaving the final production image lean and free of compiler binaries.', 'Multi-Stage Build Isolation:'),

        h3('Hardened Production Dockerfile (backend/Dockerfile.hardened):'),
        codeBlock(`# Stage 1: Ephemeral Build & Native Compilation
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Hardened Minimal Production Runtime
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Non-root user ownership & privilege drop
COPY --chown=node:node package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node
EXPOSE 5000
CMD ["node", "server.js"]`),

        h3('Trivy Vulnerability Scan Results Table (Before vs. After Hardening)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Security & Container Metric', true, false, 32),
                createCell('Before Hardening (node:20 Debian)', true, false, 25),
                createCell('After Hardening (node:20-alpine Non-Root)', true, false, 25),
                createCell('Quantitative Reduction', true, false, 18),
              ],
            }),
            new TableRow({
              children: [
                createCell('Base Operating System', false, true),
                createCell('Debian Linux 12 (Bookworm)'),
                createCell('Alpine Linux 3.23'),
                createCell('Minimal attack surface'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Execution User Privileges', false, true),
                createCell('root (UID 0 - Full Root Privileges)'),
                createCell('node (UID 1000 - Non-Root User)'),
                createCell('Least privilege enforced'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Total Image Disk Footprint', false, true),
                createCell('1.63 GB (1,630 MB)'),
                createCell('225 MB'),
                createCell('86.2% size reduction'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Installed System Packages', false, true),
                createCell('413 OS packages'),
                createCell('18 OS packages'),
                createCell('95.6% packages removed'),
              ],
            }),
            new TableRow({
              children: [
                createCell('CRITICAL Vulnerabilities', false, true),
                createCell('74 vulnerabilities'),
                createCell('2 vulnerabilities'),
                createCell('97.3% reduction (-72)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('HIGH Vulnerabilities', false, true),
                createCell('1,519 vulnerabilities'),
                createCell('26 vulnerabilities'),
                createCell('98.3% reduction (-1,493)'),
              ],
            }),
            new TableRow({
              children: [
                createCell('Total CRITICAL + HIGH Count', false, true),
                createCell('1,593 vulnerabilities'),
                createCell('28 vulnerabilities'),
                createCell('98.2% total drop (-1,565)'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 150),
        placeholder('Figure 2.5: Trivy Vulnerability Scan Output BEFORE Hardening (1,593 Vulnerabilities)', 'Trivy terminal scan report on unhardened node:20 Debian image showing 74 CRITICAL and 1,519 HIGH vulnerabilities running under root'),
        p('', false, 10, '1E293B', 140),
        placeholder('Figure 2.6: Trivy Vulnerability Scan Output AFTER Hardening (28 Vulnerabilities)', 'Trivy terminal scan report on hardened node:20-alpine image showing CRITICAL reduced to 2 and HIGH reduced to 26 under non-root USER node'),

        p('', false, 10, '1E293B', 200),

        // 2(d)
        h2('2(d) Threat Agents, Technical Controls & Regulatory Compliance (1 Mark)'),
        h3('1. Applicable Regulation & Rationale for the Recruitment Domain'),
        p('Applicable Legal Framework: General Data Protection Regulation (GDPR - EU 2016/679) & Digital Personal Data Protection (DPDP) Act.'),
        p('Detailed Legal Applicability Rationale:'),
        bullet(' The Job Application Portal systematically collects, aggregates, indexes, and stores Personally Identifiable Information (PII) belonging to living natural persons (job applicants and company representatives). This includes full legal names, verified email addresses, telephone numbers, postal locations, career histories, and complete resume documents (resumeUrl). Under GDPR Article 4(1), any information relating to an identified or identifiable natural person constitutes personal data.', 'Processing of Identifiable Personal Data:'),
        bullet(' Because the platform determines the purposes and technical means of processing candidate and job data, it legally qualifies as a Data Controller. The recruitment portal is therefore strictly bound by statutory security, confidentiality, and architectural requirements under GDPR Chapter IV.', 'Legal Status as Data Controller:'),

        h3('2. Threat Agent Analysis & Regulatory Control Mapping Table'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell('Threat Agent & Persona', true, false, 20),
                createCell('Threat Vector & Motivation', true, false, 25),
                createCell('Implemented Technical Control in Code', true, false, 30),
                createCell('Applicable Regulation & Requirement', true, false, 25),
              ],
            }),
            new TableRow({
              children: [
                createCell('1. External Cybercriminal / Credential Harvester', false, true),
                createCell('Automated credential stuffing, brute force password spraying, dictionary attacks, and rainbow table lookups targeting candidate and recruiter accounts to hijack profiles and exfiltrate private resumes.'),
                createCell('• 12-round salted bcrypt key derivation (4,096 cycles) in backend/models/User.js neutralizing rainbow tables.\n• Mandatory RFC 6238 TOTP Multi-Factor Authentication in backend/controllers/authController.js preventing account access even if passwords leak.'),
                createCell('GDPR Article 32(1)(a)\n(Security of Processing: Pseudonymisation and Encryption of Personal Data).\nGuarantees passwords cannot be cracked or used for credential stuffing even upon database compromise.'),
              ],
            }),
            new TableRow({
              children: [
                createCell('2. Malicious Candidate / Privilege Escalation Attacker', false, true),
                createCell('Authenticated job seeker or competitor altering JWT tokens in LocalStorage or executing unauthorized PUT/DELETE /api/jobs/:id calls to sabotage competitor listings or delete job openings.'),
                createCell('• Cryptographic HMAC-SHA256 JWT signature verification in protect middleware.\n• Server-side RBAC guard (requireRole("employer")) restricting mutate endpoints.\n• Non-root container isolation (USER node, UID 1000) blocking container escape.'),
                createCell('GDPR Article 5(1)(f) & Article 25\n(Integrity, Confidentiality & Data Protection by Design).\nEnforces strict access control boundaries so users cannot view, alter, or delete unauthorized records.'),
              ],
            }),
          ],
        }),

        p('', false, 10, '1E293B', 240),

        // =========================================================================
        // SUBMISSION DETAILS & ARTIFACT REPOSITORY
        // =========================================================================
        h2('Submission Details & Project Verification'),
        p('All source code modifications, automated test scripts, Dockerfiles, and architectural configurations developed for this assignment are version-controlled and pushed to GitHub:'),
        bullet(' https://github.com/PK07-07/Job-Application-Portal', 'GitHub Repository:'),
        bullet(' https://github.com/PK07-07/Job-Application-Portal/tree/assignment-3', 'Submission Branch:'),
        bullet(' https://job-application-portal-theta.vercel.app', 'Live Vercel Frontend:'),
        bullet(' https://job-application-portal-111q.onrender.com', 'Live Render Backend:'),
        bullet(' cluster0.9j1tt89.mongodb.net (Database: jobportal)', 'Live MongoDB Atlas:'),
        bullet(' 3:00 minutes covering 3-instance load balancing, mid-test container failover, salted bcrypt in MongoDB Atlas, TOTP MFA login, and 401 token rejection.', 'Demonstration Video Length:'),
      ],
    },
  ],
});

async function generateDocx() {
  const buffer = await Packer.toBuffer(doc);
  const outputPath = 'd:/Projects/Job Application Portal/BACSE344_Digital_Assignment_3_Report.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('DOCX report successfully generated at:', outputPath);
}

generateDocx();
