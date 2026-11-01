import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const demoSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String,
  securityNote: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'demo_password_security' });

const DemoUser = mongoose.model('DemoSecurityUser', demoSchema);

async function runMigrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const user = await DemoUser.findOne({ email: 'candidate.john@example.com' });
  if (!user) {
    console.error('Candidate record not found');
    process.exit(1);
  }

  // Generate 12-round cryptographic salt and hash with bcrypt
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  user.password = hashedPassword;
  user.securityNote = 'SECURE: Cryptographically salted hash using bcrypt (Cost factor: 12 rounds)';
  await user.save();

  console.log('\n--- 2. AFTER (Salted bcrypt Hash Applied) ---');
  console.log(JSON.stringify(user, null, 2));

  process.exit(0);
}

runMigrate();
