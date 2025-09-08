import { PrismaClient, UserRole, CourseRole, AttendanceStatus, Course, Session } from '@prisma/client';
import { CodeGenerator } from '../src/utils/code.generator';
import bcrypt from 'bcrypt';

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

// Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random coordinates near San Francisco
function randomCoordinates() {
  // San Francisco Bay Area coordinates
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const radius = 0.05; // Roughly 5km radius
  
  return {
    latitude: baseLat + (Math.random() - 0.5) * radius,
    longitude: baseLng + (Math.random() - 0.5) * radius,
  };
}

// Hash password function using bcrypt
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // 12 salt rounds for strong security
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Clean existing data
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.courseMember.deleteMany();
  await prisma.course.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleaned existing data');

  // Create admin user
  const adminPassword = await hashPassword('password123');
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

  // Create instructors
  const instructorPassword = await hashPassword('password123');
  const instructors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'prof.anderson@university.edu',
        password: instructorPassword,
        firstName: 'Prof.',
        lastName: 'Anderson',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567801',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.martinez@college.edu',
        password: instructorPassword,
        firstName: 'Dr.',
        lastName: 'Martinez',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567802',
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.johnson@academy.edu',
        password: instructorPassword,
        firstName: 'Prof.',
        lastName: 'Johnson',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567803',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.wilson@institute.edu',
        password: instructorPassword,
        firstName: 'Dr.',
        lastName: 'Wilson',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567804',
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.davis@school.edu',
        password: instructorPassword,
        firstName: 'Prof.',
        lastName: 'Davis',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567805',
      },
    }),
    // Additional instructors for larger dataset
    prisma.user.create({
      data: {
        email: 'dr.smith@university.edu',
        password: instructorPassword,
        firstName: 'Dr.',
        lastName: 'Smith',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567806',
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.taylor@academy.edu',
        password: instructorPassword,
        firstName: 'Prof.',
        lastName: 'Taylor',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567807',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.brown@institute.edu',
        password: instructorPassword,
        firstName: 'Dr.',
        lastName: 'Brown',
        role: UserRole.INSTRUCTOR,
        emailVerified: true,
        phoneNumber: '+1234567808',
      },
    }),
  ]);
  console.log(`👨‍🏫 Created ${instructors.length} instructors`);

  // Create students
  const studentPassword = await hashPassword('password123');
  const students = await Promise.all([
    // Students matching the mobile app test data
    prisma.user.create({
      data: {
        email: 'alice.smith@student.edu',
        password: studentPassword,
        firstName: 'Alice',
        lastName: 'Smith',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567811',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.johnson@student.edu',
        password: studentPassword,
        firstName: 'Bob',
        lastName: 'Johnson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567812',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie.brown@student.edu',
        password: studentPassword,
        firstName: 'Charlie',
        lastName: 'Brown',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567813',
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana.prince@student.edu',
        password: studentPassword,
        firstName: 'Diana',
        lastName: 'Prince',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567814',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.watson@student.edu',
        password: studentPassword,
        firstName: 'Emma',
        lastName: 'Watson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567815',
      },
    }),
    prisma.user.create({
      data: {
        email: 'frank.miller@student.edu',
        password: studentPassword,
        firstName: 'Frank',
        lastName: 'Miller',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567816',
      },
    }),
    prisma.user.create({
      data: {
        email: 'grace.hopper@student.edu',
        password: studentPassword,
        firstName: 'Grace',
        lastName: 'Hopper',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567817',
      },
    }),
    prisma.user.create({
      data: {
        email: 'henry.ford@student.edu',
        password: studentPassword,
        firstName: 'Henry',
        lastName: 'Ford',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567818',
      },
    }),
    prisma.user.create({
      data: {
        email: 'iris.west@student.edu',
        password: studentPassword,
        firstName: 'Iris',
        lastName: 'West',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567819',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jack.sparrow@student.edu',
        password: studentPassword,
        firstName: 'Jack',
        lastName: 'Sparrow',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567820',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kate.bishop@student.edu',
        password: studentPassword,
        firstName: 'Kate',
        lastName: 'Bishop',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567821',
      },
    }),
    prisma.user.create({
      data: {
        email: 'liam.neeson@student.edu',
        password: studentPassword,
        firstName: 'Liam',
        lastName: 'Neeson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567822',
      },
    }),
    prisma.user.create({
      data: {
        email: 'maya.angelou@student.edu',
        password: studentPassword,
        firstName: 'Maya',
        lastName: 'Angelou',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567823',
      },
    }),
    prisma.user.create({
      data: {
        email: 'noah.webster@student.edu',
        password: studentPassword,
        firstName: 'Noah',
        lastName: 'Webster',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567824',
      },
    }),
    prisma.user.create({
      data: {
        email: 'olivia.pope@student.edu',
        password: studentPassword,
        firstName: 'Olivia',
        lastName: 'Pope',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567825',
      },
    }),
    prisma.user.create({
      data: {
        email: 'peter.parker@student.edu',
        password: studentPassword,
        firstName: 'Peter',
        lastName: 'Parker',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567826',
      },
    }),
    prisma.user.create({
      data: {
        email: 'quinn.fabray@student.edu',
        password: studentPassword,
        firstName: 'Quinn',
        lastName: 'Fabray',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567827',
      },
    }),
    prisma.user.create({
      data: {
        email: 'rachel.green@student.edu',
        password: studentPassword,
        firstName: 'Rachel',
        lastName: 'Green',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567828',
      },
    }),
    prisma.user.create({
      data: {
        email: 'steve.rogers@student.edu',
        password: studentPassword,
        firstName: 'Steve',
        lastName: 'Rogers',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567829',
      },
    }),
    prisma.user.create({
      data: {
        email: 'tony.stark@student.edu',
        password: studentPassword,
        firstName: 'Tony',
        lastName: 'Stark',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567830',
      },
    }),
    // Additional students for larger dataset
    prisma.user.create({
      data: {
        email: 'sarah.connor@student.edu',
        password: studentPassword,
        firstName: 'Sarah',
        lastName: 'Connor',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567831',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bruce.wayne@student.edu',
        password: studentPassword,
        firstName: 'Bruce',
        lastName: 'Wayne',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567832',
      },
    }),
    prisma.user.create({
      data: {
        email: 'clark.kent@student.edu',
        password: studentPassword,
        firstName: 'Clark',
        lastName: 'Kent',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567833',
      },
    }),
    prisma.user.create({
      data: {
        email: 'natasha.romanoff@student.edu',
        password: studentPassword,
        firstName: 'Natasha',
        lastName: 'Romanoff',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567834',
      },
    }),
    prisma.user.create({
      data: {
        email: 'wanda.maximoff@student.edu',
        password: studentPassword,
        firstName: 'Wanda',
        lastName: 'Maximoff',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567835',
      },
    }),
    prisma.user.create({
      data: {
        email: 'thor.odinson@student.edu',
        password: studentPassword,
        firstName: 'Thor',
        lastName: 'Odinson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567836',
      },
    }),
    prisma.user.create({
      data: {
        email: 'scott.lang@student.edu',
        password: studentPassword,
        firstName: 'Scott',
        lastName: 'Lang',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567837',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol.danvers@student.edu',
        password: studentPassword,
        firstName: 'Carol',
        lastName: 'Danvers',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567838',
      },
    }),
    prisma.user.create({
      data: {
        email: 'stephen.strange@student.edu',
        password: studentPassword,
        firstName: 'Stephen',
        lastName: 'Strange',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567839',
      },
    }),
    prisma.user.create({
      data: {
        email: 'vision.android@student.edu',
        password: studentPassword,
        firstName: 'Vision',
        lastName: 'Android',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567840',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sam.wilson@student.edu',
        password: studentPassword,
        firstName: 'Sam',
        lastName: 'Wilson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567841',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bucky.barnes@student.edu',
        password: studentPassword,
        firstName: 'Bucky',
        lastName: 'Barnes',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567842',
      },
    }),
    prisma.user.create({
      data: {
        email: 'wade.wilson@student.edu',
        password: studentPassword,
        firstName: 'Wade',
        lastName: 'Wilson',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567843',
      },
    }),
    prisma.user.create({
      data: {
        email: 'logan.howlett@student.edu',
        password: studentPassword,
        firstName: 'Logan',
        lastName: 'Howlett',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567844',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jean.grey@student.edu',
        password: studentPassword,
        firstName: 'Jean',
        lastName: 'Grey',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567845',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ororo.munroe@student.edu',
        password: studentPassword,
        firstName: 'Ororo',
        lastName: 'Munroe',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567846',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kurt.wagner@student.edu',
        password: studentPassword,
        firstName: 'Kurt',
        lastName: 'Wagner',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567847',
      },
    }),
    prisma.user.create({
      data: {
        email: 'remy.lebeau@student.edu',
        password: studentPassword,
        firstName: 'Remy',
        lastName: 'Lebeau',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567848',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kitty.pryde@student.edu',
        password: studentPassword,
        firstName: 'Kitty',
        lastName: 'Pryde',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567849',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bobby.drake@student.edu',
        password: studentPassword,
        firstName: 'Bobby',
        lastName: 'Drake',
        role: UserRole.STUDENT,
        emailVerified: true,
        phoneNumber: '+1234567850',
      },
    }),
  ]);
  console.log(`👥 Created ${students.length} students`);

  // Create comprehensive course data
  const courses = [
    // Computer Science Courses
    {
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science including programming basics, data structures, and algorithms.',
      ownerId: instructors[0].id,
      settings: {
        gpsRadius: 50,
        allowLateEntry: true,
        lateEntryMinutes: 15,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 120,
      },
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-15'),
    },
    {
      name: 'Data Structures and Algorithms',
      description: 'Advanced study of data structures, algorithm design, and complexity analysis.',
      ownerId: instructors[0].id,
      settings: {
        gpsRadius: 75,
        allowLateEntry: false,
        lateEntryMinutes: 10,
        requireSelfie: true,
        autoEndSession: true,
        autoEndMinutes: 150,
      },
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-06-20'),
    },
    {
      name: 'Web Development Fundamentals',
      description: 'Full-stack web development using HTML, CSS, JavaScript, Node.js, and databases.',
      ownerId: instructors[1].id,
      settings: {
        gpsRadius: 60,
        allowLateEntry: true,
        lateEntryMinutes: 20,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 180,
      },
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-01'),
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application development using React Native and Flutter.',
      ownerId: instructors[1].id,
      settings: {
        gpsRadius: 40,
        allowLateEntry: true,
        lateEntryMinutes: 10,
        requireSelfie: true,
        autoEndSession: false,
        autoEndMinutes: 90,
      },
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-07-10'),
    },
    // Engineering Courses
    {
      name: 'Engineering Mathematics',
      description: 'Mathematical foundations for engineering including calculus, linear algebra, and differential equations.',
      ownerId: instructors[2].id,
      settings: {
        gpsRadius: 45,
        allowLateEntry: false,
        lateEntryMinutes: 5,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 100,
      },
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-05-30'),
    },
    {
      name: 'Mechanical Engineering Design',
      description: 'Principles of mechanical design, CAD modeling, and engineering analysis.',
      ownerId: instructors[2].id,
      settings: {
        gpsRadius: 80,
        allowLateEntry: true,
        lateEntryMinutes: 15,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 200,
      },
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-07-15'),
    },
    // Business Courses
    {
      name: 'Business Analytics',
      description: 'Data-driven decision making using statistical analysis and business intelligence tools.',
      ownerId: instructors[3].id,
      settings: {
        gpsRadius: 55,
        allowLateEntry: true,
        lateEntryMinutes: 20,
        requireSelfie: true,
        autoEndSession: true,
        autoEndMinutes: 135,
      },
      startDate: new Date('2025-01-25'),
      endDate: new Date('2025-06-25'),
    },
    {
      name: 'Digital Marketing Strategy',
      description: 'Modern digital marketing techniques including SEO, social media, and content marketing.',
      ownerId: instructors[3].id,
      settings: {
        gpsRadius: 70,
        allowLateEntry: true,
        lateEntryMinutes: 25,
        requireSelfie: false,
        autoEndSession: true,
        autoEndMinutes: 110,
      },
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-08-01'),
    },
    // Advanced Courses
    {
      name: 'Machine Learning and AI',
      description: 'Advanced machine learning algorithms, neural networks, and artificial intelligence applications.',
      ownerId: instructors[4].id,
      settings: {
        gpsRadius: 35,
        allowLateEntry: false,
        lateEntryMinutes: 5,
        requireSelfie: true,
        autoEndSession: true,
        autoEndMinutes: 180,
      },
      startDate: new Date('2025-02-20'),
      endDate: new Date('2025-07-20'),
    },
    {
      name: 'Cybersecurity Fundamentals',
      description: 'Network security, cryptography, ethical hacking, and security risk management.',
      ownerId: instructors[4].id,
      settings: {
        gpsRadius: 30,
        allowLateEntry: false,
        lateEntryMinutes: 0,
        requireSelfie: true,
        autoEndSession: true,
        autoEndMinutes: 120,
      },
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-08-15'),
    },
  ];

  // Create courses with unique codes
  const createdCourses: Course[] = [];
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        code: await generateUniqueCourseCode(),
      },
    });
    createdCourses.push(course);
    console.log(`📚 Created course: ${course.name} (${course.code})`);
  }

  // Enroll instructors as owners and students in courses
  const enrollmentData: Array<{
    courseId: string;
    userId: string;
    role: CourseRole;
  }> = [];
  
  // Add instructors as owners
  for (const course of createdCourses) {
    enrollmentData.push({
      courseId: course.id,
      userId: course.ownerId,
      role: CourseRole.OWNER,
    });
  }

  // Computer Science courses - students 0-9
  const csStudents = students.slice(0, 10);
  for (const student of csStudents) {
    // Enroll in CS courses (first 4 courses)
    for (let i = 0; i < 4; i++) {
      enrollmentData.push({
        courseId: createdCourses[i].id,
        userId: student.id,
        role: CourseRole.PARTICIPANT,
      });
    }
  }

  // Engineering courses - students 10-14
  const engStudents = students.slice(10, 15);
  for (const student of engStudents) {
    // Enroll in Engineering courses (courses 4-5)
    for (let i = 4; i < 6; i++) {
      enrollmentData.push({
        courseId: createdCourses[i].id,
        userId: student.id,
        role: CourseRole.PARTICIPANT,
      });
    }
    // Also enroll in some CS courses for cross-discipline learning
    for (let i = 0; i < 2; i++) {
      enrollmentData.push({
        courseId: createdCourses[i].id,
        userId: student.id,
        role: CourseRole.PARTICIPANT,
      });
    }
  }

  // Business courses - students 15-19
  const busStudents = students.slice(15, 20);
  for (const student of busStudents) {
    // Enroll in Business courses (courses 6-7)
    for (let i = 6; i < 8; i++) {
      enrollmentData.push({
        courseId: createdCourses[i].id,
        userId: student.id,
        role: CourseRole.PARTICIPANT,
      });
    }
    // Also enroll in web development
    enrollmentData.push({
      courseId: createdCourses[2].id,
      userId: student.id,
      role: CourseRole.PARTICIPANT,
    });
  }

  // Advanced courses - top students from each group
  const advancedStudents = [
    ...csStudents.slice(0, 3),
    ...engStudents.slice(0, 2),
    ...busStudents.slice(0, 2),
  ];
  for (const student of advancedStudents) {
    // Enroll in advanced courses (courses 8-9)
    for (let i = 8; i < 10; i++) {
      enrollmentData.push({
        courseId: createdCourses[i].id,
        userId: student.id,
        role: CourseRole.PARTICIPANT,
      });
    }
  }

  await prisma.courseMember.createMany({
    data: enrollmentData,
  });
  console.log(`👥 Created ${enrollmentData.length} course enrollments`);

  // Create comprehensive session data
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const sessionTemplates = [
    'Introduction and Overview',
    'Fundamental Concepts',
    'Practical Applications',
    'Advanced Topics',
    'Laboratory Session',
    'Project Workshop',
    'Review and Q&A',
    'Midterm Assessment',
    'Case Study Analysis',
    'Final Project Presentation',
  ];

  const sessions: Session[] = [];
  for (let courseIndex = 0; courseIndex < createdCourses.length; courseIndex++) {
    const course = createdCourses[courseIndex];
    const instructor = instructors.find(i => i.id === course.ownerId)!;
    
    // Create 6-8 sessions per course
    const sessionCount = 6 + Math.floor(Math.random() * 3);
    
    for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex++) {
      const coords = randomCoordinates();
      const sessionDate = randomDate(oneWeekAgo, oneWeekFromNow);
      const startTime = new Date(sessionDate);
      startTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      const endTime = new Date(startTime.getTime() + (90 + Math.floor(Math.random() * 60)) * 60 * 1000);
      
      const session = await prisma.session.create({
        data: {
          courseId: course.id,
          createdById: instructor.id,
          name: `${sessionTemplates[sessionIndex % sessionTemplates.length]} - ${sessionIndex + 1}`,
          description: `Session ${sessionIndex + 1} for ${course.name}`,
          startTime,
          endTime,
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusMeters: (course.settings as any).gpsRadius || 50,
          locationName: `Room ${100 + sessionIndex}, ${['Computer Science Building', 'Engineering Hall', 'Business Center', 'Technology Lab', 'Innovation Hub'][courseIndex % 5]}`,
          isActive: sessionDate > now,
          allowLateEntry: (course.settings as any).allowLateEntry || true,
          lateMinutes: (course.settings as any).lateEntryMinutes || 15,
          requireSelfie: (course.settings as any).requireSelfie || false,
          startedAt: sessionDate <= now ? startTime : null,
          endedAt: sessionDate <= now ? endTime : null,
        },
      });
      sessions.push(session);
    }
  }
  console.log(`📅 Created ${sessions.length} sessions`);

  // Create attendance records for past sessions
  const pastSessions = sessions.filter(s => s.startedAt && s.endedAt);
  const attendanceStatuses = [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT];
  const devices = [
    { platform: 'ios', model: 'iPhone 14', osVersion: '16.0' },
    { platform: 'ios', model: 'iPhone 13', osVersion: '15.5' },
    { platform: 'android', model: 'Pixel 7', osVersion: '13.0' },
    { platform: 'android', model: 'Samsung Galaxy S23', osVersion: '13.0' },
    { platform: 'android', model: 'OnePlus 10', osVersion: '12.0' },
  ];

  const attendanceRecords: Array<{
    sessionId: string;
    userId: string;
    markedAt: Date;
    latitude: number;
    longitude: number;
    status: AttendanceStatus;
    distanceFromSession: number;
    ipAddress: string;
    deviceInfo: any;
  }> = [];
  for (const session of pastSessions) {
    // Get course members for this session
    const courseMembers = await prisma.courseMember.findMany({
      where: { courseId: session.courseId, role: CourseRole.PARTICIPANT },
      include: { user: true },
    });

    for (const member of courseMembers) {
      // 85% chance of attendance
      if (Math.random() < 0.85) {
        const status = attendanceStatuses[Math.floor(Math.random() * 2)]; // More likely to be present or late than absent
        const coords = randomCoordinates();
        const device = devices[Math.floor(Math.random() * devices.length)];
        
        let markedAt = new Date(session.startTime);
        if (status === AttendanceStatus.LATE) {
          markedAt = new Date(session.startTime.getTime() + Math.random() * 30 * 60 * 1000); // Up to 30 minutes late
        } else if (status === AttendanceStatus.PRESENT) {
          markedAt = new Date(session.startTime.getTime() + Math.random() * 10 * 60 * 1000); // Up to 10 minutes after start
        }

        attendanceRecords.push({
          sessionId: session.id,
          userId: member.userId,
          markedAt,
          latitude: coords.latitude,
          longitude: coords.longitude,
          status,
          distanceFromSession: Math.random() * 100, // Random distance up to 100m
          ipAddress: `192.168.1.${100 + Math.floor(Math.random() * 155)}`,
          deviceInfo: {
            ...device,
            appVersion: '1.0.0',
          },
        });
      }
    }
  }

  if (attendanceRecords.length > 0) {
    await prisma.attendance.createMany({
      data: attendanceRecords,
    });
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);
  }

  console.log('🌱 Comprehensive seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@attendance.com / password123');
  console.log('Instructors: prof.anderson@university.edu, dr.martinez@college.edu, etc. / password123');
  console.log('Students: alice.smith@student.edu, bob.johnson@student.edu, etc. / password123');
  console.log('\n📚 Sample Course Codes:');
  for (let i = 0; i < Math.min(5, createdCourses.length); i++) {
    console.log(`${createdCourses[i].name}: ${createdCourses[i].code}`);
  }
  console.log('\n📊 Statistics:');
  console.log(`- ${instructors.length} instructors`);
  console.log(`- ${students.length} students`);
  console.log(`- ${createdCourses.length} courses`);
  console.log(`- ${sessions.length} sessions`);
  console.log(`- ${enrollmentData.length} enrollments`);
  console.log(`- ${attendanceRecords.length} attendance records`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
