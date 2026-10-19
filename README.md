# ConcertHub — Live Concert Booking Platform

Full-featured concert booking platform with interactive zone maps, real-time ticket holds, attendee passes, sales analytics, and dual **User** and **Admin** modes.

---

## 🚀 Live Demo & Quick Credentials

The app comes with **pre-seeded demo data** and **instant 1-click mode switching** in the header.

| Mode | Email | Password | Privileges |
|---|---|---|---|
| **User Mode** 👤 | `user@concerthub.com` | `user123` | Browse concerts, interact with zone maps, hold tickets, checkout, view/cancel personal booking passes |
| **Admin Mode** 🛡️ | `admin@concerthub.com` | `admin123` | Manage live event catalog (Add, Edit, Delete), view revenue metrics, monitor all attendee bookings |

> **Tip**: You can switch between **User Mode** and **Admin Mode** anytime directly from the top navigation pill!

---

## 🌐 Deployment Instructions

### 1. Frontend on Vercel
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. Framework Preset: **Vite** (Vercel automatically detects `package.json` and `vercel.json` at root).
5. (Optional) Set Environment Variable:
   - `VITE_API_BASE_URL`: URL of your Render backend (e.g., `https://concerthub-backend.onrender.com/api`).
   - If omitted, the frontend runs seamlessly with the built-in local persistence & fallback engine!
6. Click **Deploy**.

### 2. Backend on Render
1. Go to [Render Dashboard](https://render.com).
2. Click **"New +"** → **"Web Service"**.
3. Connect your repository.
4. Settings:
   - **Root Directory**: `demo`
   - **Environment**: `Docker` (uses `demo/Dockerfile`)
   - OR **Environment**: `Java` (Maven build: `./mvnw clean package`, start command: `java -jar target/*.jar`)
5. Add Environment Variables:
   - `PORT`: `8081` (or Render's assigned port)
   - `SPRING_DATASOURCE_URL`: JDBC connection string to your MySQL or PostgreSQL database
   - `SPRING_DATASOURCE_USERNAME`: database username
   - `SPRING_DATASOURCE_PASSWORD`: database password
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL and add it to your Vercel project as `VITE_API_BASE_URL`.

---

## 🛠️ Local Development

### Frontend
```bash
npm install
npm run dev
```
Runs at `http://localhost:3000`.

### Backend (Spring Boot)
```bash
cd demo
./mvnw spring-boot:run
```
Runs at `http://localhost:8081`.

---

## ✨ Features
- **Dual User & Admin Modes**: Instant mode switching with permission isolation.
- **Interactive Venue Zone Map**: Front Fan, Left Fan, Right Fan, Away Fan zones with real-time capacities.
- **Dynamic Hold Flow**: Reserve tickets for 10 minutes with quantity counter.
- **Instant E-Ticket Pass**: Gate barcode/QR code simulation, print/save ticket passes.
- **Admin Dashboard**: Revenue KPIs, ticket volume tracking, concert creation/editing, and attendee order management.
- **Offline / Graceful Fallback**: Works 100% standalone out-of-the-box and connects to Spring Boot backend seamlessly when configured.
