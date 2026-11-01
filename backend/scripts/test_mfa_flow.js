import 'dotenv/config';
import mongoose from 'mongoose';
import speakeasy from 'speakeasy';
import User from '../models/User.js';

async function testMfaFlow() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- 1. REGISTER/SETUP A TEST USER WITH MFA ---');
  
  const testEmail = 'mfa.candidate@portal.test';
  await User.deleteOne({ email: testEmail });

  const secret = speakeasy.generateSecret({ name: `JobPortal (${testEmail})`, issuer: 'JobPortal' });
  const user = await User.create({
    name: 'Jane Candidate',
    email: testEmail,
    password: 'SecurePassword2026!',
    role: 'seeker',
    isMfaEnabled: true,
    mfaSecret: secret.base32,
  });

  console.log(`User created: ${user.email} with MFA enabled.`);
  console.log(`Generated TOTP Base32 Secret: ${secret.base32}`);

  // Test 1: Login without TOTP code -> rejected with mfaRequired: true
  const res1 = await fetch('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'SecurePassword2026!', role: 'seeker' })
  });
  const data1 = await res1.json();
  console.log('\n--- 2. LOGIN ATTEMPT WITHOUT TOTP CODE (CHALLENGE TRIGGERED) ---');
  console.log(JSON.stringify(data1, null, 2));

  // Test 2: Login with WRONG TOTP code -> rejected with 401
  const res2 = await fetch('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'SecurePassword2026!', role: 'seeker', totpCode: '000000' })
  });
  const data2 = await res2.json();
  console.log('\n--- 3. LOGIN ATTEMPT WITH INVALID TOTP CODE (REJECTED 401) ---');
  console.log(`HTTP Status: ${res2.status}`);
  console.log(JSON.stringify(data2, null, 2));

  // Test 3: Generate VALID TOTP code using speakeasy (simulates Google/Microsoft Authenticator)
  const currentToken = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32'
  });
  console.log(`\nGenerated Live Google Authenticator Code: ${currentToken}`);

  // Test 4: Login with VALID TOTP code -> successful 200 with JWT Access Token
  const res3 = await fetch('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'SecurePassword2026!', role: 'seeker', totpCode: currentToken })
  });
  const data3 = await res3.json();
  console.log('\n--- 4. LOGIN ATTEMPT WITH VALID TOTP CODE (SUCCESSFUL 200 OK) ---');
  console.log(`HTTP Status: ${res3.status}`);
  console.log(`Access Token Issued: ${data3.accessToken ? data3.accessToken.substring(0, 35) + '...' : 'none'}`);
  console.log(`Authenticated User: ${data3.user?.name} (Role: ${data3.user?.role}, MFA Active: ${data3.user?.isMfaEnabled})`);

  process.exit(0);
}

testMfaFlow();
