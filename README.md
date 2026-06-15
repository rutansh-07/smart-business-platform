# 🏢 SmartBiz - MERN Stack B2B SaaS Enterprise CRM & Analytics Platform

Welcome to the **SmartBiz** Enterprise Platform repository. This is a fully functional, highly secure, and responsive B2B SaaS application designed for multi-tenant workspace management, task boards, and dynamic real-time analytics.

## 🚀 Features & Implementation Status

✅ **Create responsive frontend screens using React.js**
*   Built with React 19 + Vite 8.
*   Mobile-first design scaling from 320px screens up to ultrawide desktops using Tailwind CSS v4.

✅ **Develop reusable UI components**
*   Custom glassmorphic layouts, floating navbars, and reusable Shadcn-inspired UI cards.
*   Integrated Framer Motion for micro-animations and smooth transitions.

✅ **Integrate frontend with backend APIs**
*   Robust `axios` interceptors automatically inject JWT tokens into headers.
*   Centralized API handlers connected perfectly to Express controllers.

✅ **Build secure REST APIs using Express.js**
*   Modular MVC architecture (Models, Views/Routes, Controllers).
*   Role-Based Access Control (RBAC) middleware ensuring unauthorized routes are blocked.

✅ **Design MongoDB collections and schemas**
*   Normalized multi-tenant architecture utilizing `User`, `Workspace`, `Project`, and `Task` collections.
*   Tenant-isolation achieved through `workspaceId` relationships on all active records.

✅ **Implement login/signup authentication using JWT**
*   Passwords hashed securely via `bcryptjs`.
*   Stateless, scalable authentication using `jsonwebtoken`.

✅ **Handle file uploads and media management**
*   Multer middleware integration for user Avatar uploads.
*   5MB limit filters ensuring only valid `.jpg`, `.jpeg`, and `.png` files are permitted.

✅ **Deploy frontend and backend applications**
*   Configured as a Unified Monorepo (Node serves the React static build).
*   Production-ready for Render, Railway, or any Node.js host.
*   Health check at `/api/health` for platform monitoring.

✅ **Maintain GitHub repository and commits**
*   Clean Git commit history maintaining iterative feature implementations.

✅ **Write project documentation and README**
*   You are reading it! (Detailed technical debug logs can also be found in `internship_report.md`).

---

## 💻 Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios.
*   **Backend:** Node.js, Express.js, MongoDB (Mongoose), Multer, JWT, Bcrypt.

## 🛠️ Local Development

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (proxied to backend API on port 5000).

## 🚀 Production Deployment (Render / Railway)

### 1. Environment Variables

Set these in your hosting dashboard (or copy `backend/.env.example` to `backend/.env` for local production testing):

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret_key
NODE_ENV=production
```

### 2. Build & Start Commands

| Step | Command |
|------|---------|
| **Build** | `npm run build` |
| **Start** | `npm start` |

### 3. One-Click Deploy on Render

1. Push this repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect the repo — Render auto-detects `render.yaml`.
4. Add your `MONGO_URI` in the Render dashboard (JWT_SECRET is auto-generated).
5. Deploy. Your app will be live at the Render URL.

### 4. MongoDB Atlas

- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
- Allow network access from `0.0.0.0/0` (or your host's IP range).
- Use the connection string as `MONGO_URI`.

> **Note:** File uploads are stored on local disk and are ephemeral on free-tier cloud hosts. Avatar uploads work but may reset after redeploys.
