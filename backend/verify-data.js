const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const sessionCount = await prisma.session.count();
    const attendanceCount = await prisma.attendance.count();
    
    console.log('✅ Database verification:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📚 Courses: ${courseCount}`);
    console.log(`📅 Sessions: ${sessionCount}`);
    console.log(`✅ Attendance Records: ${attendanceCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkData();
