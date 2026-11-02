# Crew Forge AI — AI-Powered Crew Assembly Platform

> **Crew Forge AI** is an intelligent, full-stack event staffing and crew assembly platform designed for event organizers, festival directors, and production managers to seamlessly source, assemble, and manage freelance event crews with explainable AI match recommendations and 1-click standby contingency redundancy.

---

## 🎨 Visual Design Specifications

* **Design Palette**:
  * Navy Primary: `#101D4B` (Navigation Sidebar & Dark Containers)
  * Electric Purple: `#563CF0` (Action Buttons, Active State Indicators, Badges)
  * Light Lavender: `#F2F5FD` (Page Canvas Background)
  * White Surface: `#FFFFFF` (Elevated Cards, Tables, and Forms)
  * Success Emerald: `#10B981` (Online Badges & Verified Match Indicators)
* **Desktop-First Layout**: 1536 × 1024 px reference canvas with fixed 294px sidebar and 74px top navigation.

---

## 🚀 Key Features

1. **Role-Based Authentication & Profiles**:
   * Multi-role support: **Organizer**, **Freelancer**, and **Admin**.
   * Secure bcrypt password hashing and persistent JWT session storage.
   * Dynamic profile completion calculation (0% to 100%) with actionable improvement tips.
2. **Event Production Management**:
   * Full event lifecycle: `Draft`, `Published`, `In Progress`, `Completed`, `Cancelled`.
   * Role requirements, budget allocation, schedule timing, and venue location tracking.
3. **5-Factor Explainable AI Crew Matching Engine**:
   * Evaluates candidates across 5 configurable dimensions:
     * Skills Match (30%)
     * Date Availability & Blacklist Filtering (25%)
     * Historical Reliability & Performance Score (20%)
     * Fee vs Budget Suitability (15%)
     * Geographic / City Proximity (10%)
   * Detects schedule conflicts and double-booking automatically.
4. **Standby Contingency & 1-Click Backup Shield**:
   * 100% redundancy pairing for high-risk and critical event roles (Sound Engineers, Photographers, Anchors, Security).
   * 1-click standby backup replacement with instant notification dispatch.
5. **Real-Time Operational Dashboard**:
   * Aggregated MongoDB production statistics, upcoming productions, and active crew call sheets.
   * Resilient local cache fallback when offline, with live reconnection detection.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS, Lucide Icons.
* **Backend**: Node.js, Express 4, Mongoose 8.
* **Database**: MongoDB Atlas (Cloud Replica Set).
* **Security**: JWT authentication, bcryptjs password hashing, strict CORS policies, and sanitized logging.
* **Hosting**:
  * **Frontend**: Vercel (Production SPA with rewrite rules)
  * **Backend**: Render (Web Service Container with health check monitoring)
  * **Database**: MongoDB Atlas (AWS us-east-1 Cluster)

---

## 📂 Repository & Git Workflow

This project is configured with a two-remote upstream fork model:

| Remote Name | Repository URL | Purpose |
| :--- | :--- | :--- |
| **`origin`** | `https://github.com/Sakshi-Pathare/CrewforgeAI.git` | Original shared repository (upstream source). |
| **`myfork`** | `https://github.com/VarsharaniPatil0922/CrewforgeAI.git` | Personal GitHub fork for ongoing development. |

### Daily Git Commands:

```powershell
# Check current remotes
git remote -v

# Push your changes to your personal fork
git push myfork main

# Fetch latest updates from the shared repository
git fetch origin

# Merge changes from origin/main into your local main
git merge origin/main

# Push updated changes to your personal fork
git push myfork main
```

---

## ⚙️ Environment Variables

### Frontend (`.env` for local development or Vercel Environment Variables):
```env
VITE_API_BASE_URL=https://crewforgeai.onrender.com/api
```

### Backend (`server/.env` for local development or Render Environment Variables):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.5bg9uxe.mongodb.net/crewforge?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_min_32_characters
CLIENT_URL=https://your-frontend.vercel.app
```

---

## 🧪 Local Development & Testing

```powershell
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
npm install --prefix server

# 3. Run all 6 automated test suites (113 tests)
npm run server:test

# 4. Run TypeScript check and production build
npm run build

# 5. Start frontend development server
npm run dev

# 6. Start backend development server
npm run server
```

---

## 📄 License
MIT License
