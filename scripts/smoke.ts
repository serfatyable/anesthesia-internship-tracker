// scripts/smoke.ts
async function smokeTest() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  console.log(`🧪 Running smoke test against ${baseUrl}`);

  try {
    // Test NextAuth session endpoint
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    console.log(`📡 GET /api/auth/session: ${sessionResponse.status}`);

    if (sessionResponse.status === 200) {
      const sessionData = await sessionResponse.json();
      console.log(
        `✅ Session endpoint working (user: ${sessionData?.user?.email || 'anonymous'})`
      );
    } else {
      console.log(
        `❌ Session endpoint failed with status ${sessionResponse.status}`
      );
    }

    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`📡 GET /health: ${healthResponse.status}`);

    // Test procedures endpoint
    const proceduresResponse = await fetch(`${baseUrl}/api/procedures`);
    console.log(`📡 GET /api/procedures: ${proceduresResponse.status}`);

    console.log('\n🎯 Manual verification steps:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Sign in as intern@demo.local / intern123');
    console.log('3. Navigate to /logs/new and create a log');
    console.log('4. Check /logs to see PENDING status');
    console.log('5. Sign in as tutor@demo.local / tutor123');
    console.log('6. Go to /verify and approve the log');
    console.log('7. Sign back in as intern to see APPROVED status');
  } catch (error) {
    console.error('❌ Smoke test failed:', error);
    process.exit(1);
  }
}

smokeTest();
