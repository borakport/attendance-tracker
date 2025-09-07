# Test Data Documentation

**Generated:** 2025-09-04 (Updated after Prisma 6.15.0 upgrade)  
**Author:** borakport  
**Purpose:** Development and testing reference

## 🔐 Test Credentials

### Admin Account
- **Email:** admin@attendance.com
- **Password:** password123
- **Role:** ADMIN
- **Phone:** +1234567890
- **Features:** Full system access, email verified

### Instructor Accounts (5 Total)

#### Primary Instructor
- **Email:** prof.anderson@university.edu
- **Password:** password123
- **Name:** Prof. Anderson
- **Role:** INSTRUCTOR
- **Phone:** +1234567801
- **Features:** Course creation and management, email verified

#### Additional Instructors
- **Email:** dr.martinez@college.edu (Dr. Martinez, +1234567802)
- **Email:** prof.johnson@academy.edu (Prof. Johnson, +1234567803)
- **Email:** dr.wilson@institute.edu (Dr. Wilson, +1234567804)
- **Email:** prof.davis@school.edu (Prof. Davis, +1234567805)
- **Password:** password123 (all instructors)
- **Features:** Course creation and management, email verified

### Student Accounts (20 Total)

#### Primary Students (Mobile App Compatible)
- **Email:** alice.smith@student.edu (Alice Smith, +1234567811)
- **Email:** bob.johnson@student.edu (Bob Johnson, +1234567812)
- **Email:** charlie.brown@student.edu (Charlie Brown, +1234567813)
- **Email:** diana.prince@student.edu (Diana Prince, +1234567814)
- **Email:** emma.watson@student.edu (Emma Watson, +1234567815)

#### Additional Students
- **Email:** frank.miller@student.edu (Frank Miller, +1234567816)
- **Email:** grace.hopper@student.edu (Grace Hopper, +1234567817)
- **Email:** henry.ford@student.edu (Henry Ford, +1234567818)
- **Email:** iris.west@student.edu (Iris West, +1234567819)
- **Email:** jack.sparrow@student.edu (Jack Sparrow, +1234567820)
- **Email:** kate.bishop@student.edu (Kate Bishop, +1234567821)
- **Email:** liam.neeson@student.edu (Liam Neeson, +1234567822)
- **Email:** maya.angelou@student.edu (Maya Angelou, +1234567823)
- **Email:** noah.webster@student.edu (Noah Webster, +1234567824)
- **Email:** olivia.pope@student.edu (Olivia Pope, +1234567825)
- **Email:** peter.parker@student.edu (Peter Parker, +1234567826)
- **Email:** quinn.fabray@student.edu (Quinn Fabray, +1234567827)
- **Email:** rachel.green@student.edu (Rachel Green, +1234567828)
- **Email:** steve.rogers@student.edu (Steve Rogers, +1234567829)
- **Email:** tony.stark@student.edu (Tony Stark, +1234567830)

**All Student Passwords:** password123  
**Features:** Course enrollment and attendance, email verified

## 📚 Test Courses (10 Total)

### Computer Science Courses

#### Course 1: Introduction to Computer Science
- **Code:** 6-digit format (e.g., KH9YSB)
- **Owner:** prof.anderson@university.edu
- **Description:** Fundamental concepts of computer science including programming basics, data structures, and algorithms
- **Duration:** 2025-01-15 to 2025-05-15
- **Settings:**
  - GPS Radius: 50 meters
  - Allow Late Entry: Yes (15 minutes)
  - Require Selfie: No
  - Auto End Session: Yes (120 minutes)

#### Course 2: Data Structures and Algorithms
- **Code:** 6-digit format (e.g., N2MC73)
- **Owner:** prof.anderson@university.edu
- **Description:** Advanced study of data structures, algorithm design, and complexity analysis
- **Duration:** 2025-01-20 to 2025-06-20
- **Settings:**
  - GPS Radius: 75 meters
  - Allow Late Entry: No
  - Require Selfie: Yes
  - Auto End Session: Yes (150 minutes)

#### Course 3: Web Development Fundamentals
- **Code:** 6-digit format (e.g., PA7SQF)
- **Owner:** dr.martinez@college.edu
- **Description:** Full-stack web development using HTML, CSS, JavaScript, Node.js, and databases
- **Duration:** 2025-02-01 to 2025-06-01
- **Settings:**
  - GPS Radius: 60 meters
  - Allow Late Entry: Yes (20 minutes)
  - Require Selfie: No
  - Auto End Session: Yes (180 minutes)

#### Course 4: Mobile App Development
- **Code:** 6-digit format (e.g., ZVVQS4)
- **Owner:** dr.martinez@college.edu
- **Description:** Cross-platform mobile application development using React Native and Flutter
- **Duration:** 2025-02-10 to 2025-07-10
- **Settings:**
  - GPS Radius: 40 meters
  - Allow Late Entry: Yes (10 minutes)
  - Require Selfie: Yes
  - Auto End Session: No

