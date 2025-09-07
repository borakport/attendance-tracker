// This file imports from the auth service Prisma client which has all the models
import { PrismaClient } from './services/auth-service/node_modules/@prisma/client';
// Import types from the auth service
type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
type CourseRole = 'OWNER' | 'PARTICIPANT';
type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

// Enum constants
const UserRole = {
  ADMIN: 'ADMIN' as const,
  INSTRUCTOR: 'INSTRUCTOR' as const,
  STUDENT: 'STUDENT' as const
};

const CourseRole = {
  OWNER: 'OWNER' as const,
  PARTICIPANT: 'PARTICIPANT' as const
};

const AttendanceStatus = {
  PRESENT: 'PRESENT' as const,
  LATE: 'LATE' as const,
  ABSENT: 'ABSENT' as const
};

import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Utility functions
function generateCourseCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomCoordinate(centerLat: number, centerLng: number, radiusKm: number = 0.5): { lat: number; lng: number } {
  const radiusInDegrees = radiusKm / 111; // Roughly 111 km per degree
  const deltaLat = (Math.random() - 0.5) * 2 * radiusInDegrees;
  const deltaLng = (Math.random() - 0.5) * 2 * radiusInDegrees;
  
  return {
    lat: centerLat + deltaLat,
    lng: centerLng + deltaLng
  };
}

// Sample data
const universities = [
  { name: 'University of Technology', lat: 40.7128, lng: -74.0060 }, // New York
  { name: 'State University', lat: 34.0522, lng: -118.2437 }, // Los Angeles
  { name: 'Metropolitan College', lat: 41.8781, lng: -87.6298 }, // Chicago
  { name: 'Coastal University', lat: 29.7604, lng: -95.3698 }, // Houston
  { name: 'Mountain State College', lat: 39.7392, lng: -104.9903 }, // Denver
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Emily', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Edward', 'Dorothy', 'Ronald', 'Amy', 'Timothy', 'Angela', 'Jason', 'Ashley',
  'Jeffrey', 'Brenda', 'Ryan', 'Emma', 'Jacob', 'Olivia', 'Gary', 'Cynthia',
  'Nicholas', 'Marie', 'Eric', 'Janet', 'Jonathan', 'Catherine', 'Stephen', 'Frances',
  'Larry', 'Christine', 'Justin', 'Samantha', 'Scott', 'Debra', 'Brandon', 'Rachel',
  'Benjamin', 'Carolyn', 'Samuel', 'Janet', 'Gregory', 'Virginia', 'Alexander', 'Maria',
  'Frank', 'Heather', 'Raymond', 'Diane', 'Jack', 'Julie', 'Dennis', 'Joyce'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
];

const courseSubjects = [
  { prefix: 'CS', name: 'Computer Science', descriptions: [
    'Introduction to Programming', 'Data Structures and Algorithms', 'Database Systems',
    'Software Engineering', 'Computer Networks', 'Artificial Intelligence',
    'Machine Learning', 'Cybersecurity', 'Web Development', 'Mobile App Development'
  ]},
  { prefix: 'MATH', name: 'Mathematics', descriptions: [
    'Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics',
    'Discrete Mathematics', 'Differential Equations', 'Number Theory',
    'Mathematical Analysis', 'Probability Theory', 'Applied Mathematics'
  ]},
  { prefix: 'PHYS', name: 'Physics', descriptions: [
    'General Physics I', 'General Physics II', 'Quantum Mechanics',
    'Thermodynamics', 'Electromagnetism', 'Optics', 'Nuclear Physics',
    'Solid State Physics', 'Astrophysics', 'Particle Physics'
  ]},
  { prefix: 'CHEM', name: 'Chemistry', descriptions: [
    'General Chemistry I', 'General Chemistry II', 'Organic Chemistry',
    'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry',
    'Biochemistry', 'Environmental Chemistry', 'Materials Chemistry', 'Polymer Chemistry'
  ]},
  { prefix: 'BIO', name: 'Biology', descriptions: [
    'General Biology I', 'General Biology II', 'Molecular Biology',
    'Cell Biology', 'Genetics', 'Ecology', 'Evolution',
    'Microbiology', 'Anatomy and Physiology', 'Marine Biology'
  ]},
  { prefix: 'ENG', name: 'Engineering', descriptions: [
    'Engineering Mechanics', 'Electrical Circuits', 'Thermodynamics',
    'Fluid Mechanics', 'Materials Science', 'Control Systems',
    'Signal Processing', 'Power Systems', 'Structural Analysis', 'Heat Transfer'
  ]},
  { prefix: 'ECON', name: 'Economics', descriptions: [
    'Microeconomics', 'Macroeconomics', 'International Economics',
    'Development Economics', 'Economic Statistics', 'Game Theory',
    'Financial Economics', 'Labor Economics', 'Public Economics', 'Environmental Economics'
  ]},
  { prefix: 'PSYC', name: 'Psychology', descriptions: [
    'Introduction to Psychology', 'Cognitive Psychology', 'Social Psychology',
    'Developmental Psychology', 'Abnormal Psychology', 'Research Methods',
    'Statistics in Psychology', 'Neuroscience', 'Personality Psychology', 'Clinical Psychology'
  ]}
];

