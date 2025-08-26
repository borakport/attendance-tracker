# Quick Reference Guide

A summary of essential commands and information for the project.

## 📦 Database Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run db:migrate`  | Run database migrations      |
| `npm run db:seed`     | Seed the database with test data |
| `npm run db:reset`    | Reset and re-seed the database |
| `npm run db:studio`   | Open Prisma Studio GUI       |

## 💻 Development Commands

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`     | Start the service in development mode |
| `npm run build`   | Build the TypeScript source code |
| `npm run test`    | Run automated tests              |
| `npm run lint`    | Run the linter to check code quality |

## 🐳 Docker Commands

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `docker-compose up -d` | Start all services in detached mode |
| `docker-compose down`  | Stop and remove all services     |
| `docker-compose logs`  | View logs from all services      |
| `docker ps`            | List all running containers      |

## 🧪 API Testing Example

### Login Request

```bash
curl -X POST http://localhost:3001/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@attendance.com","password":"Student@123"}'
```

## 🐛 Troubleshooting

| Issue                      | Solution                               |
| -------------------------- | -------------------------------------- |
| Cannot connect to database | Ensure Docker is running: `docker-compose up -d` |
| Port already in use        | Kill the process or change the port in `.env` |
| Migration failed           | Check the `DATABASE_URL` in `.env` file |
| Seed failed                | Run `npm run db:reset` to start fresh |
