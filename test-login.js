import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

async function testLogin() {
  const prisma = new PrismaClient();

  try {
    console.log('🔐 Testing login functionality...');

    // Test with intern credentials
    const email = 'intern@demo.local';
    const password = 'intern123';

    console.log(`📧 Testing login for: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user.role})`);

    if (!user.password) {
      console.log('❌ User has no password');
      return;
    }

    console.log('🔑 Testing password verification...');
    const isValid = await compare(password, user.password);

    if (isValid) {
      console.log('✅ Password is valid - login should work!');
    } else {
      console.log('❌ Password is invalid');
    }
  } catch (error) {
    console.error('❌ Login test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
