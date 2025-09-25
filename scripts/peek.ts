import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.count();
  const rotations = await prisma.rotation.count();
  const procedures = await prisma.procedure.count();
  const reqs = await prisma.requirement.count();
  const logs = await prisma.logEntry.count();
  const verifs = await prisma.verification.count();
  console.log({ users, rotations, procedures, reqs, logs, verifs });
}
run().finally(() => prisma.$disconnect());
