import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { validateEnv } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (isProduction) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  const indexPath = path.join(frontendPath, 'index.html');

  app.use(express.static(frontendPath));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    res.sendFile(indexPath, (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send(
      'Smart Business Management Platform API is running in Development mode!'
    );
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    message: isProduction ? 'Internal server error' : err.message,
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);

    if (error.message.includes('bad auth')) {
      console.error(
        '\nMongoDB authentication failed. Check backend/.env:\n' +
          '  1. Atlas → Database Access → verify username/password\n' +
          '  2. Atlas → Network Access → allow your IP (or 0.0.0.0/0)\n' +
          '  3. Copy a fresh connection string into MONGO_URI\n'
      );
    } else if (error.message.includes('querySrv')) {
      console.error(
        '\nMongoDB DNS lookup failed. Check your internet connection or VPN.\n'
      );
    }

    process.exit(1);
  }
};

startServer();

export default app;
