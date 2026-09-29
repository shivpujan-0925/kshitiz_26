# 🌌 KSHITIZ '26 — System Architecture & Production Operations Runbook

> **Confidential & Proprietary** — Internal Engineering & Operations Documentation  
> **Event**: Annual Fresher Conclave, Gaya College of Engineering (GCE Gaya)  
> **Host Committee**: Organizing Committee — Batch 2024–2028 (2nd Year)  
> **Target Audience**: Incoming Freshers — Batch 2025–2029 (1st Year)  
> **Release Target**: Production Ready (Tier-1 College Conclave Scale)

---

## 📑 Table of Contents
1. [Executive Product Overview](#1-executive-product-overview)
2. [Architecture & System Topography](#2-architecture--system-topography)
3. [Security & Threat Mitigation Matrix](#3-security--threat-mitigation-matrix)
4. [Core Subsystems & Operational Flows](#4-core-subsystems--operational-flows)
   - [4.1 Participant Onboarding & Pass Subsystem](#41-participant-onboarding--pass-subsystem)
   - [4.2 Live Hype Wall & Batch Moderation Subsystem](#42-live-hype-wall--batch-moderation-subsystem)
   - [4.3 Dynamic Stage Schedule & Event Timeline](#43-dynamic-stage-schedule--event-timeline)
   - [4.4 Royalty Polling & Hall of Fame Engine](#44-royalty-polling--hall-of-fame-engine)
   - [4.5 Cyber-Cockpit Admin Management Portal](#45-cyber-cockpit-admin-management-portal)
5. [Production Deployment Playbooks](#5-production-deployment-playbooks)
   - [5.1 Unified Fullstack Deployment (Recommended)](#51-unified-fullstack-deployment-recommended)
   - [5.2 Decoupled Cloud Deployment (Vercel + Render)](#52-decoupled-cloud-deployment-vercel--render)
   - [5.3 Enterprise Linux VPS (Nginx + PM2 + SSL)](#53-enterprise-linux-vps-nginx--pm2--ssl)
6. [Environment Configuration & Secrets](#6-environment-configuration--secrets)
7. [API Contract & Schema Specification](#7-api-contract--schema-specification)
8. [Maintenance, Disaster Recovery & Runbooks](#8-maintenance-disaster-recovery--runbooks)

---

## 1. Executive Product Overview

**KSHITIZ '26** is the official web application and event operations system powering the flagship induction conclave for the Gaya College of Engineering. 

Designed for high-throughput concurrency during peak campus registration and live stage events, the platform provides:
- Instant digital holographic pass generation with scannable roll-coded identifiers.
- Real-time batch cheering, shoutouts, and confessions with instant admin moderation.
- Dynamic timeline dispatching for on-stage slots, DJ sets, and dinner sessions.
- Role-based participant registries with role filtering (`Participant / Performer`, `Volunteer / Coordinator`, `General Attendee`).
- Granular administration controls with zero exposed credentials, timing-safe authentication, and exportable attendance sheets.

---

## 2. Architecture & System Topography

The system uses a decoupled, high-performance architecture optimized for both zero-latency local execution and distributed cloud deployment:

```
[ Client Browser / Mobile Web ]
            │
            ▼ (HTTPS / WSS)
   ┌─────────────────┐
   │  Nginx / CDN    │  (Static Caching, SSL Termination, Compression)
   └────────┬────────┘
            │
            ├──────────────────────────┐
            ▼ (SPA Assets)             ▼ (/api/* Proxied)
   ┌─────────────────┐        ┌──────────────────────────────────┐
   │  Client Bundle  │        │       Express 4.x Application    │
   │  (React 18/Vite)│        │   - Helmet Security Suite        │
   │  Tailwind Glass │        │   - Multi-tier Rate Limiters     │
   │  Lucide / Canvas│        │   - Timing-Safe Auth Guard       │
   └─────────────────┘        │   - ReDoS / XSS Sanitizers       │
                              └──────────────┬───────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             ┌───────────────────┐                       ┌───────────────────┐
             │   MongoDB Atlas   │                       │ Cloudinary / Disk │
             │ (Mongoose Models) │                       │  (Media Storage)  │
             └───────────────────┘                       └───────────────────┘
                       │ (Automatic Fallback)
                       ▼
             ┌───────────────────┐
             │ Resilient Memory  │
             │     Datastore     │
             └───────────────────┘
```

### Component Breakdown
- **Frontend Layer**: React 18 + Vite SPA styled with a bespoke glassmorphism theme, dynamic micro-interactions, responsive mobile-first navigation dock, and zero-dependency canvas confetti.
- **Backend API Layer**: Node.js + Express REST service implementing defense-in-depth security, strict input sanitization, and structured API error responses.
- **Storage Subsystem**: Dual-mode data persistence — runs seamlessly with MongoDB Atlas and provides automatic, graceful in-memory datastore fallback to guarantee 100% uptime even during database outages.
- **Asset Processing**: Multer file pipeline with MIME-type whitelist verification, disk quota enforcement, and optional Cloudinary CDN asset synchronization.

---

## 3. Security & Threat Mitigation Matrix

The codebase is hardened against standard web vulnerabilities (OWASP Top 10):

| Threat Vector | Mitigation Strategy | Implementation Details |
|---|---|---|
| **Brute-Force Attacks** | Strict tiered rate limiting | Admin login: max 5 attempts / 15 min per IP (`security.js`). Write actions: max 25 / 10 min. Global API: max 300 / 15 min. |
| **Side-Channel Timing Attacks** | Constant-time string evaluation | `safeCompare()` utilizes `crypto.timingSafeEqual` over fixed-length buffer copies for administrative password verification. |
| **Cross-Site Scripting (XSS)** | Deep payload sanitization & CSP | `sanitizeText()` strips `<script>`, `<iframe>`, and `javascript:` pseudo-protocols. Helmet enforces a strict `Content-Security-Policy`. |
| **MIME / File Upload Exploits** | Strict whitelist + size bounds | `imageFileFilter` restricts uploads to `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. SVGs are rejected to block SVG-embedded scripts. Max payload: 10MB. |
| **Regex Denial of Service (ReDoS)** | Dynamic query sanitization | `escapeRegex()` sanitizes roll number query strings before creating dynamic regular expressions. |
| **Clickjacking & Fingerprinting** | HTTP security headers | `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-Powered-By` disabled. |
| **Credential Exposure** | Zero hardcoded client secrets | Removed all demo auto-fill badges and sample passwords from UI modals and client bundles. |

---

## 4. Core Subsystems & Operational Flows

### 4.1 Participant Onboarding & Pass Subsystem
1. **Intake Flow**: Freshers and attendees submit their full name, roll number, academic branch, role, acts, and WhatsApp number.
2. **Duplicate Prevention**: Both roll numbers and telephone patterns undergo regex format verification and uniqueness checks against the registry.
3. **Digital Pass Creation**: On submission, a responsive, holographic event pass card is rendered featuring a unique QR code, role badges, and quick-download capabilities for entry checkpoint verification.

### 4.2 Live Hype Wall & Batch Moderation Subsystem
1. **Cheer Broadcasting**: Participants broadcast public cheers, batch banter, or performance shouts categorized by branch and batch.
2. **Interactive Upvoting**: Attendees vote on live cheers with IP-rate-limited hearts.
3. **Dual-Channel Admin Deletion**:
   - **Inline Moderation**: Authenticated committee admins browsing the live Hype Wall see a red delete button on every shoutout card to delete spam immediately.
   - **Central Moderation Hub**: The Admin Cockpit features a dedicated **"Live Shoutouts"** moderation tab with full-text search, heart metrics, and custom confirmation dialogs.

### 4.3 Dynamic Stage Schedule & Event Timeline
- Real-time schedule dispatcher tracks agenda checkpoints (arrivals, lighting ceremony, solo vocals, ramp walks, DJ arenas, dinner banquet).
- Committee leads can dynamically reorder slots, adjust timestamps, update stage venues, and toggle priority highlights.

### 4.4 Royalty Polling & Hall of Fame Engine
- Tracks votes and audience cheer volume for Mr. & Miss Fresher titleholders.
- Supports photo uploads and direct cloud URLs with live banner synchronization.

### 4.5 Cyber-Cockpit Admin Management Portal
- Protected behind JWT authentication with 24-hour expiration.
- Participant directory featuring search, branch filtering, role filtering (`Participant`, `Volunteer`, `Attendee`), and one-click CSV report export.
- Full CRUD interfaces for schedule items, announcements, posters, photo gallery, master drive vaults, and social links.

---

## 5. Production Deployment Playbooks

### 5.1 Unified Fullstack Deployment (Recommended)
*Ideal for Render, Railway, DigitalOcean App Platform, Fly.io, or AWS App Runner.*

In this mode, the Express server serves both the REST API endpoints (`/api/*`) and the compiled React production bundle (`client/dist`), with SPA fallback routing.

```bash
# 1. Clone repository to host
git clone <repository_url>
cd ASTRA_26

# 2. Configure production server environment
cp server/.env.example server/.env
# Edit server/.env with production credentials (JWT_SECRET, ADMIN_PASSWORD, etc.)

# 3. Install all dependencies across client and server
npm run install:all

# 4. Build optimized frontend production bundle
npm run build

# 5. Start production process
npm start
```

**Platform Setup (Render / Railway)**:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `.` (Repository root)

---

### 5.2 Decoupled Cloud Deployment (Vercel + Render)
*Ideal for teams leveraging edge CDN networks for the static frontend and dedicated microVMs for the API.*

#### Backend Deployment (Render / Railway):
1. Create a Web Service pointing to `server/`.
2. Set Build Command: `npm install`.
3. Set Start Command: `npm start`.
4. Configure environment variables (`MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL=https://your-frontend.vercel.app`).

#### Frontend Deployment (Vercel):
1. Create a Project pointing to `client/`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com`

---

### 5.3 Enterprise Linux VPS (Nginx + PM2 + SSL)
*For on-premise college servers, Ubuntu LTS, or AWS EC2 instances.*

#### 1. PM2 Process Manager Configuration:
```bash
# Install PM2 globally
npm install -g pm2

# Build the client
npm run build

# Start server as a resilient daemon
pm2 start server/server.js --name "kshitiz-2026-api" --instances max --exec-mode cluster

# Save PM2 state across system reboots
pm2 save
pm2 startup
```

#### 2. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/kshitiz`):
```nginx
server {
    listen 80;
    server_name conclave.gcegaya.ac.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name conclave.gcegaya.ac.in;

    ssl_certificate /etc/letsencrypt/live/conclave.gcegaya.ac.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/conclave.gcegaya.ac.in/privkey.pem;

    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Environment Configuration & Secrets

### Backend (`server/.env`):
```ini
# Core Configuration
PORT=5000
NODE_ENV=production

# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/astra26?retryWrites=true&w=majority

# Administrative Authentication (Change in production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Set_A_Complex_Unique_Password_Here_2026!
JWT_SECRET=Set_A_High_Entropy_Cryptographic_JWT_Key_2026!

# Network & CORS Security
FRONTEND_URL=https://conclave.gcegaya.ac.in
ALLOWED_ORIGINS=https://conclave.gcegaya.ac.in,https://gcegaya.ac.in

# Cloudinary CDN Integration (Optional - Falls back to local storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`client/.env`):
```ini
# Blank in unified single-server mode; remote backend URL in decoupled mode
VITE_API_URL=
```

---

## 7. API Contract & Schema Specification

### Public Endpoints:
- `GET  /api/health` — Service heartbeat, database connectivity, and timestamp.
- `GET  /api/settings` — Public event configurations, theme metadata, social links.
- `GET  /api/schedule` — Chronological timeline of stage slots and checkpoint events.
- `GET  /api/posters` — Active reveal posters.
- `GET  /api/gallery` — Curated party glimpses and high-res event photography.
- `GET  /api/announcements` — Official organizing committee broadcasts.
- `GET  /api/hype-cheers` — Live shoutouts and cheer feed.
- `POST /api/register` (or `/api/participants/register`) — Register new fresher with role allocation.
- `GET  /api/participants/lookup/:regNo` — Retrieve verified pass by registration number.
- `POST /api/hype-cheers` — Post sanitized shoutout to the public feed.
- `POST /api/hype-cheers/:id/like` — Vote for a shoutout.
- `POST /api/royalty/cheer` — Cast vote for Mr. / Miss Fresher.

### Protected Admin Endpoints (Require `Authorization: Bearer <token>`):
- `POST   /api/admin/login` — Authenticate committee admin.
- `GET    /api/admin/dashboard` — Analytical statistics, registration totals, branch and role breakdowns.
- `GET    /api/admin/participants` — Full attendee directory with role and branch filters.
- `DELETE /api/admin/participants/:id` — Delete participant record.
- `DELETE /api/admin/hype-cheers/:id` — Delete shoutout from live Hype Wall.
- `POST   /api/admin/announcements` — Broadcast new announcement.
- `DELETE /api/admin/announcements/:id` — Delete announcement.
- `POST   /api/admin/schedule` — Create stage timeline slot.
- `PUT    /api/admin/schedule/:id` — Update timeline slot details.
- `DELETE /api/admin/schedule/:id` — Remove timeline slot.
- `POST   /api/admin/posters` — Upload event poster (multipart image or direct URL).
- `DELETE /api/admin/posters/:id` — Delete event poster.
- `POST   /api/admin/gallery` — Upload photo to event glimpses.
- `DELETE /api/admin/gallery/:id` — Delete gallery photo.
- `POST   /api/admin/awards` — Update Mr. & Miss Fresher titles, pictures, and declarations.
- `POST   /api/admin/settings` — Update master drive vaults, Instagram links, and venue parameters.

---

## 8. Maintenance, Disaster Recovery & Runbooks

### 8.1 Rotating Admin Credentials
To immediately rotate the administrative master key without downtime:
1. Update `ADMIN_PASSWORD` and `JWT_SECRET` in `server/.env`.
2. Reload the process:
   ```bash
   pm2 restart kshitiz-2026-api --update-env
   ```
3. All existing administrative JWT tokens are immediately invalidated.

### 8.2 Database Outage Recovery
The system features an automated in-memory persistence layer. If MongoDB Atlas disconnects or reaches connection pool limits:
- The backend continues serving cached and runtime data without crashing.
- Once connectivity is restored, incoming requests automatically resume routing to MongoDB Atlas.

### 8.3 System Verification Suite
Run the internal product integration test suite before any production promotion:
```bash
node scratch/full-system-test.js
```
Expected output:
```
========================================================
TOTAL TESTS: 25 | PASSED: 25 | FAILED: 0
========================================================
```

---

**Maintained by the Gaya College of Engineering Organizing Committee — Batch 2024–2028.**
