import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import connectDB from './config/db.js';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

// 15 Premium English Tech Job Profiles with localized INR ranges
const premiumJobPool = [
  {
    title: "Frontend Engineer (React / Next.js)",
    department: "Engineering",
    salaryMin: 800000,
    salaryMax: 1400000,
    description: "We are seeking a Frontend Engineer proficient in React and Next.js to scale our core SaaS dashboard. You will build responsive, pixel-perfect UIs with Tailwind CSS, optimize client-side rendering performance, and integrate secure RESTful APIs seamlessly.",
    requirements: "3+ years experience with React, Next.js, Tailwind CSS, and state management tools like Redux or Zustand."
  },
  {
    title: "Backend Developer (Node.js / MongoDB)",
    department: "Engineering",
    salaryMin: 900000,
    salaryMax: 1600000,
    description: "Looking for a Backend Developer specializing in Node.js, Express, and MongoDB. Responsibilities include architectural design of secure APIs, writing complex aggregation pipelines, optimizing database performance, and managing JWT/OAuth authentication systems.",
    requirements: "Strong proficiency in JavaScript (ES6+), Node.js, Express, MongoDB/Mongoose, and architectural knowledge of REST and WebSockets."
  },
  {
    title: "Full Stack Developer",
    department: "Product Engineering",
    salaryMin: 1000000,
    salaryMax: 1800000,
    description: "Join us as a Full Stack Developer to bridge the gap between frontend experiences and robust backend logic. You will manage deployment pipelines, implement complex interactive user features, and write optimized schemas for high-traffic operations.",
    requirements: "Experience across the MERN stack (MongoDB, Express, React, Node), automated testing frameworks, and cloud hosting environments."
  },
  {
    title: "UI/UX Product Designer",
    department: "Design",
    salaryMin: 600000,
    salaryMax: 1100000,
    description: "We are looking for a Product Designer to take ownership of our digital platforms. You will create high-fidelity user flows, interactive wireframes, and prototypes in Figma, ensuring our complex technical tools feel simple, elegant, and intuitive.",
    requirements: "Portfolio showing end-to-end product design lifecycle, strong typography skills, design system creation, and Figma mastery."
  },
  {
    title: "DevOps & Cloud Engineer",
    department: "Infrastructure",
    salaryMin: 1200000,
    salaryMax: 2200000,
    description: "Seeking a DevOps Engineer to oversee our cloud container systems and automated pipelines. You will maintain AWS infrastructure, build robust CI/CD integration workflows, monitor system health, and secure server environments against vulnerabilities.",
    requirements: "Hands-on experience with AWS, Docker, Kubernetes, GitHub Actions, Linux administration, and Infrastructure as Code (Terraform)."
  },
  {
    title: "Data Analyst & Business Intelligence",
    department: "Data Science",
    salaryMin: 550000,
    salaryMax: 950000,
    description: "We are hiring a Data Analyst to transform raw platform metrics into actionable business strategies. You will design automated performance dashboards, write complex SQL queries to clean datasets, and run predictive regression models on user acquisition data.",
    requirements: "Proficiency in advanced SQL, Python (Pandas/NumPy), Tableau, PowerBI, and a strong foundational grasp of statistical analysis."
  },
  {
    title: "Mobile App Developer (React Native)",
    department: "Engineering",
    salaryMin: 850000,
    salaryMax: 1500000,
    description: "Looking for a Mobile App Developer to maintain and extend our cross-platform iOS and Android applications. You will translate wireframes into fluid mobile UI components, optimize offline synchronization capabilities, and manage App Store deployments.",
    requirements: "Proven track record with React Native, TypeScript, mobile hardware API integration, and app publishing processes."
  },
  {
    title: "QA Automation Engineer",
    department: "Quality Assurance",
    salaryMin: 500000,
    salaryMax: 900000,
    description: "We need a QA Automation Engineer to ensure software reliability across our web portals. You will build, maintain, and execute automated end-to-end testing scripts, isolate application performance bugs, and collaborate with developers on fix verification.",
    requirements: "Experience writing automated test suites using Cypress, Selenium, or Playwright, paired with strong debugging skills."
  },
  {
    title: "Cybersecurity Analyst",
    department: "Security",
    salaryMin: 1000000,
    salaryMax: 1800000,
    description: "Seeking a Cybersecurity Analyst to protect our infrastructure from modern threat profiles. You will conduct penetration testing, audit database encryption protocols, implement strict API access controls, and respond to security telemetry alerts.",
    requirements: "CompTIA Security+, CEH, or equivalent certification, deep understanding of network protocols, OWASP Top 10 vulnerabilities, and Linux security systems."
  },
  {
    title: "Technical Product Manager",
    department: "Product Management",
    salaryMin: 1400000,
    salaryMax: 2500000,
    description: "We are looking for a Technical Product Manager to lead our engineering roadmap. You will translate customer feedback into detailed developer user stories, manage the product backlog, track sprint velocity, and align feature launches with business goals.",
    requirements: "3+ years in a technical leadership role, exceptional documentation skills, experience with Agile/Scrum, and basic coding literacy."
  },
  {
    title: "Embedded Systems Engineer (IoT)",
    department: "Hardware Engineering",
    salaryMin: 700000,
    salaryMax: 1300000,
    description: "Join our hardware team to develop next-generation smart-grid devices. You will write firmware for microcontrollers, interface with environmental sensors and relays, optimize low-power operational cycles, and build robust communication links over Wi-Fi/Bluetooth.",
    requirements: "Strong background in C/C++ programming, hands-on experience with microcontrollers (ESP32/Arduino/STM32), protocol architectures (SPI, I2C, UART), and debugging using hardware scopes."
  },
  {
    title: "Machine Learning Engineer",
    department: "AI Research",
    salaryMin: 1500000,
    salaryMax: 2800000,
    description: "We are seeking an ML Engineer to design predictive routing models for our matching engine. You will train deep learning neural networks, deploy data pipelines for model inference at scale, and continually run validation metrics to improve accuracy algorithms.",
    requirements: "Deep proficiency in Python, PyTorch or TensorFlow, experience deploying models via Docker/AWS, and strong mathematical training in linear algebra and probability."
  },
  {
    title: "Technical Writer",
    department: "Documentation",
    salaryMin: 450000,
    salaryMax: 800000,
    description: "Looking for a Technical Writer to create accessible documentation for our developer API ecosystem. You will maintain markdown guides, write clear code usage snippets, and document complex system architectures for external integration teams.",
    requirements: "Strong written English skills, familiarity with Git/Markdown systems, and the ability to understand and read basic code snippets in JavaScript and Python."
  },
  {
    title: "Scrum Master & Agile Coach",
    department: "Operations",
    salaryMin: 900000,
    salaryMax: 1500000,
    description: "We need an experienced Scrum Master to facilitate development sprints. You will unblock engineering hurdles, run standups and retrospectives, shield the team from operational scope creep, and coach team members on Agile best practices.",
    requirements: "Certified Scrum Master (CSM) credential, excellent empathetic communication skills, and masterful proficiency with Jira configuration."
  },
  {
    title: "Solutions Architect",
    department: "Enterprise Solutions",
    salaryMin: 1800000,
    salaryMax: 3200000,
    description: "Seeking a Solutions Architect to design scalable, enterprise-grade cloud integrations for our B2B tier. You will lead technical discovery calls with corporate clients, design system integration blueprints, and map high-performance data workflows.",
    requirements: "AWS Certified Solutions Architect or equivalent cloud credential, strong client-facing communication skills, and expertise in distributed systems architecture."
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log(' Starting database seed...');

    // 1. Wipe existing data to start fresh
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    console.log(' Cleared existing data');

    // 2. Create Employers
    const employers = [];
    for (let i = 0; i < 5; i++) {
      const employer = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Password123!', // Plaintext password to safely log in with
        role: 'employer',
        companyName: faker.company.name(),
        companyWebsite: faker.internet.url(),
        companySize: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
      });
      employers.push(employer);
    }
    console.log(` Created ${employers.length} Employers`);

    // 3. Create Seekers
    const seekers = [];
    for (let i = 0; i < 15; i++) {
      const seeker = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Password123!',
        role: 'seeker',
        bio: faker.person.bio().substring(0, 500),
        skills: faker.helpers.arrayElements(['React', 'Node.js', 'Python', 'Java', 'C++', 'AWS', 'Docker', 'MongoDB'], 3),
        resume: faker.internet.url(),
      });
      seekers.push(seeker);
    }
    console.log(` Created ${seekers.length} Seekers`);

    // 4. Create Jobs (Using premium English profiles and Indian Tech hub cities)
    const jobs = [];
    const indianCities = ['Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad', 'Pune', 'Chennai', 'Noida'];

    for (let i = 0; i < 20; i++) {
      // Pick a profile sequentially, or fallback to random if index > pool size
      const profileTemplate = premiumJobPool[i % premiumJobPool.length];

      const job = await Job.create({
        title: profileTemplate.title,
        description: `${profileTemplate.description}\n\nKey Requirements:\n${profileTemplate.requirements}`,
        location: faker.helpers.arrayElement(indianCities),
        locationType: faker.helpers.arrayElement(['remote', 'onsite', 'hybrid']),
        jobType: faker.helpers.arrayElement(['full-time', 'part-time', 'contract']),
        experienceLevel: faker.helpers.arrayElement(['entry', 'mid', 'senior']),
        salaryMin: profileTemplate.salaryMin,
        salaryMax: profileTemplate.salaryMax,
        postedBy: faker.helpers.arrayElement(employers)._id,
      });
      jobs.push(job);
    }
    console.log(` Created ${jobs.length} Jobs`);

    // 5. Create Applications (Random Seekers applying to Random Jobs)
    let appCount = 0;
    for (const job of jobs) {
      const applicantsForJob = faker.helpers.arrayElements(seekers, faker.number.int({ min: 2, max: 5 }));
      
      for (const applicant of applicantsForJob) {
        await Application.create({
          job: job._id,
          applicant: applicant._id,
          coverLetter: `Dear Hiring Team,\n\nI am incredibly excited to apply for the ${job.title} position. Given my hands-on background in web architecture and system scaling, I look forward to contributing effectively to your engineering parameters.\n\nBest regards,\n${applicant.name}`,
          status: faker.helpers.arrayElement(['pending', 'reviewed', 'shortlisted', 'rejected']),
        });
        appCount++;
      }
      
      job.applicationCount = applicantsForJob.length;
      await job.save();
    }
    console.log(` Created ${appCount} Applications`);

    console.log(' Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();