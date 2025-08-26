# Troubleshooting Guide

## Database Connection Issues

### Problem: Prisma cannot connect to PostgreSQL

**Symptoms:**
- Error: "Can't reach database server at `localhost:PORT`"
- Unusual port numbers (not 5432)
- Migration fails

**Solutions:**

1. **Ensure Docker containers are running:**
   ```bash
   cd backend
   docker-compose up -d
   docker ps  # Verify containers are running
   ```

2. **Check DATABASE_URL in .env:**
   ```
   DATABASE_URL=postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db
   ```

3. **Verify PostgreSQL is accessible:**
   ```bash
   # Using docker
   docker exec -it backend_postgres_1 psql -U attendance_user -d attendance_db
   
   # Using psql directly
   psql postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db
   ```

4. **Check for port conflicts:**
   ```bash
   # Check if port 5432 is in use
   lsof -i :5432
   netstat -an | grep 5432
   ```

5. **Reset Docker environment:**
   ```bash
   docker-compose down -v  # Remove volumes
   docker-compose up -d    # Recreate
   ```

### Problem: Environment variables not loading

**Solutions:**

1. **Ensure .env file exists:**
   ```bash
   cp .env.example .env
   ```

2. **Check file permissions:**
   ```bash
   chmod 644 .env
   ```

3. **Use dotenv-cli for testing:**
   ```bash
   npm install -g dotenv-cli
   dotenv -e .env -- npx prisma migrate dev
   ```

### Problem: Migration fails

**Solutions:**

1. **Reset database:**
   ```bash
   npx prisma migrate reset
   ```

2. **Manual database creation:**
   ```sql
   CREATE DATABASE attendance_db;
   ```

3. **Check Prisma schema syntax:**
   ```bash
   npx prisma validate
   ```

## Common Docker Issues

### Container won't start
```bash
# Check logs
docker-compose logs postgres

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Permission issues
```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./
```

### Port already in use
```bash
# Find and kill process
sudo lsof -i :5432
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 externally
```