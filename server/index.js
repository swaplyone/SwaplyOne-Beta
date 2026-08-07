import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Healthcheck Endpoint for Render & External Cron Pings
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'SwaplyOne Beta Backend',
    active: true,
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api', apiRoutes);

// Serve Production Frontend Dist Assets (if built)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(distPath, 'index.html'));
    }
  });
}

// Server Listen
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SwaplyOne Beta Express Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`==================================================\n`);

  // -----------------------------------------------------------------
  // RENDER KEEP-ALIVE AUTO-PING WORKER (Prevents 50-sec Cold Starts)
  // Render Free Services sleep after 15 mins of inactivity.
  // This worker pings the server every 10 minutes to keep it 100% active.
  // -----------------------------------------------------------------
  const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 Minutes

  setInterval(async () => {
    try {
      const publicUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL;
      if (publicUrl && publicUrl.startsWith('http')) {
        const pingUrl = `${publicUrl.replace(/\/$/, '')}/api/health`;
        const res = await fetch(pingUrl);
        const data = await res.json();
        console.log(`⏰ [Keep-Alive Ping] ${new Date().toLocaleTimeString()} - Status: ${data.status}`);
      }
    } catch (err) {
      console.warn(`⏰ [Keep-Alive Ping] Auto-ping notice:`, err.message);
    }
  }, KEEP_ALIVE_INTERVAL_MS);
});
