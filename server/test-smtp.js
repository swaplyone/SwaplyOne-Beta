import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n========================================');
console.log('📧 TESTING SMTP EMAIL CONFIGURATION');
console.log('========================================\n');

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587');
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (!host || !user || !pass) {
  console.error('❌ Missing SMTP environment variables in .env file!');
  console.log('\nPlease make sure your .env file contains:');
  console.log('  SMTP_HOST=smtp.gmail.com');
  console.log('  SMTP_PORT=587');
  console.log('  SMTP_USER=your-email@gmail.com');
  console.log('  SMTP_PASS=your-16-character-app-password\n');
  process.exit(1);
}

console.log(`Connecting to SMTP server: ${host}:${port}`);
console.log(`User: ${user}`);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass }
});

try {
  await transporter.verify();
  console.log('✅ SUCCESS! SMTP Server connection verified successfully!');

  // Optional: Send a test email to the user's address
  console.log(`Sending test email to ${user}...`);
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Swaply Test" <${user}>`,
    to: user,
    subject: '🎉 Swaply SMTP Connection Verified Successfully!',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #FBF5EC; padding: 25px; border-radius: 12px; border: 3px solid #1B242A; max-width: 480px;">
        <h2 style="color: #D96B52;">SMTP Working Great!</h2>
        <p>Your Swaply Beta Registration email service is connected and ready to send OTP verification codes.</p>
        <p><strong>Tested at:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  });
  console.log(`✅ Test email sent successfully! MessageId: ${info.messageId}\n`);
} catch (error) {
  console.error('\n❌ SMTP CONNECTION FAILED:');
  console.error(error.message);
  console.log('\n💡 Common Troubleshooting Fixes for Gmail:');
  console.log('  1. Enable 2-Factor Authentication (2FA) on your Google Account.');
  console.log('  2. Generate an "App Password" (Google Account -> Security -> 2-Step Verification -> App Passwords).');
  console.log('  3. Use the 16-character App Password for SMTP_PASS (NOT your normal Gmail password).\n');
}
