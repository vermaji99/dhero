
# LeadFlow - Lead Management System

A modern, full-stack lead management application built with NestJS, React, and PostgreSQL. Features role-based access control, lead lifecycle tracking, notes, activity history, and a public contact form.

## Features

- **Public Lead Capture**: Public form for lead submissions
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Lead Lifecycle**: Track leads through NEW → CONTACTED → QUALIFIED → PROPOSAL → WON/LOST
- **Lead Assignment**: Assign leads to team members
- **Notes & Activity**: Keep track of notes and all lead activities
- **Dashboard**: Statistics and recent activity overview
- **Search & Filtering**: Find leads by status, source, assignment, or search
- **Pagination**: Navigate through large lead lists efficiently

## Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Zod/class-validator
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query + Zustand
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository
```bash
git clone <repo-url>
cd leadflow
```

### 2. Set up environment variables
#### Backend
```bash
cd server
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
ADMIN_PASSWORD="demo-admin-123"
MEMBER_PASSWORD="demo-member-123"
```

#### Frontend
```bash
cd ../client
cp .env.example .env
```

### 3. Set up database
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the application

#### Start backend:
```bash
cd server
npm run start:dev
```

#### Start frontend (in another terminal):
```bash
cd client
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Demo Credentials

Use these credentials to log in and test the application:

### Admin User
- Email: `admin.demo@example.com`
- Password: `demo-admin-123`

### Member User
- Email: `member.demo@example.com`
- Password: `demo-member-123`

## Permission Matrix

| Action | Admin | Member |
|--------|-------|--------|
| View all leads | ✅ | ❌ |
| View assigned leads | ✅ | ✅ |
| Create lead | ✅ | ✅ |
| Update lead | ✅ | ✅ (assigned only) |
| Delete lead | ✅ | ❌ |
| Assign lead | ✅ | ❌ |
| Change status | ✅ | ✅ (assigned only) |
| Add notes | ✅ | ✅ (accessible leads) |
| View dashboard | ✅ | ✅ (stats for accessible leads) |

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Public
- `POST /api/leads/public` - Create lead from public form

### Leads (requires auth)
- `GET /api/leads` - List leads (paginated, filtered, sorted)
  - Query params: `page`, `limit`, `search`, `status`, `source`, `assignedToId`, `sortBy`, `sortOrder`
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create lead
- `PATCH /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/status` - Update lead status
- `PATCH /api/leads/:id/assignment` - Assign lead (admin only)
- `DELETE /api/leads/:id` - Delete lead (admin only)

### Notes (requires auth)
- `GET /api/leads/:leadId/notes` - List notes for a lead
- `POST /api/leads/:leadId/notes` - Add note to a lead

### Activities (requires auth)
- `GET /api/activities` - List recent activity
- `GET /api/activities/leads/:leadId` - List lead-specific activity

### Dashboard (requires auth)
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users (requires auth and admin role)
- `GET /api/users` - List users

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }  // optional, for pagination
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

## Database Schema

### User
Stores application users (admins and members)

### Lead
Stores lead information with status and assignment

### Note
Stores notes attached to leads

### Activity
Immutable audit trail of all lead actions

## Testing

### Backend Tests
```bash
cd server
npm run test
```

### Frontend Tests
```bash
cd client
npm run test
```

## Deployment

### Backend
1. Set up a PostgreSQL database (e.g., Supabase, Neon, Railway)
2. Set environment variables
3. Run Prisma migrations: `npx prisma migrate deploy`
4. Deploy to a platform like Render, Railway, or Vercel

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar

## Project Structure

```
leadflow/
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── leads/         # Leads module
│   │   ├── notes/         # Notes module
│   │   ├── activities/    # Activities module
│   │   ├── dashboard/     # Dashboard module
│   │   ├── prisma/        # Prisma service
│   │   └── common/        # Guards, decorators, filters
│   └── prisma/
│       └── schema.prisma
└── client/                # React frontend
    └── src/
        ├── components/    # UI components
        ├── pages/         # Page components
        ├── services/      # API services
        ├── store/         # Zustand store
        └── types/         # TypeScript types
```

## Known Limitations

- File uploads not implemented yet
- Email notifications not implemented
- No dark mode

## Future Improvements

- [ ] Email notifications for lead assignments and status changes
- [ ] File uploads for lead documents
- [ ] Dark mode UI
- [ ] Export leads to CSV/Excel
- [ ] Advanced reporting and analytics
- [ ] Team collaboration features
- [ ] API webhooks

## License

MIT
