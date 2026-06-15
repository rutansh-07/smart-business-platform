import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import path from 'path';

const __dirname = path.resolve();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve Frontend in Production for Unified Deployment
if (process.env.NODE_ENV === 'production') {
  // Set static folder to the Vite build output
  app.use(express.static(path.join(__dirname, './frontend/dist')));

  // Any route that is not an API route will be redirected to the React index.html
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, './frontend', 'dist', 'index.html'))
  );
} else {
  // Basic Route to test the server in development
  app.get('/', (req, res) => {
    res.send('Smart Business Management Platform API is running in Development mode!');
  });
}

// If not on Vercel, listen on the port (for local dev or Render deployment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;