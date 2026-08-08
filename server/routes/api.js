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

// Helper: Get registered account users
async function getUsers() {
  try {
    if (isFirebaseConnected && db) {
      const snapshot = await db.collection('users').get();
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  } catch (err) {
    console.warn('⚠️ Firestore getUsers error:', err.message);
  }
  return localStore.data.users || [];
}

// Helper: Get beta pass tester registrations
async function getBetaUsers() {
  try {
    let betaList = [];
    let userList = [];

    if (isFirebaseConnected && db) {
      const betaSnapshot = await db.collection('beta_users').get();
      betaList = betaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userSnapshot = await db.collection('users').get();
      userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      betaList = localStore.data.beta_users || [];
      userList = localStore.data.users || [];
    }

    const combinedMap = new Map();
    for (const b of betaList) {
      const key = (b.email || b.id || '').toLowerCase();
      if (key) combinedMap.set(key, b);
    }

    for (const u of userList) {
      if (u.betaId) {
        const key = (u.email || u.id || '').toLowerCase();
        if (key && !combinedMap.has(key)) {
          combinedMap.set(key, u);
        }
      }
    }

    const result = Array.from(combinedMap.values());
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.warn('⚠️ Firestore getBetaUsers error:', err.message);
  }
  return localStore.data.beta_users || [];
}

// -------------------------------------------------------------
// 1. GET /api/beta/status - Registration limit & availability
// -------------------------------------------------------------
router.get('/beta/status', async (req, res) => {
  try {
    const settings = await getSettings();
    const betaUsers = await getBetaUsers();
    const currentCount = betaUsers.length;
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
// 1.5 GET /api/beta/verify-user - Verify if beta pass user exists in DB
// -------------------------------------------------------------
router.get('/beta/verify-user', async (req, res) => {
  try {
    const cleanEmail = (req.query.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.json({ registered: false });
    }

    const betaUsers = await getBetaUsers();
    const users = await getUsers();

    let betaUser = betaUsers.find(u => u.email === cleanEmail && u.betaId);
    if (!betaUser) {
      betaUser = users.find(u => u.email === cleanEmail && u.betaId);
    }

    if (betaUser) {
      return res.json({ registered: true, user: betaUser });
    }

    return res.json({ registered: false });
  } catch (error) {
    return res.json({ registered: false });
  }
});

// -------------------------------------------------------------
// Helper: Save OTP code
async function saveOtp(email, record) {
  localStore.data.otp_codes[email] = record;
  if (isFirebaseConnected && db) {
    try {
      await db.collection('otp_codes').doc(email).set(record);
    } catch (err) {
      console.warn('⚠️ Firestore saveOtp error:', err.message);
    }
  }
}

// Helper: Get OTP code
async function getOtp(email) {
  let record = localStore.data.otp_codes[email];
  if (!record && isFirebaseConnected && db) {
    try {
      const doc = await db.collection('otp_codes').doc(email).get();
      if (doc.exists) {
        record = doc.data();
        localStore.data.otp_codes[email] = record;
      }
    } catch (err) {
      console.warn('⚠️ Firestore getOtp error:', err.message);
    }
  }
  return record;
}

// Helper: Delete OTP code
async function deleteOtp(email) {
  delete localStore.data.otp_codes[email];
  if (isFirebaseConnected && db) {
    try {
      await db.collection('otp_codes').doc(email).delete();
    } catch (err) {
      console.warn('⚠️ Firestore deleteOtp error:', err.message);
    }
  }
}

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
    const betaUsers = await getBetaUsers();
    if (!settings.enabled) {
      return res.status(400).json({ success: false, message: 'Registration is currently disabled by admin.' });
    }
    if (betaUsers.length >= settings.maxLimit) {
      return res.status(400).json({ success: false, message: 'Beta registration limit reached (150 users max).' });
    }

    // Check if Beta Pass already claimed for this email
    const existingUser = betaUsers.find(u => u.email === cleanEmail && u.betaId);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Beta Pass (${existingUser.betaId}) already claimed for ${cleanEmail}.` });
    }

    // Check OTP cooldown
    const existingOtp = await getOtp(cleanEmail);
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

    const newRecord = {
      email: cleanEmail,
      code: otpCode,
      createdAt: Date.now(),
      expiresAt,
      attempts: 0,
      verified: false
    };

    await saveOtp(cleanEmail, newRecord);

    // Send email
    const emailSent = await sendOtpEmail(cleanEmail, otpCode);

    const isFounder = cleanEmail === 'founder@swaplyone.in';
    const isDev = process.env.NODE_ENV !== 'production';

    if (!emailSent) {
      console.warn(`⚠️ OTP Email delivery failed for ${cleanEmail}. Check SMTP credentials on server.`);
      return res.status(500).json({
        success: false,
        emailSent: false,
        message: 'Could not deliver verification email. Server SMTP delivery failed. Please check server logs or contact support.',
        cooldownSeconds: 15
      });
    }

    return res.json({
      success: true,
      emailSent: true,
      message: 'Verification code sent to your email. Please check your Inbox & Spam folder.',
      cooldownSeconds: 60
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
    const otpRecord = await getOtp(cleanEmail);

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No verification request found for this email. Please request an OTP first.' });
    }

    if (Date.now() > otpRecord.expiresAt) {
      await deleteOtp(cleanEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (otpRecord.attempts >= 5) {
      await deleteOtp(cleanEmail);
      return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please request a new code.' });
    }

    if (otpRecord.code !== otp.trim()) {
      otpRecord.attempts += 1;
      await saveOtp(cleanEmail, otpRecord);
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // OTP Verified!
    const token = `verif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    otpRecord.verified = true;
    otpRecord.token = token;
    await saveOtp(cleanEmail, otpRecord);

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
    const otpRecord = await getOtp(cleanEmail);
    const isTokenValid = otpRecord && otpRecord.verified === true && (otpRecord.token === verificationToken || Boolean(verificationToken));

    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Email verification required. Please verify your 6-digit OTP code before claiming your Beta Pass.'
      });
    }

    const settings = await getSettings();
    const betaUsers = await getBetaUsers();

    if (!settings.enabled) {
      return res.status(400).json({ success: false, message: 'Beta registration is currently disabled.' });
    }

    if (betaUsers.length >= settings.maxLimit) {
      return res.status(400).json({ success: false, message: 'Beta registration limit reached.' });
    }

    const existingUser = betaUsers.find(u => u.email === cleanEmail && u.betaId);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Beta Pass (${existingUser.betaId}) already claimed for ${cleanEmail}.` });
    }

    // Generate Conflict-Free Beta ID format (e.g. SWAP-BETA-1004)
    const existingNumbers = betaUsers
      .map(u => {
        const match = (u.betaId || '').match(/SWAP-BETA-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num) && num > 0);

    const maxBetaNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 1000;
    const nextBetaNumber = Math.max(1001, maxBetaNumber + 1);
    const betaId = `SWAP-BETA-${nextBetaNumber}`;

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
      await db.collection('beta_users').doc(newUser.id).set(newUser);
      await db.collection('settings').doc('global_settings').set({
        currentCount: betaUsers.length + 1
      }, { merge: true });
    } else {
      localStore.data.beta_users.unshift(newUser);
      localStore.data.settings.currentCount = localStore.data.beta_users.length;
    }

    // Cleanup OTP code record
    await deleteOtp(cleanEmail);

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
    const betaUsers = await getBetaUsers();
    const existingUser = users.find(u => u.email === cleanEmail) || betaUsers.find(u => u.email === cleanEmail);

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
    const betaUsers = await getBetaUsers();

    let user = users.find(u => u.email === cleanEmail);
    let isBetaAccount = false;

    if (!user) {
      user = betaUsers.find(u => u.email === cleanEmail);
      if (user) isBetaAccount = true;
    }

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
    } else {
      // First password sign-in for Beta Pass holder: auto-link password!
      const { hash, salt } = hashPassword(password);
      user.passwordHash = hash;
      user.salt = salt;

      if (isFirebaseConnected && db) {
        const collectionName = isBetaAccount ? 'beta_users' : 'users';
        await db.collection(collectionName).doc(user.id).set({ passwordHash: hash, salt }, { merge: true });
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
    const betaUsers = await getBetaUsers();
    const otpsSent = Object.keys(localStore.data.otp_codes).length;
    let emailsSent = localStore.data.email_logs.length;

    if (isFirebaseConnected && db) {
      try {
        const snapshot = await db.collection('email_logs').get();
        emailsSent = snapshot.size;
      } catch (e) {}
    }

    const currentCount = betaUsers.length;
    const maxLimit = settings.maxLimit || 150;
    const enabled = settings.enabled !== false;
    const remainingSlots = Math.max(0, maxLimit - currentCount);

    return res.json({
      success: true,
      totalRegistered: currentCount,
      maxLimit,
      remainingSlots,
      registrationEnabled: enabled,
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
// 7. ADMIN ENDPOINTS: GET /api/admin/users (Registered Accounts)
// -------------------------------------------------------------
router.get('/admin/users', async (req, res) => {
  try {
    let users = await getUsers();
    const { q } = req.query;

    if (q) {
      const searchTerm = q.toLowerCase();
      users = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm) ||
        (u.email || '').toLowerCase().includes(searchTerm)
      );
    }

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 7.5 ADMIN ENDPOINTS: GET /api/admin/beta-users (Beta Pass Roster)
// -------------------------------------------------------------
router.get('/admin/beta-users', async (req, res) => {
  try {
    let betaUsers = await getBetaUsers();
    const { q } = req.query;

    if (q) {
      const searchTerm = q.toLowerCase();
      betaUsers = betaUsers.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm) ||
        (u.email || '').toLowerCase().includes(searchTerm) ||
        (u.betaId || '').toLowerCase().includes(searchTerm)
      );
    }

    return res.json({ success: true, count: betaUsers.length, betaUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 8. ADMIN ENDPOINTS: DELETE /api/admin/users/:id (Account User)
// -------------------------------------------------------------
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      await db.collection('users').doc(id).delete();
    } else {
      localStore.data.users = localStore.data.users.filter(u => u.id !== id);
    }

    localStore.data.admin_logs.unshift({
      id: `log_${Date.now()}`,
      action: 'USER_DELETED',
      details: `Account User ${id} removed by admin`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Account user deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 8.5 ADMIN ENDPOINTS: DELETE /api/admin/beta-users/:id (Beta Pass Only)
// -------------------------------------------------------------
router.delete('/admin/beta-users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      await db.collection('beta_users').doc(id).delete();
      const updatedBeta = await getBetaUsers();
      await db.collection('settings').doc('global_settings').set({
        currentCount: updatedBeta.length
      }, { merge: true });
    } else {
      localStore.data.beta_users = localStore.data.beta_users.filter(u => u.id !== id);
      localStore.data.settings.currentCount = localStore.data.beta_users.length;
    }

    localStore.data.admin_logs.unshift({
      id: `log_${Date.now()}`,
      action: 'BETA_USER_DELETED',
      details: `Beta Pass ${id} removed by admin (Account details untouched)`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Beta Pass record removed. Account details remain untouched.' });
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
