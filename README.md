# Anesthesia Internship Tracker

A comprehensive web application for tracking anesthesia internship progress, built with Next.js, TypeScript, and Prisma.

## 🚀 Features

- **User Management**: Role-based authentication (Interns, Tutors, Admins)
- **Progress Tracking**: Real-time progress monitoring with visual dashboards
- **Log Management**: Comprehensive logging system for procedures and activities
- **Verification System**: Multi-level verification workflow for log entries
- **File Management**: Secure file upload and organization system
- **Analytics**: Detailed analytics and reporting for administrators
- **Monitoring**: Built-in health checks and performance monitoring
- **Security**: Comprehensive security measures and best practices
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js
- **Caching**: Redis (optional)
- **Testing**: Vitest, Testing Library
- **Deployment**: Vercel, Docker, VPS
- **Monitoring**: Custom monitoring system

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL (for production)
- Redis (optional, for caching)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/anesthesia-internship-tracker.git
cd anesthesia-internship-tracker
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Seed database with sample data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm dev:setup          # Setup and start development
pnpm dev:auto           # Auto-setup development environment

# Building
pnpm build              # Build for production
pnpm build:production   # Production build with optimizations
pnpm start              # Start production server

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to database
pnpm db:migrate         # Run database migrations
pnpm db:seed            # Seed database with sample data
pnpm db:reset           # Reset database
pnpm db:studio          # Open Prisma Studio

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage
pnpm test:ui            # Run tests with UI

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix ESLint issues
pnpm format             # Format code with Prettier
pnpm typecheck          # Run TypeScript type checking

# Deployment
pnpm setup:dev          # Setup development environment
pnpm optimize:production # Optimize for production
pnpm validate:env       # Validate environment configuration
pnpm deploy:vercel      # Deploy to Vercel
pnpm deploy:staging     # Deploy to staging

# Docker
pnpm docker:build       # Build Docker image
pnpm docker:run         # Run Docker container
pnpm docker:compose     # Start with Docker Compose

# Monitoring
pnpm health:check       # Check application health
pnpm monitor:metrics    # View monitoring metrics
pnpm monitor:errors     # View error logs

# Security
pnpm security:audit     # Run security audit

# Database Management
pnpm backup:db          # Backup database
pnpm restore:db         # Restore database
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── intern/            # Intern pages
│   └── tutor/             # Tutor pages
├── components/            # React components
│   ├── ui/               # UI components
│   └── forms/            # Form components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   ├── monitoring/       # Monitoring utilities
│   ├── security/         # Security utilities
│   └── utils/            # General utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
├── tests/                # Test files
├── docs/                 # Documentation
└── docker/               # Docker configuration
```

## 🔐 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional Variables

```bash
# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="your-email@gmail.com"

# Encryption (for sensitive data)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

```bash
pnpm deploy:vercel
```

### Docker

```bash
# Build image
pnpm docker:build

# Run container
pnpm docker:run

# Or use Docker Compose
pnpm docker:compose
```

### Traditional VPS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Health Checks**: `/api/health`
- **Metrics**: `/api/monitoring/metrics`
- **Errors**: `/api/monitoring/errors`
- **Admin Dashboard**: `/admin/monitoring`

## 🔒 Security

- Security headers configured
- Rate limiting implemented
- Input validation with Zod
- Authentication with NextAuth.js
- Encryption for sensitive data
- CSRF protection
- XSS protection

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/your-username/anesthesia-internship-tracker/issues)
3. Create a [new issue](https://github.com/your-username/anesthesia-internship-tracker/issues/new)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with hospital systems
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Real-time notifications
- [ ] Offline support

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Radix UI for accessible components
- Tailwind CSS for utility-first styling
- All contributors and users

---

**Made with ❤️ for medical education**
