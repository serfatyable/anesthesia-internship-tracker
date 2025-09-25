/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Idempotent seed: clear in dev only (safe because we run migrate reset for full wipes)
  // For safety, we avoid hard deletes here; rely on `pnpm db:reset` for wipe+seed.

  // --- USERS ---
  const users = [
    { name: 'Admin Ada', email: 'admin@demo.local', role: 'ADMIN', password: 'admin123' },
    { name: 'Tutor Tali', email: 'tutor@demo.local', role: 'TUTOR', password: 'tutor123' },
    { name: 'Intern Itai', email: 'intern@demo.local', role: 'INTERN', password: 'intern123' },
  ];

  const createdUsers: { id: string; role: string }[] = [];
  for (const u of users) {
    const passwordHash = await hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: passwordHash },
      create: { name: u.name, email: u.email, role: u.role, password: passwordHash },
    });
    createdUsers.push({ id: user.id, role: user.role });
  }

  const admin = createdUsers.find((u) => u.role === 'ADMIN');
  const tutor = createdUsers.find((u) => u.role === 'TUTOR');
  const intern = createdUsers.find((u) => u.role === 'INTERN');
  if (!intern || !tutor || !admin) {
    throw new Error('Seed error: required seed users (intern/tutor/admin) not found');
  }

  // --- ROTATIONS ---
  let icu = await prisma.rotation.findFirst({ where: { name: 'ICU' } });
  if (!icu) {
    icu = await prisma.rotation.create({
      data: { name: 'ICU', description: 'Intensive Care Unit rotation', isActive: true },
    });
  }

  let pacu = await prisma.rotation.findFirst({ where: { name: 'PACU' } });
  if (!pacu) {
    pacu = await prisma.rotation.create({
      data: { name: 'PACU', description: 'Post-Anesthesia Care Unit rotation', isActive: true },
    });
  }

  // --- PROCEDURES (ICU) ---
  const arterialLine = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Arterial Line', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Arterial Line',
      description: 'Radial/femoral arterial cannulation',
      rotationId: icu.id,
    },
  });

  const centralLine = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Central Line', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Central Line',
      description: 'IJ/subclavian/femoral CVC insertion (US-guided)',
      rotationId: icu.id,
    },
  });

  const dlIntubation = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Direct Laryngoscopy Intubation', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Direct Laryngoscopy Intubation',
      description: 'DL ETT placement',
      rotationId: icu.id,
    },
  });

  const vlIntubation = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Video Laryngoscopy Intubation', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Video Laryngoscopy Intubation',
      description: 'VL ETT placement',
      rotationId: icu.id,
    },
  });

  const extubation = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Extubation', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Extubation',
      description: 'Safe planned extubation in ICU',
      rotationId: icu.id,
    },
  });

  const sbt = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Spontaneous Breathing Trial', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Spontaneous Breathing Trial',
      description: 'SBT protocol execution',
      rotationId: icu.id,
    },
  });

  const trachCap = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Tracheostomy Capping Test', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Tracheostomy Capping Test',
      description: 'Assessment for decannulation readiness',
      rotationId: icu.id,
    },
  });

  const ventConnect = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Ventilator Connection', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Ventilator Connection',
      description: 'Connect patient to ventilator & set initial parameters',
      rotationId: icu.id,
    },
  });

  const feedingTubeNasal = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Feeding Tube (Nasal)', rotationId: icu.id } },
    update: {},
    create: { name: 'Feeding Tube (Nasal)', description: 'NG tube insertion', rotationId: icu.id },
  });

  const feedingTubeOral = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Feeding Tube (Oral)', rotationId: icu.id } },
    update: {},
    create: { name: 'Feeding Tube (Oral)', description: 'OG tube insertion', rotationId: icu.id },
  });

  const transportIntubated = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Intubated Patient Transport', rotationId: icu.id } },
    update: {},
    create: {
      name: 'Intubated Patient Transport',
      description: 'Safe intra-hospital transfer of an intubated patient',
      rotationId: icu.id,
    },
  });

  // --- PROCEDURES (PACU) — sample
  const pacuExtubation = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'PACU Extubation', rotationId: pacu.id } },
    update: {},
    create: {
      name: 'PACU Extubation',
      description: 'Criteria-based extubation in PACU',
      rotationId: pacu.id,
    },
  });

  // --- REQUIREMENTS (examples) ---
  const reqsData = [
    { rotationId: icu.id, procedureId: arterialLine.id, minCount: 5 },
    { rotationId: icu.id, procedureId: centralLine.id, minCount: 5 },
    { rotationId: icu.id, procedureId: dlIntubation.id, minCount: 5 },
    { rotationId: icu.id, procedureId: vlIntubation.id, minCount: 3 },
    { rotationId: icu.id, procedureId: extubation.id, minCount: 4 },
    { rotationId: icu.id, procedureId: sbt.id, minCount: 6 },
    { rotationId: icu.id, procedureId: trachCap.id, minCount: 2 },
    { rotationId: icu.id, procedureId: ventConnect.id, minCount: 6 },
    { rotationId: icu.id, procedureId: feedingTubeNasal.id, minCount: 3 },
    { rotationId: icu.id, procedureId: feedingTubeOral.id, minCount: 3 },
    { rotationId: icu.id, procedureId: transportIntubated.id, minCount: 4 },
    { rotationId: pacu.id, procedureId: pacuExtubation.id, minCount: 3 },
  ];

  for (const r of reqsData) {
    await prisma.requirement.upsert({
      where: { rotationId_procedureId: { rotationId: r.rotationId, procedureId: r.procedureId } },
      update: { minCount: r.minCount },
      create: { rotationId: r.rotationId, procedureId: r.procedureId, minCount: r.minCount },
    });
  }

  // --- TOPICS / RESOURCES (minimal skeleton) ---
  let airwayTopic = await prisma.topic.findFirst({
    where: { title: 'Airway Management', parentId: null },
  });
  if (!airwayTopic) {
    airwayTopic = await prisma.topic.create({
      data: { title: 'Airway Management' },
    });
  }

  let vlSub = await prisma.topic.findFirst({
    where: { title: 'Video Laryngoscopy', parentId: airwayTopic.id },
  });
  if (!vlSub) {
    vlSub = await prisma.topic.create({
      data: { title: 'Video Laryngoscopy', parentId: airwayTopic.id },
    });
  }

  const vlResource = await prisma.resource.findFirst({
    where: { title: 'VL How-To (Demo Video)' },
  });
  if (!vlResource) {
    await prisma.resource.create({
      data: {
        topicId: vlSub.id,
        title: 'VL How-To (Demo Video)',
        url: 'https://example.com/vl-demo',
        type: 'VIDEO',
      },
    });
  }

  const sbtResource = await prisma.resource.findFirst({
    where: { title: 'SBT Protocol (Reading)' },
  });
  if (!sbtResource) {
    await prisma.resource.create({
      data: {
        topicId: airwayTopic.id,
        title: 'SBT Protocol (Reading)',
        url: 'https://example.com/sbt-reading',
        type: 'READING',
      },
    });
  }

  // --- SAMPLE LOGS & VERIFICATIONS ---
  const log1 = await prisma.logEntry.create({
    data: {
      internId: intern.id,
      procedureId: arterialLine.id,
      date: new Date(), // Asia/Jerusalem local date will be rendered in UI later
      count: 1,
      notes: 'Radial line, US-guided, no complications',
    },
  });

  await prisma.verification.create({
    data: {
      logEntryId: log1.id,
      verifierId: tutor.id,
      status: 'APPROVED',
      timestamp: new Date(),
      reason: 'Technique satisfactory',
    },
  });

  const log2 = await prisma.logEntry.create({
    data: {
      internId: intern.id,
      procedureId: vlIntubation.id,
      date: new Date(),
      count: 1,
      notes: 'VL with hyperangulated blade, grade I view',
    },
  });

  await prisma.verification.create({
    data: {
      logEntryId: log2.id,
      verifierId: tutor.id,
      status: 'PENDING',
      timestamp: new Date(),
    },
  });

  // --- AUDIT EXAMPLE ---
  await prisma.audit.create({
    data: {
      actorUserId: admin.id,
      action: 'SEED_INITIAL_DATA',
      entity: 'SYSTEM',
      entityId: '0',
      timestamp: new Date(),
      details: 'Initial seed executed',
    },
  });

  console.log('✅ Seed completed');
  console.log('Demo users created:');
  console.log('  admin@demo.local / admin123 (ADMIN)');
  console.log('  tutor@demo.local / tutor123 (TUTOR)');
  console.log('  intern@demo.local / intern123 (INTERN)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
