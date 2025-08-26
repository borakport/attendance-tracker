-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."CourseRole" AS ENUM ('OWNER', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "profilePicture" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'STUDENT',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLogin" TIMESTAMP(3),
    "accountLocked" BOOLEAN NOT NULL DEFAULT false,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_members" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."CourseRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 50,
    "locationName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "allowLateEntry" BOOLEAN NOT NULL DEFAULT true,
    "lateMinutes" INTEGER NOT NULL DEFAULT 15,
    "requireSelfie" BOOLEAN NOT NULL DEFAULT false,
    "qrCode" TEXT,
    "accessCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "distanceFromSession" DOUBLE PRECISION NOT NULL,
    "selfieUrl" TEXT,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "public"."users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "public"."users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_emailVerificationToken_idx" ON "public"."users"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "users_passwordResetToken_idx" ON "public"."users"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "public"."courses"("code");

-- CreateIndex
CREATE INDEX "courses_code_idx" ON "public"."courses"("code");

-- CreateIndex
CREATE INDEX "courses_ownerId_idx" ON "public"."courses"("ownerId");

-- CreateIndex
CREATE INDEX "courses_isActive_idx" ON "public"."courses"("isActive");

-- CreateIndex
CREATE INDEX "course_members_courseId_idx" ON "public"."course_members"("courseId");

-- CreateIndex
CREATE INDEX "course_members_userId_idx" ON "public"."course_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "course_members_courseId_userId_key" ON "public"."course_members"("courseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_qrCode_key" ON "public"."sessions"("qrCode");

-- CreateIndex
CREATE INDEX "sessions_courseId_idx" ON "public"."sessions"("courseId");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "public"."sessions"("isActive");

-- CreateIndex
CREATE INDEX "sessions_startTime_idx" ON "public"."sessions"("startTime");

-- CreateIndex
CREATE INDEX "sessions_qrCode_idx" ON "public"."sessions"("qrCode");

-- CreateIndex
CREATE INDEX "attendances_sessionId_idx" ON "public"."attendances"("sessionId");

-- CreateIndex
CREATE INDEX "attendances_userId_idx" ON "public"."attendances"("userId");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "public"."attendances"("status");

-- CreateIndex
CREATE INDEX "attendances_markedAt_idx" ON "public"."attendances"("markedAt");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_sessionId_userId_key" ON "public"."attendances"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "system_logs_userId_idx" ON "public"."system_logs"("userId");

-- CreateIndex
CREATE INDEX "system_logs_action_idx" ON "public"."system_logs"("action");

-- CreateIndex
CREATE INDEX "system_logs_entity_idx" ON "public"."system_logs"("entity");

-- CreateIndex
CREATE INDEX "system_logs_createdAt_idx" ON "public"."system_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_members" ADD CONSTRAINT "course_members_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_members" ADD CONSTRAINT "course_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
