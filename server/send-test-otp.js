import dotenv from 'dotenv';
import { sendOtpEmail } from './services/emailService.js';

dotenv.config();

const targetEmail = process.argv[2] || 'tallurulijith2005@gmail.com';
const testCode = '849201';

console.log(`\n📧 Sending test OTP code ${testCode} to ${targetEmail}...`);

const success = await sendOtpEmail(targetEmail, testCode);

if (success) {
  console.log(`\n🎉 SUCCESS! Real OTP Email successfully delivered via Gmail SMTP to: ${targetEmail}`);
} else {
  console.log(`\n❌ FAILED to send email. Check SMTP credentials in .env.`);
}