### Engineering Courses

#### Course 5: Engineering Mathematics
- **Code:** 6-digit format (e.g., EZFPLG)
- **Owner:** prof.johnson@academy.edu
- **Description:** Mathematical foundations for engineering including calculus, linear algebra, and differential equations
- **Duration:** 2025-01-10 to 2025-05-30
- **Settings:**
  - GPS Radius: 45 meters
  - Allow Late Entry: No
  - Require Selfie: No
  - Auto End Session: Yes (100 minutes)

#### Course 6: Mechanical Engineering Design
- **Code:** 6-digit format (e.g., DK62SV)
- **Owner:** prof.johnson@academy.edu
- **Description:** Principles of mechanical design, CAD modeling, and engineering analysis
- **Settings:**
  - GPS Radius: 80 meters
  - Various other settings

### Business Courses

#### Course 7: Business Analytics
- **Code:** 6-digit format (e.g., QC4KWL)
- **Owner:** dr.wilson@institute.edu
- **Description:** Data-driven business decision making and analytics

#### Course 8: Digital Marketing Strategy
- **Code:** 6-digit format (e.g., SDPELV)
- **Owner:** dr.wilson@institute.edu
- **Description:** Modern digital marketing techniques and strategy

### Advanced Technology Courses

#### Course 9: Machine Learning and AI
- **Code:** 6-digit format (e.g., EJURKB)
- **Owner:** prof.davis@school.edu
- **Description:** Introduction to machine learning algorithms and artificial intelligence

#### Course 10: Cybersecurity Fundamentals
- **Code:** 6-digit format (e.g., 4JKSG2)
- **Owner:** prof.davis@school.edu
- **Description:** Essential cybersecurity principles and practices

**Note:** All courses have random student enrollments (99 total enrollments across all courses)

## 📅 Test Sessions (71 Total)

The seed creates comprehensive session data across all courses with various timing scenarios:

### Session Types Created
- **Past Sessions:** Already completed with attendance records
- **Current Sessions:** Active or recently started
- **Upcoming Sessions:** Future sessions for testing

### Sample Session Structure
Each course gets multiple sessions with:
- **Lecture Sessions:** 2-hour duration, various locations
- **Lab Sessions:** 3-hour duration, hands-on activities
- **Tutorial Sessions:** 1-hour duration, Q&A and support
- **Assessment Sessions:** Variable duration, quizzes and exams

### GPS Locations
All sessions use San Francisco Bay Area coordinates:
- **Base Location:** 37.7749, -122.4194 (Downtown SF)
- **Radius:** 5km spread for realistic testing
- **Coordinates:** Randomly distributed around the base location

### Access Codes
- **Format:** 6-character alphanumeric codes
- **Examples:** LEC001, LAB001, TUT001, ASS001
- **Generation:** Unique codes for each session

### Session Settings
Sessions inherit course settings but may have specific overrides:
- GPS radius varies by course (40-80 meters)
- Late entry policies differ by course type
- Selfie requirements based on course security level
- **Settings:**
## 📊 Attendance Records (237 Total)

The seed creates comprehensive attendance data with realistic patterns:

### Attendance Status Distribution
- **PRESENT:** Students who arrived on time
- **LATE:** Students who arrived after start but within late entry window
- **ABSENT:** Students who didn't attend or arrived too late
- **EXCUSED:** Students with valid excuses (occasional records)

### Attendance Patterns
- **High Attendance Courses:** CS and Engineering courses (80-90% attendance)
- **Medium Attendance Courses:** Business courses (70-80% attendance)
- **Variable Attendance:** Different patterns per student and course type

### Device Information
Sample device data included in attendance records:
- **iOS Devices:** iPhone 14, iPhone 13, various iOS versions
- **Android Devices:** Pixel 7, Samsung Galaxy S23, OnePlus devices
- **App Versions:** Consistent v1.0.0 across all records

### Selfie Data
For courses requiring selfies:
- **Selfie URLs:** Placeholder URLs for development
- **Format:** Standard JPEG format references
- **Storage:** Mock cloud storage references

## 📍 GPS Test Locations

All test sessions use San Francisco Bay Area coordinates for consistency:
- **Base Location:** 37.7749, -122.4194 (Downtown San Francisco)
- **Coverage Area:** 5km radius around base location
- **Coordinate Range:** 
  - Latitude: 37.7249 to 37.8249
  - Longitude: -122.4694 to -122.3694

### Sample Locations
- **University Campus:** 37.7749, -122.4194
- **Engineering Building:** 37.7751, -122.4180
- **Business School:** 37.7745, -122.4200
- **Computer Lab:** 37.7753, -122.4188
- **Library:** 37.7747, -122.4196

## � System Configuration

