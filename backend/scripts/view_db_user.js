import 'dotenv/config';
import mongoose from 'mongoose';

const demoSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String,
  securityNote: String,
  createdAt: Date
}, { collection: 'demo_password_security' });

const DemoUser = mongoose.model('DemoSecurityUser', demoSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await DemoUser.findOne({ email: 'candidate.john@example.com' });
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
}

check();
