# Test Data Documentation

**Generated:** 2025-08-26 17:08:51 UTC  
**Author:** borakport  
**Purpose:** Development and testing reference

## 🔐 Test Credentials

### Admin Account
- **Email:** admin@attendance.com
- **Password:** Admin@123
- **Role:** ADMIN
- **Phone:** +1234567890
- **Features:** Full system access, email verified

### Instructor Account
- **Email:** instructor@attendance.com
- **Password:** Instructor@123
- **Role:** INSTRUCTOR
- **Phone:** +1234567891
- **Features:** Can create courses and sessions, email verified

### Student Accounts

#### Student 1
- **Email:** student1@attendance.com
- **Password:** Student@123
- **Name:** Alice Student
- **Role:** STUDENT
- **Phone:** +1234567892
- **Features:** Enrolled in all test courses

#### Student 2
- **Email:** student2@attendance.com
- **Password:** Student@123
- **Name:** Bob Student
- **Role:** STUDENT
- **Phone:** +1234567893
- **Features:** Enrolled in all test courses

#### Student 3
- **Email:** student3@attendance.com
- **Password:** Student@123
- **Name:** Charlie Student
- **Role:** STUDENT
- **Phone:** +1234567894
- **Features:** Enrolled in all test courses

## 📚 Test Courses

### Course 1: Computer Science 101
- **Code:** CS101B55Z (randomly generated suffix)
- **Owner:** instructor@attendance.com
- **Description:** Introduction to Computer Science
- **Duration:** 2025-01-01 to 2025-06-30
- **Settings:**
  - GPS Radius: 50 meters
  - Allow Late Entry: Yes (15 minutes)
  - Require Selfie: No
  - Auto End Session: Yes (120 minutes)
- **Enrolled Students:** 3 (All test students)

### Course 2: Web Development
- **Code:** WEB201DL52 (randomly generated suffix)
- **Owner:** instructor@attendance.com
- **Description:** Full-stack web development with modern technologies
- **Duration:** 2025-01-15 to 2025-05-15
- **Settings:**
  - GPS Radius: 75 meters
  - Allow Late Entry: Yes (10 minutes)
  - Require Selfie: Yes
  - Auto End Session: Yes (90 minutes)
- **Enrolled Students:** 3 (All test students)

## 📅 Test Sessions

### Upcoming Session 1
- **Course:** Computer Science 101
- **Name:** Lecture 1: Introduction
- **Description:** Introduction to programming concepts
- **Time:** 1 hour from seed time (for testing immediate sessions)
- **Duration:** 2 hours
- **Location:** Room 101, Computer Science Building
- **Coordinates:** 37.7749, -122.4194 (San Francisco area)
- **Access Code:** LEC001
- **Settings:**
  - Radius: 50 meters
  - Late Entry: 15 minutes
  - Selfie Required: No

### Upcoming Session 2
- **Course:** Web Development
- **Name:** Lab Session: HTML/CSS
- **Description:** Hands-on HTML and CSS practice
- **Time:** 24 hours from seed time (tomorrow)
- **Duration:** 2 hours
- **Location:** Lab 202, Technology Center
- **Coordinates:** 37.7751, -122.4180 (San Francisco area)
- **Access Code:** LAB001
- **Settings:**
  - Radius: 75 meters
  - Late Entry: 10 minutes
  - Selfie Required: Yes

### Past Session (with Attendance Records)
- **Course:** Computer Science 101
- **Name:** Previous Lecture
- **Time:** 48 hours before seed time
- **Status:** Completed
- **Attendance Records:**
  - Alice Student: PRESENT (arrived 5 minutes after start)
  - Bob Student: LATE (arrived 20 minutes after start)
  - Charlie Student: PRESENT (on time)

## 📍 GPS Test Locations

All test sessions use San Francisco coordinates for consistency:
- **Primary Location:** 37.7749, -122.4194 (Downtown SF)
- **Secondary Location:** 37.7751, -122.4180 (Nearby alternate)

## 📱 Test Device Information

Sample device data included in past attendance:
- **iOS Device:** iPhone 14, iOS 16.0, App v1.0.0
- **Android Device 1:** Pixel 7, Android 13.0, App v1.0.0
- **Android Device 2:** Samsung Galaxy S23, Android 13.0, App v1.0.0

## 🧪 Testing Scenarios

### Authentication Testing
1. **Admin Login:** Full access to all features
2. **Instructor Login:** Course creation and management
3. **Student Login:** Course enrollment and attendance

### Course Testing
1. **Join Course:** Use the generated course codes
2. **View Enrolled Courses:** Each student sees 2 courses
3. **Course Management:** Instructor can manage both courses

### Session Testing
1. **Upcoming Session:** Test real-time activation
2. **GPS Verification:** Use provided coordinates
3. **Late Entry:** Test with different time windows

### Attendance Testing
1. **On-time Attendance:** Mark within session start time
2. **Late Attendance:** Mark after late entry window
3. **GPS Distance:** Test with coordinates outside radius

## ⚠️ Important Notes

1. **Course Codes:** Codes are partially randomized (suffix changes each seed)
2. **Timing:** Session times are relative to seed execution time
3. **Passwords:** All test passwords follow format: Role@123
4. **Email Verification:** All test accounts are pre-verified
5. **Phone Numbers:** Use format +123456789X for testing

## 🔄 Reset and Reseed

To reset and get fresh test data:
```bash
cd backend/services/auth-service
npm run db:reset  # This will reset and reseed automatically
# OR manually:
npx prisma migrate reset --force
npm run seed
```