### Database Schema
- **Prisma Version:** 6.15.0 (recently updated)
- **Database:** PostgreSQL
- **ORM:** Prisma Client v6.15.0

### Security Features
- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Tokens:** Secure authentication tokens
- **Email Verification:** All test accounts pre-verified
- **Password Verification:** Required for sensitive operations

### Course Code Security
- **Format:** Exactly 6 characters (alphanumeric)
- **Character Set:** ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (excludes confusing chars like 0/O, 1/I)
- **Collision Prevention:**
  - Enhanced random generation with crypto-secure randomness
  - Recent code caching (1000 codes) to avoid immediate duplicates
  - Database uniqueness constraint + index for fast lookup
  - Maximum 10 retry attempts with fallback generation
  - Alternative timestamp-based pattern on collision
  - Performance monitoring and collision logging

### API Endpoints
- **Authentication:** Password verification endpoints
- **Course Management:** Edit and settings management
- **Real-time:** WebSocket connections for live updates

## 🧪 Testing Scenarios

### Authentication Testing
1. **Admin Login:** admin@attendance.com / password123 - Full system access
2. **Instructor Login:** prof.anderson@university.edu / password123 - Course management
3. **Student Login:** alice.smith@student.edu / password123 - Course enrollment and attendance
4. **Mobile Testing:** Use any of the 25 test accounts in the mobile app dropdown

### Course Management Testing
1. **Course Creation:** Instructors can create new courses with custom settings
2. **Course Editing:** Test password verification for course modifications
3. **Course Settings:** Update GPS radius, late entry, selfie requirements
4. **Course Deletion:** Password-protected course deletion for instructors
5. **Student Enrollment:** Test joining courses with generated codes

### Session Testing
1. **Active Sessions:** Test real-time session activation
2. **GPS Verification:** Use provided San Francisco coordinates
3. **Late Entry Testing:** Test various late entry windows (5-20 minutes)
4. **Attendance Marking:** Test different attendance statuses
5. **Selfie Requirements:** Test courses with/without selfie requirements

### Real-time Features Testing
1. **Live Updates:** Test WebSocket connections for real-time updates
2. **Session Status:** Monitor active/inactive session states
3. **Attendance Notifications:** Real-time attendance confirmations

### Security Testing
1. **Password Verification:** Test sensitive operations requiring password
2. **JWT Token Handling:** Authentication token management
3. **Course Access Control:** Verify proper authorization levels
4. **Data Protection:** Test bcrypt password hashing

## 📈 Current Statistics

After the latest seed (Updated with Prisma 6.15.0):
- **👤 Users:** 26 total (1 admin, 5 instructors, 20 students)
- **📚 Courses:** 10 comprehensive courses across multiple disciplines
- **📅 Sessions:** 71 sessions with varied timing and settings
- **👥 Enrollments:** 99 student enrollments across all courses
- **✅ Attendance Records:** 237 realistic attendance records
- **🔒 Security:** All passwords properly hashed with bcrypt

## ⚠️ Important Notes

1. **Course Codes:** Automatically generated using CodeGenerator utility
2. **Passwords:** All test accounts use 'password123' (properly hashed in database)
3. **Email Verification:** All test accounts are pre-verified for immediate use
4. **Phone Numbers:** Sequential format +123456780X for easy identification
5. **Prisma Version:** Updated to 6.15.0 with latest features and security
6. **Mobile Compatibility:** All accounts work with the mobile app test interface
7. **Real-time Testing:** WebSocket connections available for live features

## 🔄 Reset and Reseed

To reset and get fresh test data:

### Quick Reset (Recommended)
```bash
cd backend/services/attendance-service
npx prisma db seed
```

### Full Database Reset
```bash
cd backend/services/attendance-service
npx prisma migrate reset --force
# This will automatically run the seed after reset
```

### Development Workflow
```bash
# After making schema changes
npx prisma db push        # Push schema changes
npx prisma generate       # Regenerate client
npx prisma db seed        # Reseed with fresh data
```

### PowerShell Commands (Windows)
```powershell
cd "C:\smart-attendance\attendance-tracker\backend\services\attendance-service"
npx prisma db seed
```

## 🎯 Quick Reference

### Sample Login Credentials
```
Admin:      admin@attendance.com / password123
Instructor: prof.anderson@university.edu / password123
Student:    alice.smith@student.edu / password123
```

### Sample Course Code
```
6-digit format, example: KH9YSB, N2MC73, PA7SQF
```

### Mobile App Testing
- Enable test mode in mobile app settings
- Use dropdown to select from 25 test accounts
- All accounts have consistent password: password123

### API Testing
- All endpoints available with proper authentication
- Password verification required for sensitive operations
- Real-time WebSocket connections supported

---

**Last Updated:** September 4, 2025  
**Prisma Version:** 6.15.0  
**Database Status:** ✅ Fully seeded with comprehensive test data
