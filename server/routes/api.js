import express from 'express';
import crypto from 'crypto';
import { db, auth, isFirebaseConnected, localStore } from '../config/firebase.js';
import { sendOtpEmail, sendRegistrationSuccessEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Helper: Hash Password using native crypto
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// Helper: Get settings from Firestore or LocalStore
async function getSettings() {
  if (isFirebaseConnected && db) {
    const doc = await db.collection('settings').doc('global_settings').get();
    if (doc.exists) return doc.data();
  }
  return localStore.data.settings;
}

// Helper: Update settings
async function updateSettings(newSettings) {
  if (isFirebaseConnected && db) {
    await db.collection('settings').doc('global_settings').set(newSettings, { merge: true });
  } else {
    localStore.data.settings = { ...localStore.data.settings, ...newSettings, updatedAt: new Date().toISOString() };
  }
}

// Helper: Get users
async function getUsers() {
  if (isFirebaseConnected && db) {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  return localStore.data.users;
}

// -------------------------------------------------------------
// 1. GET /api/beta/status - Registration limit & availability
// -------------------------------------------------------------
router.get('/beta/status', async (req, res) => {
  try {
    const settings = await getSettings();
    const users = await getUsers();
    const currentCount = users.length;
    const maxLimit = settings.maxLimit || 150;
    const enabled = settings.enabled !== false;
    const remainingSlots = Math.max(0, maxLimit - currentCount);

    return res.json({
      success: true,
      enabled,
      currentCount,
      maxLimit,
      remainingSlots,
      registrationClosed: !enabled || remainingSlots <= 0
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 2. POST /api/otp/send - Generate & send OTP
// -------------------------------------------------------------
router.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check system status
    const settings = await getSettings();
    const users = await getUsers();
    if (!settings.enabled) {
      return res.status(400).json({ success: false, message: 'Registration is currently disabled by admin.' });
    }
    if (users.length >= settings.maxLimit) {
      return res.status(400).json({ success: false, message: 'Beta registration limit reached (150 users max).' });
    }

    // Check if Beta Pass already claimed for this email
    const existingUser = users.find(u => u.email === cleanEmail && u.betaId);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Beta Pass (${existingUser.betaId}) already claimed for ${cleanEmail}.` });
    }

    // Check OTP cooldown
    const existingOtp = localStore.data.otp_codes[cleanEmail];
    if (existingOtp && Date.now() - existingOtp.createdAt < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - existingOtp.createdAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec}s before requesting a new code.`,
        cooldownSeconds: waitSec
      });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    localStore.data.otp_codes[cleanEmail] = {
      email: cleanEmail,
      code: otpCode,
      createdAt: Date.now(),
      expiresAt,
      attempts: 0,
      verified: false
    };

    // Send email
    await sendOtpEmail(cleanEmail, otpCode);

    return res.json({
      success: true,
      message: 'Verification code sent to your email.',
      cooldownSeconds: 60,
      // For local testing & review, pass mock code in debug mode
      debugCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 3. POST /api/otp/verify - Verify 6-digit OTP code
// -------------------------------------------------------------
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpRecord = localStore.data.otp_codes[cleanEmail];

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No verification request found for this email. Please request an OTP first.' });
    }

    if (Date.now() > otpRecord.expiresAt) {
      delete localStore.data.otp_codes[cleanEmail];
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (otpRecord.attempts >= 5) {
      delete localStore.data.otp_codes[cleanEmail];
      return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please request a new code.' });
    }

    if (otpRecord.code !== otp.trim()) {
      otpRecord.attempts += 1;
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // OTP Verified!
    const token = `verif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    otpRecord.verified = true;
    otpRecord.token = token;

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      verificationToken: token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 3.5 GET /api/username/check - Check Username Availability
// -------------------------------------------------------------
router.get('/username/check', async (req, res) => {
  try {
    const rawUsername = (req.query.username || '').trim();
    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      return res.json({ available: false, message: 'Username must be at least 3 alphanumeric characters.' });
    }

    const users = await getUsers();
    const isTaken = users.some(u => (u.username || '').toLowerCase() === cleanUsername);

    if (isTaken) {
      return res.json({ available: false, message: 'Username is already taken.' });
    }

    return res.json({ available: true, message: 'Username is available!', username: cleanUsername });
  } catch (error) {
    return res.status(500).json({ available: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 4. POST /api/beta/register - Register new Beta User
// -------------------------------------------------------------
router.post('/beta/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      name,
      email,
      occupation,
      country,
      referralSource,
      betaReason,
      track,
      skillsToTest,
      experience,
      verificationToken
    } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFirstName = (firstName || name || cleanEmail.split('@')[0]).trim();
    const cleanLastName = (lastName || '').trim();
    const fullName = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;
    const cleanUsername = (username || cleanFirstName.toLowerCase().replace(/[^a-z0-9_]/g, '')).trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // STRICT OTP VERIFICATION CHECK: Only allow storing user and issuing betaId if email was verified via OTP
    const otpRecord = localStore.data.otp_codes[cleanEmail];
    const isTokenValid = otpRecord && otpRecord.verified === true && (otpRecord.token === verificationToken || Boolean(verificationToken));

    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Email verification required. Please verify your 6-digit OTP code before claiming your Beta Pass.'
      });
    }

    const settings = await getSettings();
    const users = await getUsers();

    if (!settings.enabled) {
      return res.status(400).json({ success: false, message: 'Beta registration is currently disabled.' });
    }

    if (users.length >= settings.maxLimit) {
      return res.status(400).json({ success: false, message: 'Beta registration limit reached.' });
    }

    const existingUser = users.find(u => u.email === cleanEmail && u.betaId);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Beta Pass (${existingUser.betaId}) already claimed for ${cleanEmail}.` });
    }

    // Generate Beta ID format (e.g. SWAP-BETA-1003)
    const betaNumber = 1001 + users.length;
    const betaId = `SWAP-BETA-${betaNumber}`;

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      betaId,
      name: fullName,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      username: cleanUsername,
      email: cleanEmail,
      occupation: occupation || 'Other',
      country: country || 'Not Specified',
      referralSource: referralSource || 'Direct',
      betaReason: (betaReason || '').substring(0, 300),
      track: track || 'pioneer',
      skillsToTest: skillsToTest || 'General Skill Swapping',
      experience: experience || '',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConnected && db) {
      await db.collection('users').doc(newUser.id).set(newUser);
      await db.collection('settings').doc('global_settings').set({
        currentCount: users.length + 1
      }, { merge: true });
    } else {
      localStore.data.users.unshift(newUser);
      localStore.data.settings.currentCount = localStore.data.users.length;
    }

    // Cleanup OTP code record
    delete localStore.data.otp_codes[cleanEmail];

    // Trigger emails asynchronously
    sendRegistrationSuccessEmail(cleanEmail, newUser.name, betaId);
    sendWelcomeEmail(cleanEmail, newUser.name, betaId);

    // Record admin log
    const logItem = {
      id: `log_${Date.now()}`,
      action: 'USER_REGISTERED',
      details: `New Beta User registered: ${newUser.name} (${betaId})`,
      timestamp: new Date().toISOString()
    };
    localStore.data.admin_logs.unshift(logItem);

    return res.json({
      success: true,
      message: 'Welcome to Swaply Beta!',
      user: newUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 4.5 POST /api/auth/register - Register Account with Password
// -------------------------------------------------------------
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const users = await getUsers();
    const existingUser = users.find(u => u.email === cleanEmail);

    if (existingUser && existingUser.passwordHash) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = existingUser ? existingUser.id : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Create User in Firebase Auth Service
    if (isFirebaseConnected && auth) {
      try {
        await auth.createUser({
          uid: userId,
          email: cleanEmail,
          password: password,
          displayName: cleanName || cleanEmail.split('@')[0]
        });
        console.log(`🔥 Firebase Auth User created: ${cleanEmail}`);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-exists') {
          return res.status(400).json({ success: false, message: 'An account with this email already exists in Firebase Auth.' });
        }
        console.warn('Firebase Auth creation notice:', authErr.message);
      }
    }

    const userData = {
      id: userId,
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: hash,
      salt: salt,
      createdAt: existingUser?.createdAt || new Date().toISOString()
    };

    if (isFirebaseConnected && db) {
      await db.collection('users').doc(userId).set(userData, { merge: true });
    } else {
      const idx = localStore.data.users.findIndex(u => u.email === cleanEmail);
      if (idx >= 0) {
        localStore.data.users[idx] = { ...localStore.data.users[idx], ...userData };
      } else {
        localStore.data.users.unshift(userData);
      }
    }

    return res.json({
      success: true,
      message: 'Account registered successfully!',
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        isAdmin: cleanEmail === 'founder@swaplyone.in'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 4.6 POST /api/auth/login - Sign In with Password Verification
// -------------------------------------------------------------
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to sign in.' });
    }

    // Founder Master Override
    const isFounder = cleanEmail === 'founder@swaplyone.in';
    if (isFounder && password === 'lichisw@26') {
      return res.json({
        success: true,
        message: 'Welcome back, Founder!',
        user: {
          id: 'usr_founder',
          name: 'Swaply Founder',
          email: cleanEmail,
          isAdmin: true
        }
      });
    }

    const users = await getUsers();
    const user = users.find(u => u.email === cleanEmail);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address. Please register an account first.'
      });
    }

    if (user.passwordHash && user.salt) {
      const { hash } = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        });
      }
    }

    return res.json({
      success: true,
      message: 'Sign in successful!',
      user: {
        id: user.id,
        name: user.name || cleanEmail.split('@')[0],
        email: user.email,
        betaId: user.betaId || undefined,
        isAdmin: cleanEmail === 'founder@swaplyone.in'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 5. ADMIN ENDPOINTS: GET /api/admin/stats
// -------------------------------------------------------------
router.get('/admin/stats', async (req, res) => {
  try {
    const settings = await getSettings();
    const users = await getUsers();
    const otpsSent = Object.keys(localStore.data.otp_codes).length;
    const emailsSent = localStore.data.email_logs.length;

    return res.json({
      success: true,
      totalRegistered: users.length,
      maxLimit: settings.maxLimit || 150,
      remainingSlots: Math.max(0, (settings.maxLimit || 150) - users.length),
      registrationEnabled: settings.enabled !== false,
      otpsSent,
      emailsSent
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 6. ADMIN ENDPOINTS: GET/POST /api/admin/settings
// -------------------------------------------------------------
router.get('/admin/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/settings', async (req, res) => {
  try {
    const { maxLimit, enabled } = req.body;
    const currentSettings = await getSettings();

    const updated = {
      ...currentSettings,
      ...(maxLimit !== undefined && { maxLimit: parseInt(maxLimit) }),
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      updatedAt: new Date().toISOString()
    };

    await updateSettings(updated);

    // Record admin audit log
    localStore.data.admin_logs.unshift({
      id: `log_${Date.now()}`,
      action: 'SETTINGS_UPDATED',
      details: `Limit set to ${updated.maxLimit}, Enabled: ${updated.enabled}`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Registration settings updated successfully.',
      settings: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 7. ADMIN ENDPOINTS: GET /api/admin/users
// -------------------------------------------------------------
router.get('/admin/users', async (req, res) => {
  try {
    let users = await getUsers();
    const { q } = req.query;

    if (q) {
      const searchTerm = q.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.betaId.toLowerCase().includes(searchTerm)
      );
    }

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 8. ADMIN ENDPOINTS: DELETE /api/admin/users/:id
// -------------------------------------------------------------
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      await db.collection('users').doc(id).delete();
    } else {
      localStore.data.users = localStore.data.users.filter(u => u.id !== id);
      localStore.data.settings.currentCount = localStore.data.users.length;
    }

    localStore.data.admin_logs.unshift({
      id: `log_${Date.now()}`,
      action: 'USER_DELETED',
      details: `User ${id} removed by admin`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 9. ADMIN ENDPOINTS: GET /api/admin/email-logs & Export CSV
// -------------------------------------------------------------
router.get('/admin/email-logs', async (req, res) => {
  try {
    if (isFirebaseConnected && db) {
      const snapshot = await db.collection('email_logs').orderBy('timestamp', 'desc').get();
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, logs });
    }
    return res.json({ success: true, logs: localStore.data.email_logs });
  } catch (err) {
    return res.json({ success: true, logs: localStore.data.email_logs });
  }
});

router.get('/admin/export-csv', async (req, res) => {
  try {
    const users = await getUsers();
    let csv = 'Beta ID,Name,Email,Track,Skills to Test,Registered Date\n';
    users.forEach(u => {
      csv += `"${u.betaId}","${u.name}","${u.email}","${u.track}","${u.skillsToTest}","${u.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="swaply_beta_users.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 10. EMAIL TEMPLATE PREVIEWS (View HTML in Browser)
// -------------------------------------------------------------
router.get('/preview/otp', (req, res) => {
  const otp = '849201';
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FBF5EC; padding: 30px; border-radius: 16px; border: 3px solid #1B242A; max-width: 520px; margin: 20px auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #D96B52; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">SWAPLY BETA INVITATION</span>
        <h2 style="color: #1B242A; margin-top: 12px; font-size: 24px; font-weight: 900;">Your Verification Code</h2>
      </div>
      <p style="color: #1B242A; font-size: 15px; line-height: 1.5; font-weight: 600;">Welcome to Swaply Beta! Enter the 6-digit code below to verify your email address:</p>
      <div style="background-color: #F7EFE5; border: 3px solid #1B242A; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #1B242A;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #D96B52;">${otp}</span>
      </div>
      <p style="color: #1B242A; font-size: 13px; font-weight: 600; opacity: 0.8;">This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

router.get('/preview/welcome', (req, res) => {
  const name = 'Pioneer Learner';
  const betaId = 'SWAP-BETA-1001';
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FBF5EC; padding: 30px; border-radius: 16px; border: 3px solid #1B242A; max-width: 520px; margin: 20px auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background-color: #C49A62; color: #1B242A; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 12px;">WELCOME TO THE COMMUNITY</span>
        <h2 style="color: #1B242A; margin-top: 12px; font-size: 24px; font-weight: 900;">Welcome to Swaply Beta! 🚀</h2>
      </div>
      <p style="color: #1B242A; font-size: 15px; font-weight: 600;">Hi ${name},</p>
      <p style="color: #1B242A; font-size: 14px; line-height: 1.6;">Thank you for being one of our early pioneer members. We are building the future of peer-to-peer skill swapping, live video collaboration, and community building.</p>
      <div style="background-color: #C49A62; color: #1B242A; border: 3px solid #1B242A; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; box-shadow: 4px 4px 0px #1B242A;">
        <span style="font-size: 22px; font-weight: 900; letter-spacing: 2px;">${betaId}</span>
      </div>
      <hr style="border: 1px dashed #1B242A; margin: 20px 0;" />
      <p style="color: #1B242A; font-size: 12px; font-weight: 700; text-align: center;">Swaply Beta Team • Made with ❤️ for Builders</p>
    </div>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
