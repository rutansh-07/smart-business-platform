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
*   Ready for instant 1-click deployment on platforms like Render.com or Railway.app.

✅ **Maintain GitHub repository and commits**
*   Clean Git commit history maintaining iterative feature implementations.

✅ **Write project documentation and README**
*   You are reading it! (Detailed technical debug logs can also be found in `internship_report.md`).

---

## 💻 Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios, Socket.io-client.
*   **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, Multer, JWT, Bcrypt.

## 🛠️ Quick Start (Unified Deployment)

1. **Install Dependencies & Build**
   ```bash
   npm run build
   ```
   *(This script will automatically install both backend and frontend dependencies and compile the Vite frontend into the static `dist` folder).*

2. **Set Environment Variables**
   Create a `.env` file in the root backend directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   NODE_ENV=production
   ```

3. **Start the Unified Server**
   ```bash
   npm start
   ```
   Your entire platform (frontend and backend APIs) is now running seamlessly on `http://localhost:5000`!
