# Deployment Guide

## Production Environment Setup

### Prerequisites
- Linux server (Ubuntu 22.04 recommended)
- Docker and Docker Compose installed
- Domain name with SSL certificates
- Minimum 4GB RAM, 2 CPU cores
- PostgreSQL backup strategy
- Monitoring solution (Prometheus/Grafana)

## Deployment Architecture

```mermaid
graph TB
    subgraph "Internet"
        USER[Users]
    end
    
    subgraph "Cloud Provider"
        LB[Load Balancer/Nginx]
        
        subgraph "Application Servers"
            AS1[Auth Service]
            AS2[Attendance Service]
            AS3[Realtime Service]
        end
        
        subgraph "Data Layer"
            PG[(PostgreSQL)]
            RD[(Redis)]
        end
        
        subgraph "Storage"
            S3[Object Storage]
        end
    end
    
    USER --> LB
    LB --> AS1
    LB --> AS2
    LB --> AS3
    AS1 --> PG
    AS1 --> RD
    AS2 --> PG
    AS2 --> RD
    AS3 --> RD
    AS2 --> S3
```

## Docker Deployment

### 1. Production Docker Compose
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - auth-service
      - attendance-service
      - realtime-service
    networks:
      - app-network

  auth-service:
    build: ./services/auth-service
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    restart: always
    networks:
      - app-network

  attendance-service:
    build: ./services/attendance-service
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    restart: always
    networks:
      - app-network

  realtime-service:
    build: ./services/realtime-service
    environment:
      NODE_ENV: production
      REDIS_URL: ${REDIS_URL}
    restart: always
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 2. Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream auth_service {
        server auth-service:3001;
    }

    upstream attendance_service {
        server attendance-service:3002;
    }

    upstream realtime_service {
        server realtime-service:3003;
    }

    server {
        listen 80;
        server_name api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location /api/auth {
            proxy_pass http://auth_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/attendance {
            proxy_pass http://attendance_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /socket.io {
            proxy_pass http://realtime_service;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

## Kubernetes Deployment

### 1. Deployment Manifests
```yaml
# auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: your-registry/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 2. Service Configuration
```yaml
# auth-service-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP
```

### 3. Ingress Configuration
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: api-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /api/auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 3001
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker images
        run: |
          docker build -t auth-service ./backend/services/auth-service
          docker build -t attendance-service ./backend/services/attendance-service
          docker build -t realtime-service ./backend/services/realtime-service
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push auth-service
          docker push attendance-service
          docker push realtime-service
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/attendance-tracker
            docker-compose pull
            docker-compose up -d
```

## Mobile App Deployment

### Android Deployment

1. **Build Release APK**
```bash
cd android
./gradlew assembleRelease
```

2. **Sign APK**
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  my-alias
```

3. **Optimize APK**
```bash
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk \
  app/build/outputs/apk/release/app-release.apk
```

### iOS Deployment

1. **Build Archive**
```bash
cd ios
xcodebuild -workspace AttendanceApp.xcworkspace \
  -scheme AttendanceApp \
  -configuration Release \
  -archivePath build/AttendanceApp.xcarchive \
  archive
```

2. **Export IPA**
```bash
xcodebuild -exportArchive \
  -archivePath build/AttendanceApp.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

## Environment Variables

### Production Environment
```env
# Production .env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://prod_user:prod_pass@db.yourdomain.com:5432/attendance_db
DB_SSL=true

# Redis
REDIS_URL=redis://prod_redis:6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Monitoring & Logging

### 1. Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
```

### 2. Health Checks
```javascript
// healthcheck.js
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
    }
  };
  res.status(200).json(health);
});
```

## Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers (Helmet) enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Error logging configured
- [ ] Access logs enabled

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL backup
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/postgres_$DATE.sql s3://your-bucket/backups/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Restore Process
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Restore from S3
aws s3 cp s3://your-bucket/backups/postgres_20250826.sql .
psql $DATABASE_URL < postgres_20250826.sql
```

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer for services
   - Implement Redis clustering
   - Database read replicas

2. **Vertical Scaling**
   - Monitor resource usage
   - Upgrade server specs as needed
   - Optimize database queries

3. **Caching Strategy**
   - Implement Redis caching
   - CDN for static assets
   - Database query caching

## Troubleshooting

### Common Issues

1. **Service won't start**
```bash
docker logs <container-name>
docker-compose down && docker-compose up -d
```

2. **Database connection issues**
```bash
# Check connectivity
psql $DATABASE_URL -c "SELECT 1"
# Check max connections
psql $DATABASE_URL -c "SHOW max_connections"
```

3. **High memory usage**
```bash
# Check memory
docker stats
# Restart service
docker-compose restart <service-name>
```

## Support

For deployment issues:
- Check logs: `docker logs <service-name>`
- Review monitoring dashboard
- Contact: devops@yourdomain.com