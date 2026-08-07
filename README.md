# 🚀 SwaplyOne Beta — Next Generation 1-on-1 Video Skill Swapping

![Swaply Beta](public/favicon.png)

Official repository for **SwaplyOne Beta** — a handcrafted, real-time 1-on-1 video call skill-exchange platform featuring signature 3D Paper Origami Morph Bar navigation, single-track Pioneer Registration, Nodemailer SMTP verification, and live Firebase Firestore database synchronization.

🔗 **GitHub Repository**: [https://github.com/swaplyone/SwaplyOne-Beta.git](https://github.com/swaplyone/SwaplyOne-Beta.git)

---

## ✨ Key Features & Architecture

### 🎨 1. Signature 3D Paper Origami Morph Bar Navigation Header
- **Paper Craft Aesthetic**: Inspired by notebook stationery, paper clips 📎, washi tape, and distressed stamp labels.
- **8 Reactive Morph States**: Supports `idle`, `search` (Command Center), `incoming_call`, `active_call`, `friend_request`, `notification`, `profile`, and `security_alert`.
- **Mobile-First Search Launcher**: `🔍 Search` pill launcher optimized for touchscreens and mobile viewports.

### 🔑 2. Unified Member Login & Registration Portal
- Dedicated `/login` portal featuring active **Sign In** and **Register Account** tabs.
- Auto-detects session state (`swaply_user_session`) and locks email verification to eliminate fake accounts.

### 🎫 3. Single-Track Pioneer Beta Registration (`/beta`)
- Auto-locks email to active session (`🔒 Email Locked to Login Session`).
- Verifies email using a 6-digit OTP code sent via Nodemailer SMTP (`founder@swaplyone.in`).
- Issues official **`SWAP-BETA-XXXX`** ticket passes with celebration confetti.
- **Single Registration Policy**: Strict 1-registration limit per email address to eliminate duplicate/fake users.

### 🔐 4. Secret Admin Control Center (`/admin`)
- **Passcode Protected**: Unlocks with secure passcode `lichisw@26`.
- **Secret 3-Tap Trigger**: Tap the **`PRIVATE BETA • EARLY TESTER`** badge on the Home screen hero section 3 times to open the Admin Control Center directly.
- Full administration controls over pioneer slots (150 default limit), registration pause/resume, live Firestore user roster, and email logs export.

### 🔥 5. Live Firebase Firestore & Nodemailer SMTP Integration
- Express REST backend server (`server/index.js` & `server/routes/api.js`) running on port `5000`.
- Modular Firebase Admin SDK setup connected to project **`swaplyone-beta`**.
- Live collections synced: `users`, `settings`, `otp_codes`, `email_logs`, `admin_logs`.
- Real-time HTML email delivery for OTP verification, registration confirmations, and welcome passes.

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

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
*(Starts both Express API server on port 5000 and Vite frontend on port 5173).*

### 3. Verify SMTP Email Setup
```bash
npm run test:smtp
```

### 4. Verify Firebase Firestore Setup
```bash
npm run test:firebase
```

### 5. Production Build
```bash
npm run build
```

---

## 📁 Repository Structure

```text
swaply-web-welcome/
├── public/
│   ├── favicon.png               # Official Swaply Favicon
│   └── frames/                   # Scroll animation image frames
├── server/
│   ├── config/firebase.js        # Firebase Admin SDK v14 modular config
│   ├── routes/api.js             # Express REST API routes (Firestore synced)
│   ├── services/emailService.js  # Nodemailer HTML email service
│   ├── test-smtp.js              # SMTP test script
│   └── test-firebase.js          # Firestore test script
├── src/
│   ├── components/
│   │   ├── BetaTesterPage.jsx    # Single-track Pioneer registration & OTP
│   │   ├── HeroSection.jsx       # Hero section with 3-tap secret trigger
│   │   ├── MorphBar.jsx          # 3D Paper Origami Morph Bar
│   │   └── SwaplyLogo.jsx        # Swaply logo component
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx# Control center (/admin)
│   │   ├── HomePage.jsx          # Homepage
│   │   ├── LoginPage.jsx         # Unified Login/Register portal (/login)
│   │   └── SettingsPage.jsx      # Settings & session status (/settings)
│   └── App.jsx                   # Router & MorphBar provider setup
├── serviceAccountKey.json        # Firebase Admin Service Account Key
├── package.json
└── README.md
```

---

## 🛡️ License & Platform Policy
Copyright © 2026 Swaply. All rights reserved. Registered Pioneer Access is governed by Swaply Single-Registration Platform Policies.
