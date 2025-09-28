# Docs

See `architecture.md` and `test-checklists.md` for T1 details.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start with automatic database setup
pnpm dev:auto
```

This will automatically check and fix your database, then start the development server.

**Demo Login:**

- Admin: `admin@demo.local` / `admin123`
- Intern: `intern@demo.local` / `intern123`

See [database-workflow.md](./database-workflow.md) for troubleshooting.

## Database Setup

### Prerequisites

1. **PostgreSQL (Dev)**: Local development uses PostgreSQL. A ready-to-use Docker setup is included.
   - Start DB: `docker compose up -d db`
   - Default credentials are defined in `docker-compose.yml`.

2. **Environment Variables**: Create a `.env` file in the project root with:

   ```bash
   # Database (local Postgres)
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anesthesia_tracker?schema=public"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/anesthesia_tracker?schema=public"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="replace-with-a-random-32char-string"

   # Auth Provider
   AUTH_PROVIDER="credentials"
   ```

   > Generate a strong secret (e.g., `openssl rand -base64 32`).
   >
   > For production (Vercel), set env vars in the Vercel project: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_PROVIDER`.

### Database Commands

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Create and apply migrations
- `pnpm db:seed` - Run seed script with demo data
- `pnpm db:reset` - Reset database and run seeds
- `pnpm db:studio` - Open Prisma Studio
- `pnpm peek` - Check database record counts

### Quick Start

- One-command setup and checks (recommended):
  - `pnpm doctor`
  - Or start and serve at the end: `pnpm doctor --serve`

- Manual alternative:
  1. Start Postgres: `docker compose up -d db`
  2. Generate Prisma client: `pnpm db:generate`
  3. Create database schema: `pnpm db:push`
  4. Seed database: `pnpm db:seed`
  5. Verify counts: `pnpm peek`
  6. Start dev server: `pnpm dev`

The seed script creates demo users, ICU/PACU rotations, procedures, requirements, and sample log entries with verifications.

## Auth (T6) & RBAC (T7)

The application uses NextAuth v4 with credentials-based authentication and JWT sessions, plus role-based access control.

### Demo Users

After running `pnpm db:seed`, you can sign in using these demo accounts:

- **Admin**: `admin@demo.local` / `admin123` (ADMIN role)
- **Tutor**: `tutor@demo.local` / `tutor123` (TUTOR role)
- **Intern**: `intern@demo.local` / `intern123` (INTERN role)

### Roles & Permissions

- **INTERN**: Can create procedure logs and view their own progress
- **TUTOR**: Can verify/reject intern logs; cannot change requirements
- **ADMIN**: Can manage rotations, procedures, requirements; cannot create logs

### Testing roles locally

- Use seeded emails:
  - intern@demo.local
  - tutor@demo.local
  - admin@demo.local
    (Attach these accounts via your chosen auth provider or create via Credentials if configured.)

### Authentication Features

- **Credentials Provider**: Email + password authentication
- **Password Hashing**: Uses bcryptjs for secure password storage
- **JWT Sessions**: Sessions are JWT-based (signed; not stored in DB). User role and ID are included.
- **Role-based Access**: User roles (ADMIN, TUTOR, INTERN) included in sessions
- **Protected Routes**: Middleware automatically redirects unauthenticated users to `/login` (and `/admin` is role-guarded)
- **API Protection**: API routes enforce role-based permissions

### Protected Routes

- `/dashboard` - Requires authentication
- `/admin` - Requires ADMIN role
- `/tutor` - Requires TUTOR role
- `/app/*` - Requires authentication

### API Endpoints

- `POST /api/logs` - INTERN only (create procedure logs)
- `POST /api/verifications` - TUTOR only (verify/reject logs)
- `POST /api/requirements` - ADMIN only (manage requirements)

### Session Management

- Sessions use JWT strategy (not the Prisma Session table)
- JWT includes user role and ID
- Middleware automatically redirects unauthenticated users to `/login`
- Logout clears the browser session; JWT no longer used
- Timezone: Asia/Jerusalem

### Manual Test Checklist

1. Run `pnpm dev`
2. Visit `/login` → enter seeded user credentials
3. Verify redirect to dashboard with role-specific content
4. Test role-based API access
5. Test middleware protection on /admin and /tutor routes
6. Refresh page → still logged in
7. Click logout → session cleared, redirect to login
8. Check Prisma DB shows hashed passwords (not plaintext)
