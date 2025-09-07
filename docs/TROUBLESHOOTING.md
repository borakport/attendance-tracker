# Troubleshooting Guide

Common issues and solutions for the GPS Attendance Tracking System.

## Setup Issues

### Hard Link Creation Failed

**Error:**
```
The system cannot find the file specified.
```

**Solutions:**
1. **Ensure main .env file exists:**
   ```bash
   ls backend/.env
   ```

2. **Use absolute paths (Windows):**
   ```bash
   cd backend\services\auth-service
   cmd /c "mklink /H .env C:\full\path\to\attendance-tracker\backend\.env"
   ```

3. **Run as Administrator (Windows):**
   - Right-click PowerShell → "Run as administrator"

4. **Alternative: Copy instead of hard link:**
   ```bash
   copy ..\..\..\.env .env
   ```

### Database Connection Failed

**Error:**
```
P1000: Authentication failed against database server
```

**Solutions:**
1. **Check PostgreSQL container:**
   ```bash
   cd backend
   docker-compose ps
   ```

2. **Restart PostgreSQL:**
   ```bash
   docker-compose restart postgres
   ```

3. **Check .env configuration:**
   ```bash
   cat backend/.env | grep DATABASE_URL
   ```

4. **Reset containers:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Port Already in Use

**Error:**
```
Port 5432 is already in use
```

**Solutions:**
1. **Stop local PostgreSQL service:**
   ```bash
   # Windows
   net stop postgresql
   
   # macOS
   brew services stop postgresql
   
   # Linux
   sudo systemctl stop postgresql
   ```

2. **Check what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :5432
   
   # macOS/Linux
   lsof -i :5432
   ```

### Prisma Client Not Generated

**Error:**
```
@prisma/client did not initialize yet
```

**Solutions:**
1. **Generate Prisma client:**
   ```bash
   cd backend\services\auth-service
   npx prisma generate
   
   cd ..\attendance-service
   npx prisma generate
   
   cd ..\..
   npx prisma generate
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npx prisma generate
   ```

## Development Issues

### Service Won't Start

**Error:**
```
Cannot find module 'dist/index.js'
```

**Solution:**
```bash
cd backend\services\auth-service
npm run build
npm start
```

### TypeScript Compilation Errors

**Solutions:**
1. **Update TypeScript:**
   ```bash
   npm install -D typescript@latest
   ```

2. **Clear build cache:**
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Check tsconfig.json:**
   ```bash
   npx tsc --showConfig
   ```

### Environment Variables Not Loading

**Solutions:**
1. **Verify .env file location:**
   ```bash
   ls backend/.env
   ls backend/services/auth-service/.env
   ```

2. **Check hard link integrity:**
   ```bash
   # All should have same size/timestamp
   ls -la backend/.env backend/services/*/.env
   ```

3. **Recreate hard links:**
   ```bash
   rm backend/services/*/.env
   # Recreate as shown in setup guide
   ```

## Docker Issues

### Container Won't Start

**Solutions:**
1. **Check Docker Desktop is running**

2. **View container logs:**
   ```bash
   docker logs backend-postgres-1
   ```

3. **Restart Docker Desktop**

4. **Clear Docker cache:**
   ```bash
   docker system prune -a
   ```

### Volume Mount Issues

**Solutions:**
1. **Reset volumes:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Check disk space:**
   ```bash
   df -h  # Linux/macOS
   dir C:\ # Windows
   ```

## API Issues

### Authentication Failed

**Error:**
```
401 Unauthorized
```

**Solutions:**
1. **Check token format:**
   ```http
   Authorization: Bearer <token>
   ```

2. **Verify token not expired:**
   ```bash
   # Decode JWT token to check expiry
   ```

3. **Use refresh token:**
   ```http
   POST /auth/refresh
   {
     "refreshToken": "your_refresh_token"
   }
   ```

### Rate Limit Exceeded

**Error:**
```
429 Too Many Requests
```

**Solutions:**
1. **Wait for rate limit reset (usually 1 minute)**

2. **Check rate limit headers in response**

3. **Use different IP or user account for testing**

### CORS Errors

**Error:**
```
Access to fetch blocked by CORS policy
```

**Solutions:**
1. **Check frontend URL is in CORS whitelist**

2. **For development, temporarily disable CORS:**
   ```javascript
   app.use(cors({ origin: '*' }));
   ```

## Database Issues

### Slow Queries

**Solutions:**
1. **Check database size:**
   ```sql
   SELECT pg_size_pretty(pg_database_size('gps_attendance_production'));
   ```

2. **Analyze query performance:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
   ```

3. **Check for missing indexes**

### Connection Pool Exhausted

**Solutions:**
1. **Restart services to reset connections**

2. **Check for connection leaks in code**

3. **Increase pool size in Prisma:**
   ```env
   DATABASE_URL="postgresql://...?connection_limit=20&pool_timeout=20"
   ```

## Mobile App Issues

### GPS Permission Denied

**Solutions:**
1. **Request permissions properly:**
   ```javascript
   import * as Location from 'expo-location';
   
   const { status } = await Location.requestForegroundPermissionsAsync();
   ```

2. **Check device settings**

3. **Test on physical device (GPS may not work in simulator)**

### Build Failures

**Solutions:**
1. **Clear Expo cache:**
   ```bash
   npx expo start --clear
   ```

2. **Reset Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Clear node_modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

## Performance Issues

### High Memory Usage

**Solutions:**
1. **Check Docker container limits:**
   ```bash
   docker stats
   ```

2. **Optimize database queries**

3. **Implement pagination for large datasets**

4. **Add Redis caching for frequently accessed data**

### Slow API Response

**Solutions:**
1. **Add database indexes for common queries**

2. **Implement Redis caching**

3. **Optimize N+1 query problems:**
   ```javascript
   // Bad
   const users = await prisma.user.findMany();
   for (const user of users) {
     const courses = await prisma.course.findMany({ where: { ownerId: user.id } });
   }
   
   // Good
   const users = await prisma.user.findMany({
     include: { ownedCourses: true }
   });
   ```

## Testing Issues

### Test Database Setup

**Solutions:**
1. **Use separate test database:**
   ```env
   # .env.test
   DATABASE_URL=postgresql://postgres:password@localhost:5432/test_db
   ```

2. **Reset test database before each test:**
   ```javascript
   beforeEach(async () => {
     await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
   });
   ```

## Logging and Debugging

### Enable Debug Logging

1. **Prisma query logging:**
   ```javascript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

2. **Express request logging:**
   ```javascript
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.path}`, req.body);
     next();
   });
   ```

### Check Service Health

```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Check database connection
cd backend
node verify-data.js
```

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Error message (full stack trace)**
2. **Steps to reproduce**
3. **Environment details:**
   ```bash
   node --version
   npm --version
   docker --version
   ```
4. **Log files**
5. **Configuration files (.env, docker-compose.yml)**

### Log Locations

- **Container logs:** `docker logs <container_name>`
- **Service logs:** `backend/services/*/logs/`
- **Database logs:** `docker logs backend-postgres-1`

### Useful Commands

```bash
# Service status
docker-compose ps

# View all logs
docker-compose logs

# Database access
docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production

# Reset everything
docker-compose down -v && docker-compose up -d
```