import nodemailer from 'nodemailer';
import dns from 'dns';
import { db, isFirebaseConnected, localStore } from '../config/firebase.js';

// Force Node.js to resolve IPv4 addresses first globally (fixes ENETUNREACH on Render/AWS)
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if not supported in older node environments
}

// Strict IPv4 DNS lookup function for Nodemailer socket creation
function ipv4Lookup(hostname, options, callback) {
  const opts = typeof options === 'function' ? {} : (options || {});
  const cb = typeof options === 'function' ? options : callback;
  opts.family = 4;
  return dns.lookup(hostname, opts, cb);
}

let transporter = null;

function getEmailConfig() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587');
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || '"SwaplyOne" <founder@swaplyone.in>';
  return { host, port, user, pass, from };
}

function createTransporterForConfig(overridePort = null, forceCustomSmtp = false) {
  const config = getEmailConfig();
  const port = overridePort || config.port;
  const secure = port === 465;

  if (config.host && config.user && config.pass) {
    return nodemailer.createTransport({
      host: config.host,
      port,
      secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
        servername: config.host
      },
      lookup: ipv4Lookup, // STRICT IPV4 LOOKUP: Fixes ENETUNREACH 2607:f8b0:... IPv6 error on Render
      family: 4,
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000
    });
  }
  return null;
}

function initTransporter() {
  transporter = createTransporterForConfig();
}

initTransporter();

export async function logEmail(emailLog) {
  const record = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...emailLog,
    timestamp: new Date().toISOString()
  };

  try {
    if (isFirebaseConnected && db) {
      await db.collection('email_logs').add(record);
    } else {
      localStore.data.email_logs.unshift(record);
    }
  } catch (err) {
    console.error('Failed to log email:', err.message);
  }
}

export async function sendEmail({ to, subject, html, emailType }) {
  console.log(`\n========================================`);
  console.log(`📧 SENDING EMAIL [${emailType.toUpperCase()}] TO: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`========================================\n`);

  initTransporter();

  let success = false;
  let errorMsg = null;
  const config = getEmailConfig();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.from,
        to,
        subject,
        html
      });
      success = true;
      console.log(`✅ Email successfully delivered to ${to} via primary transporter!`);
    } catch (err) {
      console.error('❌ Primary send error:', err.message);
      errorMsg = err.message;

      // Fallback: Try alternative SMTP Port with IPv4 lookup
      const fallbackPort = config.port === 465 ? 587 : 465;
      console.log(`🔄 Attempting fallback delivery via Port ${fallbackPort} (IPv4)...`);
      try {
        const fallbackTransporter = createTransporterForConfig(fallbackPort, true);
        if (fallbackTransporter) {
          await fallbackTransporter.sendMail({
            from: config.from,
            to,
            subject,
            html
          });
          success = true;
          errorMsg = null;
          console.log(`✅ Fallback delivery succeeded via Port ${fallbackPort} to ${to}!`);
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback delivery failed:', fallbackErr.message);
        errorMsg = `Primary (${config.port}): ${err.message} | Fallback (${fallbackPort}): ${fallbackErr.message}`;
      }
    }
  } else {
    console.log('⚠️ Transporter not initialized. Missing SMTP credentials.');
    errorMsg = 'Missing SMTP credentials on server (EMAIL_USER / EMAIL_PASSWORD)';
  }

  await logEmail({
    to,
    subject,
    emailType,
    status: success ? 'SENT' : 'FAILED',
    error: errorMsg,
    bodySnippet: html.replace(/<[^>]+>/g, '').substring(0, 120) + '...'
  });

  return success;
}

export async function sendOtpEmail(email, otp) {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FBF5EC; padding: 30px; border-radius: 16px; border: 3px solid #1B242A; max-width: 520px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #D96B52; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">SWAPLYONE BETA INVITATION</span>
        <h2 style="color: #1B242A; margin-top: 12px; font-size: 24px; font-weight: 900;">Your Verification Code</h2>
      </div>
      <p style="color: #1B242A; font-size: 15px; line-height: 1.5; font-weight: 600;">Welcome to SwaplyOne Beta! Enter the 6-digit code below to verify your email address:</p>
      <div style="background-color: #F7EFE5; border: 3px solid #1B242A; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #1B242A;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #D96B52;">${otp}</span>
      </div>
      <p style="color: #1B242A; font-size: 13px; font-weight: 600; opacity: 0.8;">This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🔑 ${otp} is your SwaplyOne Beta Verification Code`,
    html,
    emailType: 'otp'
  });
}

export async function sendRegistrationSuccessEmail(email, name, betaId) {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FBF5EC; padding: 30px; border-radius: 16px; border: 3px solid #1B242A; max-width: 520px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #65AB84; color: #1B242A; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 12px;">REGISTRATION CONFIRMED</span>
        <h2 style="color: #1B242A; margin-top: 12px; font-size: 24px; font-weight: 900;">You're Officially In! 🎉</h2>
      </div>
      <p style="color: #1B242A; font-size: 15px; font-weight: 600;">Hey ${name},</p>
      <p style="color: #1B242A; font-size: 14px; line-height: 1.6; font-weight: 500;">Your SwaplyOne Beta registration has been confirmed. Below is your official Beta Pass ID:</p>
      <div style="background-color: #C49A62; color: #1B242A; border: 3px solid #1B242A; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; box-shadow: 4px 4px 0px #1B242A;">
        <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px;">${betaId}</span>
      </div>
      <p style="color: #1B242A; font-size: 13px; opacity: 0.8;">Keep this Beta ID safe. You will need it to activate founder perks and early skill-exchange matching.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🎉 Registration Confirmed! Your SwaplyOne Beta Pass: ${betaId}`,
    html,
    emailType: 'registration_success'
  });
}

export async function sendWelcomeEmail(email, name, betaId) {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FBF5EC; padding: 30px; border-radius: 16px; border: 3px solid #1B242A; max-width: 520px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #C49A62; color: #1B242A; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 12px;">WELCOME TO THE COMMUNITY</span>
        <h2 style="color: #1B242A; margin-top: 12px; font-size: 24px; font-weight: 900;">Welcome to SwaplyOne Beta! 🚀</h2>
      </div>
      <p style="color: #1B242A; font-size: 15px; font-weight: 600;">Hi ${name},</p>
      <p style="color: #1B242A; font-size: 14px; line-height: 1.6;">Thank you for being one of our early pioneer members. We are building the future of peer-to-peer skill swapping, live video collaboration, and community building.</p>
      <p style="color: #1B242A; font-size: 14px; line-height: 1.6;">We'll notify you as new testing rounds open up!</p>
      <hr style="border: 1px dashed #1B242A; margin: 20px 0;" />
      <p style="color: #1B242A; font-size: 12px; font-weight: 700; text-align: center;">SwaplyOne Beta Team • Made with ❤️ for Builders</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🚀 Welcome to SwaplyOne Beta, ${name}!`,
    html,
    emailType: 'welcome'
  });
}
