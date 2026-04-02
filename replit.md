# TaskMaster - Project Overview

## About
TaskMaster is a full-stack task management and productivity application. It helps users organize daily activities with a dashboard, Kanban board, and daily planner with time-blocking.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter, Framer Motion, @dnd-kit
- **Backend**: Express.js, Passport.js (session auth), Drizzle ORM
- **Database**: PostgreSQL (via `pg` driver and `DATABASE_URL` env var)
- **Auth**: Local strategy with scrypt password hashing, express-session with MemoryStore

## Project Structure
- `client/` - React frontend (Vite)
- `server/` - Express backend
  - `index.ts` - Server entry point
  - `routes.ts` - API route handlers
  - `auth.ts` - Passport authentication setup
  - `storage.ts` - Database access layer (PostgresStorage)
  - `db.ts` - Drizzle ORM + pg Pool setup
  - `migrate.ts` - Run DB migrations script
- `shared/` - Shared TypeScript types and Drizzle schema
- `migrations/` - SQL migration files

## Database Setup
Run migrations with:
```
npm run migrate
```
The schema includes three tables: `users`, `tasks`, `time_blocks`.

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Secret for express-session (falls back to dev default if not set)

## Running the App
- Development: `npm run dev` (serves on port 5000)
- Build: `npm run build`
- Production: `node dist/index.js`

## Key Features
1. **Dashboard** - Productivity charts, task stats, backlog overview
2. **Task Management** - Full CRUD with priority and category support
3. **Kanban Board** - Drag-and-drop task status management
4. **Daily Planner** - Time-blocking with task linking
5. **Statistics** - Completion rates and productivity trends
6. **Authentication** - Register/login with secure session management

## Deployment
Configured for Replit autoscale deployment. Build outputs to `dist/index.js`.
