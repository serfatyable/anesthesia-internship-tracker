/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Idempotent seed: clear in dev only (safe because we run migrate reset for full wipes)
  // For safety, we avoid hard deletes here; rely on `pnpm db:reset` for wipe+seed.

  // --- USERS ---
  const users = [
    {
      name: 'Admin Ada',
      email: 'admin@demo.local',
      role: 'ADMIN',
      password: 'admin123',
      idNumber: 'ADM001',
    },
    {
      name: 'Tutor Tali',
      email: 'tutor@demo.local',
      role: 'TUTOR',
      password: 'tutor123',
      idNumber: 'TUT001',
    },
    {
      name: 'Intern Itai',
      email: 'intern@demo.local',
      role: 'INTERN',
      password: 'intern123',
      idNumber: 'INT001',
    },
    {
      name: 'Intern Sarah',
      email: 'sarah@demo.local',
      role: 'INTERN',
      password: 'intern123',
      idNumber: 'INT002',
    },
    {
      name: 'Intern David',
      email: 'david@demo.local',
      role: 'INTERN',
      password: 'intern123',
      idNumber: 'INT003',
    },
  ];

  const createdUsers: { id: string; role: string }[] = [];
  for (const u of users) {
    const passwordHash = await hash(u.password, 12);
    const user = await prisma.user.upsert({
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
    createdUsers.push({ id: user.id, role: user.role });
  }

  const admin = createdUsers.find((u) => u.role === 'ADMIN');
  const tutor = createdUsers.find((u) => u.role === 'TUTOR');
  const interns = createdUsers.filter((u) => u.role === 'INTERN');
  if (interns.length === 0 || !tutor || !admin) {
    throw new Error('Seed error: required seed users (interns/tutor/admin) not found');
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

  let or = await prisma.rotation.findFirst({ where: { name: 'Operating Room' } });
  if (!or) {
    or = await prisma.rotation.create({
      data: { name: 'Operating Room', description: 'Main OR rotation', isActive: true },
    });
  }

  // Additional rotations with different states
  let obgyn = await prisma.rotation.findFirst({ where: { name: 'OBGYN' } });
  if (!obgyn) {
    obgyn = await prisma.rotation.create({
      data: {
        name: 'OBGYN',
        description: 'Obstetrics and Gynecology rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let pain = await prisma.rotation.findFirst({ where: { name: 'Pain' } });
  if (!pain) {
    pain = await prisma.rotation.create({
      data: {
        name: 'Pain',
        description: 'Pain Management rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let blockRoom = await prisma.rotation.findFirst({ where: { name: 'Block Room' } });
  if (!blockRoom) {
    blockRoom = await prisma.rotation.create({
      data: {
        name: 'Block Room',
        description: 'Regional Anesthesia Block Room rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let neuro = await prisma.rotation.findFirst({ where: { name: 'Neuro' } });
  if (!neuro) {
    neuro = await prisma.rotation.create({
      data: {
        name: 'Neuro',
        description: 'Neuroanesthesia rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let cardio = await prisma.rotation.findFirst({ where: { name: 'Cardio' } });
  if (!cardio) {
    cardio = await prisma.rotation.create({
      data: {
        name: 'Cardio',
        description: 'Cardiothoracic Anesthesia rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let elective1 = await prisma.rotation.findFirst({ where: { name: 'Elective 1' } });
  if (!elective1) {
    elective1 = await prisma.rotation.create({
      data: {
        name: 'Elective 1',
        description: 'First elective rotation (intern choice)',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let elective2 = await prisma.rotation.findFirst({ where: { name: 'Elective 2' } });
  if (!elective2) {
    elective2 = await prisma.rotation.create({
      data: {
        name: 'Elective 2',
        description: 'Second elective rotation (intern choice)',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let studyMonth = await prisma.rotation.findFirst({ where: { name: 'Study Month' } });
  if (!studyMonth) {
    studyMonth = await prisma.rotation.create({
      data: {
        name: 'Study Month',
        description: 'Dedicated study period',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  let peds = await prisma.rotation.findFirst({ where: { name: 'Peds' } });
  if (!peds) {
    peds = await prisma.rotation.create({
      data: {
        name: 'Peds',
        description: 'Pediatric Anesthesia rotation',
        isActive: true,
        state: 'NOT_STARTED',
      },
    });
  }

  // Set some rotations to different states for demonstration
  // ICU is currently active
  await prisma.rotation.update({
    where: { id: icu.id },
    data: { state: 'ACTIVE' },
  });

  // PACU is finished
  await prisma.rotation.update({
    where: { id: pacu.id },
    data: { state: 'FINISHED' },
  });

  // Operating Room is finished
  await prisma.rotation.update({
    where: { id: or.id },
    data: { state: 'FINISHED' },
  });

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

  // --- PROCEDURES (PACU) ---
  const pacuExtubation = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'PACU Extubation', rotationId: pacu.id } },
    update: {},
    create: {
      name: 'PACU Extubation',
      description: 'Criteria-based extubation in PACU',
      rotationId: pacu.id,
    },
  });

  const painAssessment = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Pain Assessment', rotationId: pacu.id } },
    update: {},
    create: {
      name: 'Pain Assessment',
      description: 'Post-operative pain evaluation',
      rotationId: pacu.id,
    },
  });

  const nauseaManagement = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Nausea Management', rotationId: pacu.id } },
    update: {},
    create: {
      name: 'Nausea Management',
      description: 'PONV prevention and treatment',
      rotationId: pacu.id,
    },
  });

  // --- PROCEDURES (OR) ---
  const generalAnesthesia = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'General Anesthesia', rotationId: or.id } },
    update: {},
    create: {
      name: 'General Anesthesia',
      description: 'Complete GA induction and maintenance',
      rotationId: or.id,
    },
  });

  const spinalAnesthesia = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Spinal Anesthesia', rotationId: or.id } },
    update: {},
    create: {
      name: 'Spinal Anesthesia',
      description: 'Subarachnoid block placement',
      rotationId: or.id,
    },
  });

  const epiduralAnesthesia = await prisma.procedure.upsert({
    where: { rotationId_name: { name: 'Epidural Anesthesia', rotationId: or.id } },
    update: {},
    create: {
      name: 'Epidural Anesthesia',
      description: 'Epidural space catheter placement',
      rotationId: or.id,
    },
  });

  // --- REQUIREMENTS (examples) ---
  const reqsData = [
    // ICU Requirements
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
    // PACU Requirements
    { rotationId: pacu.id, procedureId: pacuExtubation.id, minCount: 3 },
    { rotationId: pacu.id, procedureId: painAssessment.id, minCount: 8 },
    { rotationId: pacu.id, procedureId: nauseaManagement.id, minCount: 5 },
    // OR Requirements
    { rotationId: or.id, procedureId: generalAnesthesia.id, minCount: 10 },
    { rotationId: or.id, procedureId: spinalAnesthesia.id, minCount: 4 },
    { rotationId: or.id, procedureId: epiduralAnesthesia.id, minCount: 3 },
  ];

  for (const r of reqsData) {
    await prisma.requirement.upsert({
      where: { rotationId_procedureId: { rotationId: r.rotationId, procedureId: r.procedureId } },
      update: { minCount: r.minCount },
      create: { rotationId: r.rotationId, procedureId: r.procedureId, minCount: r.minCount },
    });
  }

  // Add random requirements for new rotations (for illustration)
  const newRotationReqs = [
    // OBGYN - 8 procedures
    { rotationId: obgyn.id, procedureId: arterialLine.id, minCount: 3 },
    { rotationId: obgyn.id, procedureId: centralLine.id, minCount: 2 },
    { rotationId: obgyn.id, procedureId: dlIntubation.id, minCount: 4 },
    { rotationId: obgyn.id, procedureId: vlIntubation.id, minCount: 2 },
    { rotationId: obgyn.id, procedureId: extubation.id, minCount: 3 },
    { rotationId: obgyn.id, procedureId: sbt.id, minCount: 2 },
    { rotationId: obgyn.id, procedureId: trachCap.id, minCount: 1 },
    { rotationId: obgyn.id, procedureId: ventConnect.id, minCount: 3 },

    // Pain - 6 procedures
    { rotationId: pain.id, procedureId: arterialLine.id, minCount: 2 },
    { rotationId: pain.id, procedureId: centralLine.id, minCount: 3 },
    { rotationId: pain.id, procedureId: dlIntubation.id, minCount: 2 },
    { rotationId: pain.id, procedureId: vlIntubation.id, minCount: 1 },
    { rotationId: pain.id, procedureId: extubation.id, minCount: 2 },
    { rotationId: pain.id, procedureId: sbt.id, minCount: 1 },

    // Block Room - 5 procedures
    { rotationId: blockRoom.id, procedureId: arterialLine.id, minCount: 4 },
    { rotationId: blockRoom.id, procedureId: centralLine.id, minCount: 3 },
    { rotationId: blockRoom.id, procedureId: dlIntubation.id, minCount: 2 },
    { rotationId: blockRoom.id, procedureId: vlIntubation.id, minCount: 2 },
    { rotationId: blockRoom.id, procedureId: extubation.id, minCount: 3 },

    // Neuro - 7 procedures
    { rotationId: neuro.id, procedureId: arterialLine.id, minCount: 5 },
    { rotationId: neuro.id, procedureId: centralLine.id, minCount: 4 },
    { rotationId: neuro.id, procedureId: dlIntubation.id, minCount: 3 },
    { rotationId: neuro.id, procedureId: vlIntubation.id, minCount: 2 },
    { rotationId: neuro.id, procedureId: extubation.id, minCount: 4 },
    { rotationId: neuro.id, procedureId: sbt.id, minCount: 3 },
    { rotationId: neuro.id, procedureId: ventConnect.id, minCount: 4 },

    // Cardio - 9 procedures
    { rotationId: cardio.id, procedureId: arterialLine.id, minCount: 6 },
    { rotationId: cardio.id, procedureId: centralLine.id, minCount: 5 },
    { rotationId: cardio.id, procedureId: dlIntubation.id, minCount: 4 },
    { rotationId: cardio.id, procedureId: vlIntubation.id, minCount: 3 },
    { rotationId: cardio.id, procedureId: extubation.id, minCount: 5 },
    { rotationId: cardio.id, procedureId: sbt.id, minCount: 4 },
    { rotationId: cardio.id, procedureId: trachCap.id, minCount: 2 },
    { rotationId: cardio.id, procedureId: ventConnect.id, minCount: 5 },
    { rotationId: cardio.id, procedureId: feedingTubeNasal.id, minCount: 2 },

    // Elective 1 - 4 procedures
    { rotationId: elective1.id, procedureId: arterialLine.id, minCount: 2 },
    { rotationId: elective1.id, procedureId: centralLine.id, minCount: 2 },
    { rotationId: elective1.id, procedureId: dlIntubation.id, minCount: 2 },
    { rotationId: elective1.id, procedureId: vlIntubation.id, minCount: 1 },

    // Elective 2 - 4 procedures
    { rotationId: elective2.id, procedureId: arterialLine.id, minCount: 2 },
    { rotationId: elective2.id, procedureId: centralLine.id, minCount: 2 },
    { rotationId: elective2.id, procedureId: dlIntubation.id, minCount: 2 },
    { rotationId: elective2.id, procedureId: vlIntubation.id, minCount: 1 },

    // Study Month - 0 procedures (study only)

    // Peds - 6 procedures
    { rotationId: peds.id, procedureId: arterialLine.id, minCount: 3 },
    { rotationId: peds.id, procedureId: centralLine.id, minCount: 2 },
    { rotationId: peds.id, procedureId: dlIntubation.id, minCount: 4 },
    { rotationId: peds.id, procedureId: vlIntubation.id, minCount: 3 },
    { rotationId: peds.id, procedureId: extubation.id, minCount: 3 },
    { rotationId: peds.id, procedureId: sbt.id, minCount: 2 },
  ];

  for (const r of newRotationReqs) {
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
  // Helper function to create logs with verifications
  const createLogWithVerification = async (
    internId: string,
    procedureId: string,
    count: number,
    notes: string,
    status: 'APPROVED' | 'PENDING' | 'REJECTED' = 'APPROVED',
    daysAgo: number = 0,
  ) => {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - daysAgo);

    const log = await prisma.logEntry.create({
      data: {
        internId,
        procedureId,
        date: logDate,
        count,
        notes,
      },
    });

    if (status !== 'PENDING') {
      await prisma.verification.create({
        data: {
          logEntryId: log.id,
          verifierId: tutor.id,
          status,
          timestamp: new Date(),
          reason: status === 'APPROVED' ? 'Technique satisfactory' : 'Needs improvement',
        },
      });
    } else {
      await prisma.verification.create({
        data: {
          logEntryId: log.id,
          verifierId: tutor.id,
          status: 'PENDING',
          timestamp: new Date(),
        },
      });
    }
  };

  // Create comprehensive log data for all interns
  const allProcedures = [
    { procedure: arterialLine, count: 3, notes: 'Radial line, US-guided, no complications' },
    { procedure: centralLine, count: 2, notes: 'IJ approach, US-guided, successful' },
    { procedure: dlIntubation, count: 4, notes: 'Grade I view, successful intubation' },
    { procedure: vlIntubation, count: 2, notes: 'VL with hyperangulated blade, grade I view' },
    { procedure: extubation, count: 3, notes: 'Safe extubation, no complications' },
    { procedure: sbt, count: 5, notes: 'SBT protocol executed successfully' },
    { procedure: ventConnect, count: 4, notes: 'Ventilator parameters set appropriately' },
    { procedure: pacuExtubation, count: 2, notes: 'PACU extubation criteria met' },
    { procedure: painAssessment, count: 6, notes: 'Comprehensive pain evaluation' },
    { procedure: generalAnesthesia, count: 7, notes: 'Complete GA induction and maintenance' },
    { procedure: spinalAnesthesia, count: 2, notes: 'Successful subarachnoid block' },
  ];

  // Create logs for first intern (Itai) - mix of approved, pending, and rejected
  for (let i = 0; i < allProcedures.length; i++) {
    const item = allProcedures[i];
    if (!item) continue;
    const { procedure, count, notes } = item;
    const status = i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'REJECTED' : 'APPROVED';
    await createLogWithVerification(interns[0]?.id || '', procedure.id, count, notes, status, i);
  }

  // Create logs for second intern (Sarah) - mostly approved
  for (let i = 0; i < allProcedures.length; i++) {
    const item = allProcedures[i];
    if (!item) continue;
    const { procedure, count, notes } = item;
    const status = i % 4 === 0 ? 'PENDING' : 'APPROVED';
    await createLogWithVerification(
      interns[1]?.id || '',
      procedure.id,
      count,
      notes,
      status,
      i + 1,
    );
  }

  // Create logs for third intern (David) - mostly pending
  for (let i = 0; i < allProcedures.length; i++) {
    const item = allProcedures[i];
    if (!item) continue;
    const { procedure, count, notes } = item;
    const status = i % 2 === 0 ? 'PENDING' : 'APPROVED';
    await createLogWithVerification(
      interns[2]?.id || '',
      procedure.id,
      count,
      notes,
      status,
      i + 2,
    );
  }

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
  console.log('  sarah@demo.local / intern123 (INTERN)');
  console.log('  david@demo.local / intern123 (INTERN)');
  console.log('Created 3 rotations: ICU, PACU, Operating Room');
  console.log('Created comprehensive log entries with mixed verification statuses');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