const sessionLocations = [
  'Main Lecture Hall A', 'Main Lecture Hall B', 'Science Building Room 101',
  'Engineering Lab 205', 'Computer Lab 301', 'Physics Laboratory',
  'Chemistry Lab', 'Biology Research Center', 'Library Study Room 1',
  'Library Study Room 2', 'Student Center Conference Room', 'Auditorium',
  'Mathematics Department Room 150', 'Business Building Room 220',
  'Art Studio', 'Music Room', 'Gymnasium', 'Sports Complex',
  'Medical Center Training Room', 'Research Building Lab 405'
];

async function generateUniqueCourseCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = generateCourseCode();
    
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (!existingCourse) {
      isUnique = true;
    }
  }

  return code!;
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');
  console.log('📊 This will create realistic data for a GPS attendance system');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.systemLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.courseMember.deleteMany();
  await prisma.course.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Cleaned existing data');

  // Create admin users
  console.log('👑 Creating admin users...');
  const adminPassword = await bcrypt.hash('Admin@2025!Secure', 12);
  
  const systemAdmin = await prisma.user.create({
    data: {
      email: 'system.admin@gpsattendance.edu',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneNumber: '+1-555-0001',
      lastLogin: new Date(),
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      email: 'super.admin@gpsattendance.edu',
      password: adminPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneNumber: '+1-555-0002',
      lastLogin: randomDate(new Date(2025, 0, 1), new Date()),
    },
  });

  console.log(`✅ Created ${2} admin users`);

  // Create instructors
  console.log('👨‍🏫 Creating instructors...');
  const instructorPassword = await bcrypt.hash('Instructor@2025!Secure', 12);
  const instructors = [];

  for (let i = 0; i < 25; i++) {
    const firstName = randomFromArray(firstNames);
    const lastName = randomFromArray(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;
    
    const instructor = await prisma.user.create({
      data: {
        email,
        password: instructorPassword,
        firstName,
        lastName,
        role: UserRole.INSTRUCTOR,
        emailVerified: Math.random() > 0.1, // 90% verified
        phoneNumber: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        lastLogin: Math.random() > 0.2 ? randomDate(new Date(2025, 0, 1), new Date()) : null,
        twoFactorEnabled: Math.random() > 0.7, // 30% have 2FA enabled
      },
    });
    instructors.push(instructor);
  }

  console.log(`✅ Created ${instructors.length} instructors`);

  // Create students
  console.log('👨‍🎓 Creating students...');
  const studentPassword = await bcrypt.hash('Student@2025!Secure', 12);
  const students = [];

  for (let i = 0; i < 500; i++) {
    const firstName = randomFromArray(firstNames);
    const lastName = randomFromArray(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.edu`;
    
    try {
      const student = await prisma.user.create({
        data: {
          email,
          password: studentPassword,
          firstName,
          lastName,
          role: UserRole.STUDENT,
          emailVerified: Math.random() > 0.15, // 85% verified
          phoneNumber: Math.random() > 0.1 ? `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}` : null,
          lastLogin: Math.random() > 0.3 ? randomDate(new Date(2025, 0, 1), new Date()) : null,
          twoFactorEnabled: Math.random() > 0.9, // 10% have 2FA enabled
          accountLocked: Math.random() > 0.98, // 2% locked accounts
          loginAttempts: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
        },
      });
      students.push(student);
    } catch (error) {
      // Handle duplicate emails
      console.log(`⚠️ Skipped duplicate email: ${email}`);
    }
  }

  console.log(`✅ Created ${students.length} students`);

  // Create courses
  console.log('📚 Creating courses...');
  const courses = [];
  const currentDate = new Date();
  const semesterStart = new Date(2025, 0, 15); // January 15, 2025
  const semesterEnd = new Date(2025, 4, 15);   // May 15, 2025

  for (let i = 0; i < 80; i++) {
    const subject = randomFromArray(courseSubjects);
    const courseNumber = Math.floor(Math.random() * 400) + 100;
    const description = randomFromArray(subject.descriptions);
    const instructor = randomFromArray(instructors);
    const university = randomFromArray(universities);
    
    const course = await prisma.course.create({
      data: {
        name: `${subject.prefix} ${courseNumber}: ${description}`,
        description: `${description} - A comprehensive course covering fundamental and advanced topics in ${subject.name}.`,
        code: await generateUniqueCourseCode(),
        ownerId: instructor.id,
        settings: {
          gpsRadius: Math.floor(Math.random() * 100) + 25, // 25-125 meters
          allowLateEntry: Math.random() > 0.2, // 80% allow late entry
          lateEntryMinutes: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
          requireSelfie: Math.random() > 0.6, // 40% require selfie
          autoEndSession: Math.random() > 0.1, // 90% auto-end
          autoEndMinutes: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
          location: {
            name: university.name,
            lat: university.lat,
            lng: university.lng
          }
        },
        startDate: semesterStart,
        endDate: semesterEnd,
        isActive: Math.random() > 0.05, // 95% active courses
      },
    });
    courses.push(course);
  }

  console.log(`✅ Created ${courses.length} courses`);

  // Create course memberships
  console.log('👥 Creating course memberships...');
  let membershipCount = 0;

  for (const course of courses) {
    // Add instructor as owner
    await prisma.courseMember.create({
      data: {
        courseId: course.id,
        userId: course.ownerId,
        role: CourseRole.OWNER,
        joinedAt: randomDate(new Date(2024, 11, 1), semesterStart),
      },
    });
    membershipCount++;

    // Add students (15-45 students per course)
    const numberOfStudents = Math.floor(Math.random() * 31) + 15;
    const courseStudents = students
      .sort(() => 0.5 - Math.random())
      .slice(0, numberOfStudents);

    for (const student of courseStudents) {
      try {
        await prisma.courseMember.create({
          data: {
            courseId: course.id,
            userId: student.id,
            role: CourseRole.PARTICIPANT,
            joinedAt: randomDate(new Date(2024, 11, 15), new Date(2025, 1, 1)),
          },
        });
        membershipCount++;
      } catch (error) {
        // Handle duplicate memberships
      }
    }
  }

  console.log(`✅ Created ${membershipCount} course memberships`);

  // Create sessions
  console.log('📅 Creating class sessions...');
  const sessions = [];

  for (const course of courses) {
    // Get course members
    const courseMembers = await prisma.courseMember.findMany({
      where: { courseId: course.id },
      include: { user: true }
    });

    const courseInstructor = courseMembers.find((m: any) => m.role === CourseRole.OWNER);
    if (!courseInstructor) continue;

    // Create 20-40 sessions per course (roughly 2-3 sessions per week for a semester)
    const numberOfSessions = Math.floor(Math.random() * 21) + 20;

    for (let i = 0; i < numberOfSessions; i++) {
      const sessionDate = new Date(semesterStart);
      sessionDate.setDate(sessionDate.getDate() + (i * 2) + Math.floor(Math.random() * 3));
      
      if (sessionDate > currentDate) break; // Don't create future sessions

      const university = (course.settings as any).location;
      const sessionLocation = randomCoordinate(university.lat, university.lng, 0.5);
      
      const startTime = new Date(sessionDate);
      startTime.setHours(Math.floor(Math.random() * 8) + 8, Math.floor(Math.random() * 60)); // 8 AM to 4 PM
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + Math.floor(Math.random() * 3) + 1); // 1-4 hour sessions

      const session = await prisma.session.create({
        data: {
          courseId: course.id,
          createdById: courseInstructor.userId,
          name: `${course.name.split(':')[0]} - Session ${i + 1}`,
          description: `Class session for ${course.name}`,
          startTime,
          endTime,
          latitude: sessionLocation.lat,
          longitude: sessionLocation.lng,
          radiusMeters: (course.settings as any).gpsRadius || 50,
          locationName: randomFromArray(sessionLocations),
          isActive: sessionDate < currentDate && Math.random() > 0.1, // Most past sessions are complete
          allowLateEntry: (course.settings as any).allowLateEntry,
          lateMinutes: (course.settings as any).lateEntryMinutes || 15,
          requireSelfie: (course.settings as any).requireSelfie,
          qrCode: randomUUID(),
          startedAt: sessionDate < currentDate ? startTime : null,
          endedAt: sessionDate < currentDate && Math.random() > 0.1 ? endTime : null,
          notes: Math.random() > 0.7 ? `Session notes for ${course.name.split(':')[0]}` : null,
        },
      });
      sessions.push(session);
    }
  }

  console.log(`✅ Created ${sessions.length} class sessions`);

  // Create attendance records
  console.log('✅ Creating attendance records...');
  let attendanceCount = 0;

  for (const session of sessions) {
    if (!session.startedAt) continue; // Skip sessions that haven't started

    // Get course members for this session
    const courseMembers = await prisma.courseMember.findMany({
      where: { 
        courseId: session.courseId,
        role: CourseRole.PARTICIPANT 
      },
      include: { user: true }
    });

    for (const member of courseMembers) {
      // 85% attendance rate on average
      if (Math.random() > 0.15) {
        const attendanceTime = new Date(session.startedAt);
        
        // Determine if late
        const isLate = Math.random() > 0.8; // 20% late arrivals
        if (isLate) {
          attendanceTime.setMinutes(attendanceTime.getMinutes() + Math.floor(Math.random() * 20) + 5);
        }

        // Generate location near session location
        const attendanceLocation = randomCoordinate(
          Number(session.latitude), 
          Number(session.longitude), 
          0.01 // Very close to session location
        );

        const status = isLate && attendanceTime > new Date(session.startTime.getTime() + (session.lateMinutes * 60000))
          ? AttendanceStatus.LATE 
          : AttendanceStatus.PRESENT;

        try {
          await prisma.attendance.create({
            data: {
              sessionId: session.id,
              userId: member.userId,
              markedAt: attendanceTime,
              latitude: attendanceLocation.lat,
              longitude: attendanceLocation.lng,
              status,
              distanceFromSession: Math.random() * 30, // 0-30 meters from session
              selfieUrl: session.requireSelfie && Math.random() > 0.1 
                ? `https://cdn.attendance.edu/selfies/${randomUUID()}.jpg` 
                : null,
              deviceInfo: {
                platform: randomFromArray(['ios', 'android']),
                model: randomFromArray(['iPhone 14', 'iPhone 13', 'Samsung Galaxy S23', 'Google Pixel 7', 'OnePlus 11']),
                osVersion: randomFromArray(['16.0', '15.5', '13.0', '12.0']),
                appVersion: '1.0.0'
              },
              ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              notes: Math.random() > 0.9 ? 'Attendance marked via mobile app' : null,
            },
          });
          attendanceCount++;
        } catch (error) {
          // Handle duplicates
        }
      }
    }
  }

  console.log(`✅ Created ${attendanceCount} attendance records`);

  // Create system logs
  console.log('📋 Creating system logs...');
  const logActions = [
    'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'PASSWORD_RESET',
    'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE',
    'SESSION_CREATE', 'SESSION_START', 'SESSION_END',
    'ATTENDANCE_MARK', 'ATTENDANCE_UPDATE',
    'ADMIN_LOGIN', 'ADMIN_ACTION', 'SYSTEM_BACKUP'
  ];

  const entities = ['User', 'Course', 'Session', 'Attendance', 'System'];

  for (let i = 0; i < 5000; i++) {
    const randomUser = Math.random() > 0.1 ? randomFromArray([...students, ...instructors, systemAdmin, superAdmin]) : null;
    
    await prisma.systemLog.create({
      data: {
        userId: randomUser?.id,
        action: randomFromArray(logActions),
        entity: randomFromArray(entities),
        entityId: randomUUID(),
        metadata: {
          timestamp: new Date(),
          userAgent: randomFromArray([
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            'Mozilla/5.0 (Linux; Android 13; SM-G998B)',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          ]),
          source: randomFromArray(['mobile_app', 'web_app', 'admin_panel']),
          success: Math.random() > 0.05
        },
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: randomFromArray([
          'GPSAttendance-iOS/1.0.0',
          'GPSAttendance-Android/1.0.0',
          'GPSAttendance-Web/1.0.0'
        ]),
        createdAt: randomDate(new Date(2024, 11, 1), new Date()),
      },
    });
  }

  console.log('✅ Created 5000 system log entries');

  // Create some refresh tokens for active users
  console.log('🔐 Creating refresh tokens...');
  const activeUsers = [...students, ...instructors].filter(u => Math.random() > 0.3);
  
  for (const user of activeUsers) {
    const tokenCount = Math.floor(Math.random() * 3) + 1; // 1-3 tokens per active user
    
    for (let i = 0; i < tokenCount; i++) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      await prisma.refreshToken.create({
        data: {
          token: randomBytes(32).toString('hex'),
          userId: user.id,
          expiresAt,
          createdAt: randomDate(new Date(2025, 0, 1), new Date()),
        },
      });
    }
  }

  console.log(`✅ Created refresh tokens for ${activeUsers.length} active users`);

  // Summary
  const finalCounts = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.courseMember.count(),
    prisma.session.count(),
    prisma.attendance.count(),
    prisma.systemLog.count(),
    prisma.refreshToken.count(),
  ]);

  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Final statistics:');
  console.log(`👥 Users: ${finalCounts[0]} (2 admins, ${instructors.length} instructors, ${students.length} students)`);
  console.log(`📚 Courses: ${finalCounts[1]}`);
  console.log(`👨‍🎓 Course Memberships: ${finalCounts[2]}`);
  console.log(`📅 Sessions: ${finalCounts[3]}`);
  console.log(`✅ Attendance Records: ${finalCounts[4]}`);
  console.log(`📋 System Logs: ${finalCounts[5]}`);
  console.log(`🔐 Refresh Tokens: ${finalCounts[6]}`);
  
  console.log('\n🔑 Admin Credentials:');
  console.log('Email: system.admin@gpsattendance.edu');
  console.log('Email: super.admin@gpsattendance.edu');
  console.log('Password: Admin@2025!Secure');
  
  console.log('\n👨‍🏫 Instructor Credentials:');
  console.log('Email: [firstName].[lastName]@university.edu');
  console.log('Password: Instructor@2025!Secure');
  
  console.log('\n👨‍🎓 Student Credentials:');
  console.log('Email: [firstName].[lastName][number]@student.edu');
  console.log('Password: Student@2025!Secure');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
