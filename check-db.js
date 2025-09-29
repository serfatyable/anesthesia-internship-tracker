import { PrismaClient } from '@prisma/client';

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking database connection...');

    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true, name: true },
      });
      console.log('👥 Users in database:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
      });
    }

    // Check rotations
    const rotationCount = await prisma.rotation.count();
    console.log(`🏥 Total rotations: ${rotationCount}`);

    // Check procedures
    const procedureCount = await prisma.procedure.count();
    console.log(`⚕️ Total procedures: ${procedureCount}`);

    // Check log entries
    const logCount = await prisma.logEntry.count();
    console.log(`📝 Total log entries: ${logCount}`);

    console.log('✅ Database check complete');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
