# 🚀 SwaplyOne — 1-on-1 Real-Time Video Skill Swapping

![Swaply Favicon](public/favicon.png)

> **"Learn any skill. Teach what you know. Connect 1-on-1 in real time."**

---

## 👨‍💻 About the Founder

SwaplyOne was founded with a singular conviction: **the best way to master a new skill is through direct, 1-on-1 human connection.** 

Traditional online courses are passive, expensive, and lonely. SwaplyOne was created by the founder (`founder@swaplyone.in`) to break down financial and geographical barriers to education, enabling developers, designers, language learners, musicians, and creators around the globe to exchange knowledge directly face-to-face via real-time video call.

---

## 🎯 Our Mission & Goal

### The Mission
To build the world's most zero-friction, peer-to-peer skill exchange ecosystem where everyone is both a student and a teacher.

### Key Platform Goals
1. **Zero-Barrier Learning**: Enable anyone to exchange skills without paid subscription paywalls.
2. **Ultra-Low Latency Video Streaming**: Powered by WebRTC direct peer-to-peer protocols (<35ms latency), operating seamlessly inside any mobile or desktop browser with zero software downloads.
3. **Pioneer Community First**: Limit initial pioneer access to **150 verified members** to foster a high-trust, authentic early community.
4. **Platform Integrity**: Enforce strict 1-registration single-user policies to eliminate fake accounts and maintain quality matches.

---

## ✨ Signature Platform Highlights

### 🎨 1. 3D Paper Origami Morph Bar (`MorphBar.jsx`)
- Handcrafted paper stationery aesthetics featuring notebook textures, brass paper clips 📎, washi tape, and distressed stamp labels.
- Mobile-first **`🔍 Search`** launcher pill.
- Smooth spring physics transitions across 8 reactive morph states (`idle`, `search`, `incoming_call`, `active_call`, `friend_request`, `notification`, `profile`, `security_alert`).

### 🎫 2. Pioneer Beta Registration (`/beta`)
- Auto-locks email to active member login session (`🔒 Email Locked to Login Session`).
- Verifies email via a 6-digit OTP code sent using Nodemailer SMTP (`founder@swaplyone.in`).
- Issues official **`SWAP-BETA-XXXX`** ticket passes with celebration confetti.

### 🔑 3. Member Portal (`/login`) & Settings (`/settings`)
- Unified **Sign In** and **Register Account** tabs.
- Live **`🟢 LOGGED IN`** / **`🔴 NOT LOGGED IN`** status indicators.
- 1-click **Sign Out / Disconnect Session** button and WebRTC hardware permission controls.

### 🛡️ 4. Secret Admin Control Center (`/admin`)
- **Passcode Protected**: Unlocks with secure passcode `lichisw@26`.
- **Secret 3-Tap Trigger**: Tap the **`PRIVATE BETA • EARLY TESTER`** hero badge on the homepage **3 times** to open the Admin Control Center directly.
- Full administrative controls over pioneer slot limits, registration pause/resume, live Firestore user roster, and email logs export.

### 🔥 5. Firebase Firestore & Express Server Integration
- Express REST API backend server (`server/index.js` & `server/routes/api.js`) running on port `5000`.
- Connected to Firebase Project **`swaplyone-beta`**.
- Live collection sync: `users`, `settings`, `otp_codes`, `email_logs`, `admin_logs`.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend Express Server Port
PORT=5000

# Gmail SMTP Email Service Credentials
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=founder@swaplyone.in
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="Swaply <founder@swaplyone.in>"

# Firebase Project Credentials (serviceAccountKey.json placed in root directory)
FIREBASE_PROJECT_ID=swaplyone-beta
```

---

## 🚀 Quick Start Guide

```bash
# 1. Install dependencies
npm install

# 2. Run development server (Express + Vite)
npm run dev

# 3. Test SMTP email connection
npm run test:smtp

# 4. Test Firebase Firestore connection
npm run test:firebase

# 5. Build for production
npm run build
```

---

## 📬 Contact the Founder
- **Email**: `founder@swaplyone.in`
- **GitHub Repository**: [https://github.com/swaplyone/SwaplyOne-Beta.git](https://github.com/swaplyone/SwaplyOne-Beta.git)

---

Copyright © 2026 SwaplyOne. All rights reserved.
