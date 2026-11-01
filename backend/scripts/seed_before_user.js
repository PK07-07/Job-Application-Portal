import 'dotenv/config';
import mongoose from 'mongoose';

const demoSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String,
  securityNote: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'demo_password_security' });

const DemoUser = mongoose.model('DemoSecurityUser', demoSchema);

async function runDemo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  // Clear existing demo records
  await DemoUser.deleteMany({});

  // 1. Insert Vulnerable Plain Text Record (BEFORE)
  const plainUser = await DemoUser.create({
    email: 'candidate.john@example.com',
    name: 'John Doe',
    role: 'seeker',
    password: 'MySecretPassword2026!',
    securityNote: 'VULNERABLE: Stored as raw plaintext without encryption or hashing'
  });

  console.log('\n--- 1. BEFORE (Plain Text Password Record Created) ---');
  console.log(JSON.stringify(plainUser, null, 2));

  process.exit(0);
}

runDemo();
