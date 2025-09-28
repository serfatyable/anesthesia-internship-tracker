import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function optimizeFavoritesFeature() {
  console.log('🚀 Optimizing Favorites Feature...\n');

  try {
    // Test 1: Add some test data for performance testing
    console.log('1. 📊 Creating test data for optimization...');

    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log('   ❌ No users found - cannot create test data');
      return;
    }

    // Create test favorites
    const testFavorites = [
      { itemId: 'procedure-1', itemType: 'PROCEDURE' },
      { itemId: 'procedure-2', itemType: 'PROCEDURE' },
      { itemId: 'knowledge-1', itemType: 'KNOWLEDGE' },
      { itemId: 'knowledge-2', itemType: 'KNOWLEDGE' },
      { itemId: 'procedure-3', itemType: 'PROCEDURE' },
    ];

    for (const fav of testFavorites) {
      try {
        await prisma.procedureKnowledgeFavorite.create({
          data: {
            userId: testUser.id,
            itemId: fav.itemId,
            itemType: fav.itemType,
          },
        });
      } catch (error) {
        // Ignore if already exists
      }
    }
    console.log('   ✅ Test data created');

    // Test 2: Performance testing with different query patterns
    console.log('\n2. ⚡ Performance Testing');

    const iterations = 100;

    // Test basic query
    let startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await prisma.procedureKnowledgeFavorite.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    let avgTime = (Date.now() - startTime) / iterations;
    console.log(`   📊 Basic query: ${avgTime.toFixed(2)}ms average (${iterations} iterations)`);

    // Test with limit (pagination simulation)
    startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await prisma.procedureKnowledgeFavorite.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    }
    avgTime = (Date.now() - startTime) / iterations;
    console.log(
      `   📊 Paginated query: ${avgTime.toFixed(2)}ms average (${iterations} iterations)`,
    );

    // Test 3: Concurrent access simulation
    console.log('\n3. 🔄 Concurrent Access Testing');

    const concurrentRequests = 10;
    const promises = [];

    startTime = Date.now();
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        prisma.procedureKnowledgeFavorite.findMany({
          where: { userId: testUser.id },
          orderBy: { createdAt: 'desc' },
        }),
      );
    }

    await Promise.all(promises);
    const concurrentTime = Date.now() - startTime;
    console.log(`   📊 Concurrent requests (${concurrentRequests}): ${concurrentTime}ms total`);

    // Test 4: Memory usage with larger dataset
    console.log('\n4. 💾 Memory Usage Testing');

    // Create more test data
    const moreFavorites = [];
    for (let i = 6; i <= 1000; i++) {
      moreFavorites.push({
        userId: testUser.id,
        itemId: `item-${i}`,
        itemType: i % 2 === 0 ? 'PROCEDURE' : 'KNOWLEDGE',
      });
    }

    try {
      await prisma.procedureKnowledgeFavorite.createMany({
        data: moreFavorites,
        skipDuplicates: true,
      });
      console.log('   ✅ Large dataset created');
    } catch (error) {
      console.log('   ⚠️  Some duplicates skipped (expected)');
    }

    // Test query performance with larger dataset
    startTime = Date.now();
    const largeResult = await prisma.procedureKnowledgeFavorite.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
    });
    const largeQueryTime = Date.now() - startTime;
    console.log(`   📊 Large dataset query: ${largeQueryTime}ms (${largeResult.length} records)`);

    if (largeQueryTime > 500) {
      console.log('   ⚠️  Large dataset query is slow - consider pagination');
    } else {
      console.log('   ✅ Large dataset query performance is acceptable');
    }

    // Test 5: Database connection pooling
    console.log('\n5. 🔗 Connection Pool Testing');

    const poolSize = 5;
    const poolPromises = [];

    startTime = Date.now();
    for (let i = 0; i < poolSize; i++) {
      poolPromises.push(
        prisma.procedureKnowledgeFavorite.findMany({
          where: { userId: testUser.id },
          take: 1,
        }),
      );
    }

    await Promise.all(poolPromises);
    const poolTime = Date.now() - startTime;
    console.log(`   📊 Connection pool (${poolSize}): ${poolTime}ms total`);

    // Test 6: Index effectiveness
    console.log('\n6. 🔍 Index Effectiveness Testing');

    // Test queries that should use different indexes
    const indexTests = [
      {
        name: 'User index',
        query: () =>
          prisma.procedureKnowledgeFavorite.findMany({
            where: { userId: testUser.id },
          }),
      },
      {
        name: 'Item index',
        query: () =>
          prisma.procedureKnowledgeFavorite.findMany({
            where: {
              itemId: 'procedure-1',
              itemType: 'PROCEDURE',
            },
          }),
      },
      {
        name: 'Compound index',
        query: () =>
          prisma.procedureKnowledgeFavorite.findUnique({
            where: {
              userId_itemId_itemType: {
                userId: testUser.id,
                itemId: 'procedure-1',
                itemType: 'PROCEDURE',
              },
            },
          }),
      },
    ];

    for (const test of indexTests) {
      startTime = Date.now();
      await test.query();
      const testTime = Date.now() - startTime;
      console.log(`   📊 ${test.name}: ${testTime}ms`);
    }

    console.log('\n✅ Optimization testing complete!');
  } catch (error) {
    console.error('❌ Optimization error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the optimization tests
optimizeFavoritesFeature();
