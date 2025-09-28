/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal seed...');

  // Create minimal users
  const users = [
    {
      name: 'Admin Ada',
      email: 'admin@demo.local',
      role: 'ADMIN',
      password: 'admin123',
      idNumber: 'ADM001',
    },
    {
      name: 'Intern Itai',
      email: 'intern@demo.local',
      role: 'INTERN',
      password: 'intern123',
      idNumber: 'INT001',
    },
  ];

  for (const u of users) {
    const passwordHash = await hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: passwordHash, idNumber: u.idNumber },
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        password: passwordHash,
        idNumber: u.idNumber,
      },
    });
  }

  // Create one simple rotation
  let icu = await prisma.rotation.findFirst({ where: { name: 'ICU' } });
  if (!icu) {
    icu = await prisma.rotation.create({
      data: {
        name: 'ICU',
        description: 'Intensive Care Unit rotation',
        isActive: true,
        state: 'ACTIVE',
      },
    });
  }

  // Create one simple procedure
  const arterialLine = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Arterial Line', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Arterial Line',
      description: 'Radial/femoral arterial cannulation',
      rotationId: icu.id,
    },
  });

  // Create one simple requirement
  await prisma.requirement.upsert({
    where: { rotationId_procedureId: { rotationId: icu.id, procedureId: arterialLine.id } },
    update: { minCount: 5 },
    create: { rotationId: icu.id, procedureId: arterialLine.id, minCount: 5 },
  });

  console.log('✅ Minimal seed completed');
}

main()
  .catch((e) => {
    console.error('❌ Minimal seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
