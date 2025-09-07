import { PrismaClient, UserRole, CourseRole, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CodeGenerator } from '../src/utils';

const prisma = new PrismaClient();

// Generate a unique course code
async function generateUniqueCourseCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = CodeGenerator.generateCourseCode();
    
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
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.courseMember.deleteMany();
  await prisma.course.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@attendance.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneNumber: '+1234567890',
    },
  });
  console.log('👤 Created admin user:', admin.email);

  // Create test instructor
  const instructorPassword = await bcrypt.hash('Instructor@123', 10);
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@attendance.com',
      password: instructorPassword,
      firstName: 'John',
      lastName: 'Instructor',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
      phoneNumber: '+1234567891',
    },
  });
  console.log('👤 Created instructor:', instructor.email);

  // Create test students
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@attendance.com',
        password: studentPassword,
        firstName: 'Alice',
        lastName: 'Student',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567892',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@attendance.com',
        password: studentPassword,
        firstName: 'Bob',
        lastName: 'Student',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567893',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@attendance.com',
        password: studentPassword,
        firstName: 'Charlie',
        lastName: 'Student',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567894',
      },
    }),
  ]);
  console.log(`👥 Created ${students.length} students`);

  // Create test courses
  const course1 = await prisma.course.create({
    data: {
      name: 'Computer Science 101',
      description: 'Introduction to Computer Science',
      code: await generateUniqueCourseCode(),
      ownerId: instructor.id,
      settings: {
        gpsRadius: 50,
        allowLateEntry: true,
        lateEntryMinutes: 15,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 120,
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
    },
  });
  console.log('📚 Created course:', course1.name, 'Code:', course1.code);

  const course2 = await prisma.course.create({
    data: {
      name: 'Web Development',
      description: 'Full-stack web development with modern technologies',
      code: await generateUniqueCourseCode(),
      ownerId: instructor.id,
      settings: {
        gpsRadius: 75,
        allowLateEntry: true,
        lateEntryMinutes: 10,
        requireSelfie: true,
        autoEndSession: true,
        autoEndMinutes: 90,
      },
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-15'),
    },
  });
  console.log('📚 Created course:', course2.name, 'Code:', course2.code);

  // Add instructor as course owner/member
  await prisma.courseMember.createMany({
    data: [
      {
        courseId: course1.id,
        userId: instructor.id,
        role: CourseRole.OWNER,
      },
      {
        courseId: course2.id,
        userId: instructor.id,
        role: CourseRole.OWNER,
      },
    ],
  });

  // Enroll students in courses
  for (const student of students) {
    await prisma.courseMember.createMany({
      data: [
        {
          courseId: course1.id,
          userId: student.id,
          role: CourseRole.PARTICIPANT,
        },
        {
          courseId: course2.id,
          userId: student.id,
          role: CourseRole.PARTICIPANT,
        },
      ],
    });
  }
  console.log('👥 Enrolled students in courses');

  // Create sample sessions
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const session1 = await prisma.session.create({
    data: {
      courseId: course1.id,
      createdById: instructor.id,
      name: 'Lecture 1: Introduction',
      description: 'Introduction to programming concepts',
      startTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
      latitude: 37.7749,
      longitude: -122.4194,
      radiusMeters: 50,
      locationName: 'Room 101, Computer Science Building',
      isActive: false,
      allowLateEntry: true,
      lateMinutes: 15,
      requireSelfie: false,
    },
  });
  console.log('📅 Created session:', session1.name);

  const session2 = await prisma.session.create({
    data: {
      courseId: course2.id,
      createdById: instructor.id,
      name: 'Lab Session: HTML/CSS',
      description: 'Hands-on HTML and CSS practice',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      latitude: 37.7751,
      longitude: -122.4180,
      radiusMeters: 75,
      locationName: 'Lab 202, Technology Center',
      isActive: false,
      allowLateEntry: true,
      lateMinutes: 10,
      requireSelfie: true,
    },
  });
  console.log('📅 Created session:', session2.name);

  // Create a past session with attendance records
  const pastSession = await prisma.session.create({
    data: {
      courseId: course1.id,
      createdById: instructor.id,
      name: 'Previous Lecture',
      description: 'Already completed session',
      startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(now.getTime() - 46 * 60 * 60 * 1000),
      latitude: 37.7749,
      longitude: -122.4194,
      radiusMeters: 50,
      locationName: 'Room 101, Computer Science Building',
      isActive: false,
      allowLateEntry: true,
      lateMinutes: 15,
      requireSelfie: false,
      startedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 46 * 60 * 60 * 1000),
    },
  });

  // Mark attendance for past session
  await prisma.attendance.createMany({
    data: [
      {
        sessionId: pastSession.id,
        userId: students[0].id,
        markedAt: new Date(pastSession.startTime.getTime() + 5 * 60 * 1000), // 5 minutes late
        latitude: 37.7749,
        longitude: -122.4194,
        status: AttendanceStatus.PRESENT,
        distanceFromSession: 10.5,
        ipAddress: '192.168.1.100',
        deviceInfo: {
          platform: 'ios',
          model: 'iPhone 14',
          osVersion: '16.0',
          appVersion: '1.0.0',
        },
      },
      {
        sessionId: pastSession.id,
        userId: students[1].id,
        markedAt: new Date(pastSession.startTime.getTime() + 20 * 60 * 1000), // 20 minutes late
        latitude: 37.7750,
        longitude: -122.4193,
        status: AttendanceStatus.LATE,
        distanceFromSession: 25.3,
        ipAddress: '192.168.1.101',
        deviceInfo: {
          platform: 'android',
          model: 'Pixel 7',
          osVersion: '13.0',
          appVersion: '1.0.0',
        },
      },
      {
        sessionId: pastSession.id,
        userId: students[2].id,
        markedAt: pastSession.startTime,
        latitude: 37.7749,
        longitude: -122.4194,
        status: AttendanceStatus.PRESENT,
        distanceFromSession: 5.2,
        ipAddress: '192.168.1.102',
        deviceInfo: {
          platform: 'android',
          model: 'Samsung Galaxy S23',
          osVersion: '13.0',
          appVersion: '1.0.0',
        },
      },
    ],
  });
  console.log('✅ Created attendance records for past session');

  console.log('🌱 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@attendance.com / Admin@123');
  console.log('Instructor: instructor@attendance.com / Instructor@123');
  console.log('Student: student1@attendance.com / Student@123');
  console.log('\n📚 Course Codes:');
  console.log(`Course 1: ${course1.code}`);
  console.log(`Course 2: ${course2.code}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });