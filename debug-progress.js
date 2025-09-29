import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugProgress() {
  try {
    // Get the first intern
    const intern = await prisma.user.findFirst({
      where: { role: 'INTERN' },
    });

    if (!intern) {
      console.log('No intern found');
      return;
    }

    console.log(`Testing with intern: ${intern.name} (${intern.email})`);

    // Test the rotation query directly
    const rotations = await prisma.rotation.findMany({
      include: {
        requirements: {
          include: {
            procedure: true,
          },
        },
      },
    });

    console.log('\nRotations from database:');
    rotations.forEach((rotation, index) => {
      console.log(
        `${index + 1}. ${rotation.name} (State: ${rotation.state}, Requirements: ${rotation.requirements.length})`
      );
    });

    console.log(`\nTotal rotations in database: ${rotations.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProgress();
