# Deployment Guide

Complete instructions for deploying the Rooftop Nursery Admin Panel to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API endpoints updated
- [ ] ImageKit credentials added
- [ ] Database migrations completed
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Performance testing completed

## Environment Variables Setup

### Required Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.rooftop-nursery.com

# ImageKit (Optional but Recommended)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
IMAGEKIT_PRIVATE_KEY=your_private_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the native platform for Next.js and provides the best performance.

**Steps:**
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Click "Deploy"

**Benefits:**
- Automatic deployments on push
- Edge functions support
- Built-in CDN
- Free SSL/TLS
- Automatic scaling

### Option 2: Self-Hosted (Node.js)

Deploy to your own server using Node.js.

**Prerequisites:**
- Node.js 18+
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate

**Steps:**

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Install production dependencies:**
   ```bash
   npm install --production
   ```

3. **Create ecosystem.config.js:**
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'rooftop-admin',
         script: './node_modules/.bin/next',
         args: 'start',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         }
       }
     ]
   }
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx:**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name admin.rooftop-nursery.com;

     ssl_certificate /etc/ssl/certs/cert.pem;
     ssl_certificate_key /etc/ssl/private/key.pem;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

### Option 3: Docker

Deploy using Docker containers.

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.9'
services:
  admin:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NODE_ENV=production
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 4: AWS

Deploy on AWS using EC2 or ECS.

**EC2 Steps:**
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js and npm
3. Clone repository
4. Configure environment variables
5. Build and run application
6. Set up CloudFront CDN
7. Configure Route 53 DNS

**ECS Steps:**
1. Create ECR repository
2. Build and push Docker image
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer
6. Set up CloudFront CDN

### Option 5: Other Platforms

- **Google Cloud Run** - Serverless container platform
- **Azure App Service** - Microsoft cloud platform
- **DigitalOcean** - Simple cloud hosting
- **Railway.app** - Modern deployment platform
- **Render** - Cloud application platform

## Production Optimization

### 1. Enable Compression
```javascript
// next.config.mjs
export default {
  compress: true,
}
```

### 2. Image Optimization
```typescript
// Automatic with Next.js Image component
import Image from 'next/image'

<Image
  src="/image.png"
  alt="Description"
  width={400}
  height={300}
  priority={true}
/>
```

### 3. Code Splitting
Already enabled by default in Next.js App Router.

### 4. Caching Strategy

```typescript
// Cache static content for 1 year
export const revalidate = 31536000

// Revalidate API data every hour
export const revalidate = 3600
```

### 5. Database Connection Pooling

Configure connection pooling in your database:
- PostgreSQL: `pgBouncer`
- MySQL: `ProxySQL`
- MongoDB: Connection pools

## Security Configuration

### 1. Security Headers

Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ]
}
```

### 2. HTTPS/SSL
- Use Let's Encrypt for free certificates
- Enable HSTS headers
- Configure automatic renewal

### 3. API Rate Limiting

```typescript
// Implement rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // requests per windowMs
})

app.use('/api/', limiter)
```

### 4. CORS Configuration

```typescript
// Backend CORS settings
const cors = require('cors')

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}))
```

## Monitoring & Logging

### 1. Application Monitoring

**Sentry Integration:**
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 2. Error Tracking

```typescript
// Log errors to your service
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error)
  // Send to error tracking service
}
```

### 3. Performance Monitoring

Use Vercel Analytics or similar tools to monitor:
- Core Web Vitals
- Page load times
- API response times
- Error rates

## Database Backups

**Automated Backups:**
- PostgreSQL: `pg_dump` with cron
- MongoDB: `mongodump` with cron
- Cloud databases: Built-in backup features

**Backup Strategy:**
```bash
# Daily full backup at 2 AM
0 2 * * * /usr/local/bin/backup.sh

# Weekly backup to cloud storage
0 3 * * 0 /usr/local/bin/backup-cloud.sh
```

## Scaling Strategy

### Horizontal Scaling
- Add multiple application instances behind a load balancer
- Use sticky sessions for authentication
- Cache sessions in Redis

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Use CDN for static content

## CI/CD Pipeline

**GitHub Actions Example:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      - run: npm run test
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Test login functionality
- [ ] Verify API connectivity
- [ ] Check image uploads
- [ ] Test PDF generation
- [ ] Verify email notifications (if configured)
- [ ] Check analytics tracking
- [ ] Test on mobile devices

### 2. Monitor Logs

```bash
# View application logs
pm2 logs rooftop-admin

# View system logs
tail -f /var/log/syslog | grep rooftop
```

### 3. Set Up Alerts

- Alert on high error rates
- Alert on API timeout
- Alert on low disk space
- Alert on memory usage

## Rollback Plan

In case of critical issues:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy from backup version:**
   ```bash
   vercel --prod --scope=your-team
   ```

3. **Database rollback:**
   - Restore from latest backup
   - Communicate downtime to users
   - Document incident

## Performance Targets

- **Lighthouse Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **API Response Time:** < 500ms
- **Database Query Time:** < 200ms

## Support & Troubleshooting

**Common Issues:**

1. **Memory leak**
   - Restart application
   - Review error logs
   - Profile with Node.js debugger

2. **Slow database queries**
   - Add indexes
   - Optimize queries
   - Consider database upgrade

3. **High CPU usage**
   - Implement caching
   - Add more instances
   - Optimize algorithms

## Documentation

- [Main README](../README.md)
- [API Integration Guide](./API_INTEGRATION.md)
- [Development Guide](./DEVELOPMENT.md)

## Support

For deployment issues or questions:
1. Check logs: `pm2 logs` or Vercel dashboard
2. Review environment variables
3. Test API connectivity
4. Contact your hosting provider support
