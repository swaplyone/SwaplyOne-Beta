import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Swaply Beta Registration Backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Swaply Beta Express Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`==================================================\n`);
});
