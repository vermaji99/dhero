
# LeadFlow Project Summary

## 1. Project Structure
```
leadflow/
├── server/                           # NestJS Backend
│   ├── src/
│   │   ├── app.module.ts             # Root App Module
│   │   ├── main.ts                   # Entry Point
│   │   ├── auth/                     # Auth Module
│   │   ├── users/                    # Users Module
│   │   ├── leads/                    # Leads Module
│   │   ├── notes/                    # Notes Module
│   │   ├── activities/               # Activities Module
│   │   ├── dashboard/                # Dashboard Module
│   │   ├── prisma/                   # Prisma Module
│   │   └── common/                   # Guards, Filters, etc.
│   ├── prisma/                       # Prisma Schema & Seeds
│   ├── test/                         # Test Files
│   ├── .env.example
│   ├── .gitignore
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
├── client/                           # React Frontend
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
├── TASK_B.md
├── FINAL_REVIEW.md
├── AI_USAGE.md
├── PROJECT_SUMMARY.md
└── .gitignore
```

## 2. How to Run Locally
### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB 6+), reachable via a `mongodb+srv://` or `mongodb://` connection string

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to your MongoDB Atlas SRV connection string
npx prisma generate
npx prisma db push                  # Sync schema to MongoDB (MongoDB uses db push, not migrate)
npx ts-node prisma/seed.ts          # Seed 2 demo users + 5 demo leads
npm run start:dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## 3. Environment Variables Required
### Backend (server/.env)
- `DATABASE_URL`: MongoDB connection string (MongoDB Atlas SRV `mongodb+srv://<user>:<pw>@<cluster>/<db>?retryWrites=true&w=majority&appName=<name>`). Do NOT wrap the value in surrounding double-quotes `"…"` when pasting into Vercel or any env var UI — Prisma P1012 will trigger if the value starts with `"`.
- `JWT_SECRET`: Secret for JWT signing (use a long random string; 32+ chars recommended)
- `JWT_EXPIRES_IN`: JWT expiry time (e.g., "7d")
- `CORS_ORIGIN`: A comma-separated list of allowed origins. Supports wildcard globs. Example: `https://dhero-client.vercel.app,http://localhost:5173,http://localhost:5174`
- `PORT`: Backend port (default 3000)
- `ADMIN_PASSWORD`: Demo admin password (used only by seed.ts)
- `MEMBER_PASSWORD`: Demo member password (used only by seed.ts)

### Frontend (client/.env)
- `VITE_API_URL`: Backend API URL (e.g., "http://localhost:3000/api" locally, "https://dhero-server-gamma.vercel.app/api" on Vercel)

## 4. Database Setup Commands
MongoDB on Prisma uses `prisma db push` instead of migrations (`prisma migrate` is for SQL databases).
```bash
cd server
npx prisma generate                 # Regenerate the Prisma client after schema changes
npx prisma db push                  # Sync Prisma schema to MongoDB (create collections + indexes)
npx prisma studio                   # Open Prisma Studio (browse/edit your MongoDB documents)
```

## 5. Seed Commands
```bash
cd server
npx ts-node prisma/seed.ts          # Seed demo users and leads (idempotent — safe to re-run)
```

## 6. Test Commands
### Backend
```bash
cd server
npm run test                        # Unit tests
npm run test:e2e                    # E2E tests
npm run test:cov                    # Test coverage
```

### Frontend
```bash
cd client
npm run test                        # Frontend tests (if implemented)
```

## 7. Production Build Commands
### Backend
```bash
cd server
npm run build                       # Compile NestJS to dist/ (production)
npm run start:prod                  # Run compiled backend
# For Vercel deployments: `vercel-build` runs prisma generate + prisma db push (best-effort) + nest build
npm run vercel-build
```

### Frontend
```bash
cd client
npm run build                       # Vite production build → dist/
npm run preview
```

## 8. Deployment Instructions
### Backend — Vercel Project (e.g. dhero-server-gamma)
1. In Vercel, import the repo as a **new project** and then set:
   - **Root Directory** → `server` (⚠️ must be exactly the string `server`; leaving it blank picks up the repo root and server/package.json/server/vercel.json/server/api functions won't be found)
   - **Framework Preset** → Other
   - **Build Command** → `npm run vercel-build` (already specified in vercel.json)
   - **Output Directory** → `.` (already specified in vercel.json)
2. **Environment Variables** in Vercel (Production + Preview):
   - `DATABASE_URL` — MongoDB Atlas SRV (`mongodb+srv://…`). Do NOT include any surrounding double-quotes. IMPORTANT: In Atlas → Network Access, add `0.0.0.0/0` to the IP whitelist so Vercel build + function IPs can reach MongoDB.
   - `JWT_SECRET` — strong random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CORS_ORIGIN` — e.g. `https://dhero-client.vercel.app,http://localhost:5173,http://localhost:5174`
3. Trigger a deploy with Build Cache OFF. After it goes green, visit `https://<server-domain>/` → you should see a JSON health response with `db.ok: true`.

### Frontend — Vercel Project (e.g. dhero-client)
1. **Root Directory** → `client`
2. **Environment Variable**:
   - `VITE_API_URL` → `https://<your-server-domain>/api` (e.g. `https://dhero-server-gamma.vercel.app/api`)
3. Trigger a deploy (build cache OFF, since Vite env vars are baked in at build time).
4. Visit `https://<client-domain>/login` — sign in with demo credentials below.

## 9. Demo Credentials
### Admin User
- Email: `admin.demo@example.com`
- Password: `demo-admin-123`

### Member User
- Email: `member.demo@example.com`
- Password: `demo-member-123`

## 10. List of Completed Requirements
- ✅ Public lead capture page (Contact form, no auth required)
- ✅ Authentication with JWT + localStorage + React Query
- ✅ Role-based authorization (Admin/Member) via JWT roles in protected routes
- ✅ Lead lifecycle and status management (NEW → CONTACTED → QUALIFIED → PROPOSAL → WON / LOST)
- ✅ Lead assignment (Admin assigns to members, or unassigns)
- ✅ Notes with author + timestamps, per-lead
- ✅ Per-lead and global activity timeline
- ✅ REST API with standard Nest HTTP codes + unified `{ success, data?, error?, meta? }` envelope
- ✅ Lead search, pagination, and status filter (Leads page)
- ✅ Prisma ORM **with MongoDB Atlas** (ObjectId @map("_id"), Mongo-specific indexes only)
- ✅ React + Vite + TS frontend, Tailwind UI, shadcn-style components, Zustand global auth, React Query cache
- ✅ Fully responsive UI (mobile breakpoints + sidebar nav)
- ✅ Environment variables properly managed — `.env.example` templates committed; `.env` itself gitignored; no secrets committed
- ✅ Vercel monorepo deploy pattern (two projects, `Root Directory` = `client` / `server`)
- ✅ Production-grade server vercel-build script: P1012 quote stripping, robust CORS parser, MongoDB-only, deterministic nest build (clears tsbuildinfo cache)

## 11. Remaining Limitations
- ⚠️ No email notifications (e.g. "lead assigned", "status changed")
- ⚠️ No file attachments for notes (could add upload to Supabase Storage / S3)
- ⚠️ No dark mode
- ⚠️ No Docker/container setup
- ⚠️ No Swagger/OpenAPI docs yet (NestJS Swagger would be a small add)
- ⚠️ No structured JSON logging (pino/winston)
- ⚠️ No rate limiting on the public `POST /api/leads/public` capture endpoint (easy to add with NestJS ThrottlerModule)

These limitations are documented as future improvements in README.md!

