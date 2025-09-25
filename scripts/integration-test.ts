import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runIntegrationTest() {
  console.log('🔍 Running integration test...');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');

    // Test 2: Query all major entities
    console.log('2. Testing data queries...');
    const users = await prisma.user.findMany();
    const rotations = await prisma.rotation.findMany();
    const procedures = await prisma.procedure.findMany();
    const requirements = await prisma.requirement.findMany();
    const logs = await prisma.logEntry.findMany();
    const verifications = await prisma.verification.findMany();

    console.log(`   ✅ Found ${users.length} users`);
    console.log(`   ✅ Found ${rotations.length} rotations`);
    console.log(`   ✅ Found ${procedures.length} procedures`);
    console.log(`   ✅ Found ${requirements.length} requirements`);
    console.log(`   ✅ Found ${logs.length} log entries`);
    console.log(`   ✅ Found ${verifications.length} verifications`);

    // Test 3: Test relationships
    console.log('3. Testing relationships...');
    const userWithLogs = await prisma.user.findFirst({
      where: { role: 'INTERN' },
      include: {
        logs: {
          include: {
            procedure: true,
            verification: {
              include: {
                verifier: true,
              },
            },
          },
        },
      },
    });

    if (userWithLogs) {
      console.log(
        `   ✅ Found intern "${userWithLogs.name}" with ${userWithLogs.logs.length} logs`,
      );
      if (userWithLogs.logs.length > 0) {
        const log = userWithLogs.logs[0];
        console.log(
          `   ✅ Log entry for "${log?.procedure?.name || 'unknown'}" with ${log?.verification?.status || 'no'} verification`,
        );
      }
    }

    // Test 4: Test rotation-procedure relationships
    const rotationWithProcedures = await prisma.rotation.findFirst({
      include: {
        procedures: true,
        requirements: {
          include: {
            procedure: true,
          },
        },
      },
    });

    if (rotationWithProcedures) {
      console.log(
        `   ✅ Rotation "${rotationWithProcedures.name}" has ${rotationWithProcedures.procedures.length} procedures`,
      );
      console.log(`   ✅ Rotation has ${rotationWithProcedures.requirements.length} requirements`);
    }

    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Rotations: ${rotations.length}`);
    console.log(`   - Procedures: ${procedures.length}`);
    console.log(`   - Requirements: ${requirements.length}`);
    console.log(`   - Log entries: ${logs.length}`);
    console.log(`   - Verifications: ${verifications.length}`);
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTest();
