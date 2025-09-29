# Deployment Guide

This guide covers various deployment options for the Anesthesia Internship Tracker application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker](#docker)
  - [Traditional VPS](#traditional-vps)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Redis (optional, for caching)
- SSL certificate (for production)

## Environment Setup

### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Optional: Redis for caching
REDIS_URL="redis://host:port"

# Optional: Email configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="your-email@gmail.com"

# Optional: Encryption key (32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Optional: Upstash Redis for rate limiting
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## Deployment Options

### Vercel (Recommended)

Vercel provides the easiest deployment option with built-in optimizations.

#### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard

#### 2. Configure Build Settings

The `vercel.json` file is already configured with:
- Security headers
- Caching rules
- Redirects
- Function timeouts

#### 3. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 4. Database Setup

For Vercel, use a managed PostgreSQL service:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [PlanetScale](https://planetscale.com)

### Docker

#### 1. Build Image

```bash
# Build the Docker image
docker build -t anesthesia-tracker .

# Run with Docker Compose
docker-compose up -d
```

#### 2. Production Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/anesthesia_tracker
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=https://yourdomain.com
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=anesthesia_tracker
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy to Cloud

**AWS ECS:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag anesthesia-tracker:latest your-account.dkr.ecr.us-east-1.amazonaws.com/anesthesia-tracker:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/anesthesia-tracker:latest
```

**Google Cloud Run:**
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/your-project/anesthesia-tracker
gcloud run deploy --image gcr.io/your-project/anesthesia-tracker --platform managed
```

### Traditional VPS

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
npm install -g pm2
```

#### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/your-username/anesthesia-tracker.git
cd anesthesia-tracker

# Install dependencies
pnpm install

# Build application
pnpm build

# Setup database
pnpm db:push
pnpm db:seed
```

#### 3. Nginx Configuration

Copy the provided `nginx.conf` to `/etc/nginx/sites-available/anesthesia-tracker`:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/anesthesia-tracker
sudo ln -s /etc/nginx/sites-available/anesthesia-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

#### 5. Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'anesthesia-tracker',
    script: 'pnpm',
    args: 'start',
    cwd: '/path/to/anesthesia-tracker',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Production Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Post-deployment

- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Monitoring alerts configured
- [ ] Performance metrics collected

## Monitoring

### Health Checks

The application provides several monitoring endpoints:

- `GET /api/health` - Overall health status
- `GET /api/monitoring/metrics` - Performance metrics
- `GET /api/monitoring/errors` - Error logs

### Monitoring Dashboard

Access the monitoring dashboard at `/admin/monitoring` (admin users only).

### External Monitoring

Consider integrating with:
- [UptimeRobot](https://uptimerobot.com) - Uptime monitoring
- [Sentry](https://sentry.io) - Error tracking
- [DataDog](https://datadoghq.com) - Application monitoring
- [New Relic](https://newrelic.com) - Performance monitoring

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d anesthesia_tracker
```

**Application Won't Start:**
```bash
# Check logs
pm2 logs anesthesia-tracker

# Check environment variables
pm2 show anesthesia-tracker
```

**Nginx 502 Bad Gateway:**
```bash
# Check if application is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**SSL Certificate Issues:**
```bash
# Test SSL configuration
sudo nginx -t

# Renew certificate
sudo certbot renew --dry-run
```

### Performance Issues

**High Memory Usage:**
- Check for memory leaks in monitoring dashboard
- Consider increasing server memory
- Optimize database queries

**Slow Database Queries:**
- Enable query logging
- Add database indexes
- Consider connection pooling

**High CPU Usage:**
- Check for infinite loops
- Optimize image processing
- Enable caching

### Security Issues

**Rate Limiting:**
- Check Redis connection
- Verify rate limiting configuration
- Monitor blocked requests

**Authentication Issues:**
- Verify NEXTAUTH_SECRET
- Check session configuration
- Review OAuth provider settings

## Support

For deployment issues:

1. Check the monitoring dashboard
2. Review application logs
3. Verify environment configuration
4. Test health endpoints
5. Contact system administrator

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump -h localhost -U postgres anesthesia_tracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U postgres anesthesia_tracker < backup_file.sql
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# Restore uploads
tar -xzf uploads_backup_file.tar.gz
```

### Automated Backups

Set up cron jobs for automated backups:

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```
