# Docs

See `architecture.md` and `test-checklists.md` for T1 details.

## Database Setup

### Prerequisites

1. **PostgreSQL Database**: The application uses PostgreSQL for both development and production
   - Install PostgreSQL 15+ on your system
   - Create a database: `createdb anesthesia_tracker_dev`
   - Ensure PostgreSQL is running on localhost:5432

2. **Environment Variables**: Create a `.env` file in the project root with:

   ```bash
   # Database - PostgreSQL for both development and production
   DATABASE_URL="postgresql://postgres:password@localhost:5432/anesthesia_tracker_dev"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/anesthesia_tracker_dev"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="replace-with-a-random-32char-string"

   # Auth Provider
   AUTH_PROVIDER="credentials"
   ```

   > Generate a strong secret (e.g., `openssl rand -base64 32`).
   >
   > **Important**: The NEXTAUTH_SECRET is required for secure session management.

### Database Commands

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Create and apply migrations
- `pnpm db:seed` - Run seed script with demo data
- `pnpm db:reset` - Reset database and run seeds
- `pnpm db:studio` - Open Prisma Studio
- `pnpm peek` - Check database record counts

### Quick Start

1. **Setup PostgreSQL**: Ensure PostgreSQL is running and create the database
2. **Install dependencies**: `pnpm install`
3. **Setup database**: `pnpm db:push`
4. **Seed database**: `pnpm db:seed`
5. **Verify setup**: `pnpm peek`
6. **Start development**: `pnpm dev`

The seed script creates demo users, ICU/PACU rotations, procedures, requirements, and sample log entries with verifications.

## Auth (T6) & RBAC (T7)

The application uses NextAuth v4 with database sessions and credentials-based authentication, plus role-based access control.

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
- **Database Sessions**: Sessions stored in SQLite database via PrismaAdapter
- **Role-based Access**: User roles (ADMIN, TUTOR, INTERN) included in sessions
- **Protected Routes**: Middleware automatically redirects unauthenticated users to `/login`
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

- Sessions are stored in the database (Session table)
- Sessions include user role and ID information
- Middleware automatically redirects unauthenticated users to `/login`
- Logout clears session from database
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
