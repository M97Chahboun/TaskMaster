# TaskMaster

A full-stack task management application built with React, TypeScript, Express, and PostgreSQL. Features a modern UI with drag-and-drop capabilities, time blocking, Kanban boards, and comprehensive task organization.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Express](https://img.shields.io/badge/Express-4.21.2-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)

## Screenshots

### Login
![Login](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### All Tasks
![All Tasks](screenshots/all_tasks.png)

### Kanban Board
![Kanban](screenshots/kanban.png)

### Daily Planner
![Daily Planner](screenshots/daily_planner.png)

### Categories
![Categories](screenshots/categories.png)

### Statistics
![Statistics](screenshots/statistics.png)

## Features

- **Dashboard** - Overview of your tasks and productivity
- **Task Management** - Create, edit, and organize tasks with priorities and categories
- **Kanban Board** - Visual task management with drag-and-drop functionality
- **Daily Planner** - Time blocking for scheduling tasks throughout your day
- **Categories** - Organize tasks by Work, Personal, Health, Education, and more
- **Statistics** - Track your productivity and completion rates
- **Authentication** - Secure user accounts with session management
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18.3** with TypeScript
- **Vite** for fast builds and HMR
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Wouter** for lightweight routing
- **@dnd-kit** for drag-and-drop functionality

### Backend
- **Express.js** REST API
- **Drizzle ORM** for type-safe database queries
- **PostgreSQL** database (Neon serverless)
- **Passport.js** for authentication
- **express-session** with PostgreSQL store

### Database
- **Drizzle Kit** for schema management and migrations
- **Neon** serverless PostgreSQL

## Project Structure

```
TaskMaster/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Main application component
│   └── index.html
├── server/                 # Backend Express server
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   └── storage.ts          # Session storage
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and Zod validators
├── migrations/             # Database migrations
└── drizzle.config.ts       # Drizzle configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Neon)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaskMaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/taskmaster
   SESSION_SECRET=your-session-secret-key
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   npm run generate
   
   # Push schema to database
   npm run db:push
   
   # Run migrations
   npm run migrate
   ```

5. **Seed the database with test data (optional)**
   ```bash
   # Create dummy users, tasks, and time blocks
   npm run seed
   ```
   
   This creates:
   - 5 test users with realistic names
   - 10 tasks per user (50 total) with various priorities and categories
   - 8 time blocks per user (40 total) scheduled over the next 2 weeks
   
   **Default credentials for all test users:**
   - Password: `password123`
   - Usernames will be displayed after seeding (e.g., `james.smith123`)

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push schema changes to database |
| `npm run generate` | Generate Drizzle migrations |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with dummy test data |

## Database Schema

### Users
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `name` - Display name
- `email` - Email address

### Tasks
- `id` - Primary key
- `userId` - Foreign key to users
- `title` - Task title
- `description` - Task description
- `dueDate` - Due date timestamp
- `priority` - low, medium, high
- `category` - work, personal, health, education, other
- `completed` - Completion status
- `inProgress` - In-progress status
- `createdAt` - Creation timestamp

### Time Blocks
- `id` - Primary key
- `userId` - Foreign key to users
- `taskId` - Optional foreign key to tasks
- `date` - Scheduled date
- `startTime` - Start time (HH:MM format)
- `duration` - Duration in minutes
- `title` - Block title
- `description` - Block description

## Configuration

### Tailwind CSS
Customize styling in `tailwind.config.ts`

### Theme
Modify the application theme in `theme.json`:
```json
{
  "variant": "professional",
  "primary": "hsl(210, 64%, 50%)",
  "appearance": "system",
  "radius": 0.5
}
```

### TypeScript
Path aliases configured in `tsconfig.json`:
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

## Deployment

### Vercel
This project is configured for Vercel deployment. The `vercel.json` file contains the necessary configuration.

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   DATABASE_URL=your-production-database-url
   SESSION_SECRET=your-production-secret
   NODE_ENV=production
   ```

3. **Start the server**
   ```bash
   npm run start
   ```

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ES modules (`"type": "module"`)
- Path aliases for imports

### Component Structure
- Use Shadcn/ui components from `@/components/ui`
- Custom components in `@/components`
- Pages in `@/pages`

### API Routes
- RESTful endpoints in `server/routes.ts`
- Authentication middleware in `server/auth.ts`

## License

MIT

## Acknowledgments

- Built with [Replit](https://replit.com) tooling
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
