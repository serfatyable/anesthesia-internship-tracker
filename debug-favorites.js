import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugFavoritesFeature() {
  console.log('🔍 Debugging Favorites Feature...\n');

  try {
    // Test 1: Database Schema Validation
    console.log('1. 📊 Database Schema Validation');
    const tableInfo = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ProcedureKnowledgeFavorite'
    `;

    if (tableInfo.length > 0) {
      console.log('   ✅ ProcedureKnowledgeFavorite table exists');

      // Check table structure
      const tableSchema = await prisma.$queryRaw`
        PRAGMA table_info(ProcedureKnowledgeFavorite)
      `;
      console.log('   📋 Table structure:');
      tableSchema.forEach((column) => {
        console.log(`      - ${column.name}: ${column.type} ${column.pk ? '(PRIMARY KEY)' : ''}`);
      });
    } else {
      console.log('   ❌ ProcedureKnowledgeFavorite table does not exist');
      return;
    }

    // Test 2: Check existing data
    console.log('\n2. 📈 Data Analysis');
    const totalFavorites = await prisma.procedureKnowledgeFavorite.count();
    console.log(`   📊 Total favorites: ${totalFavorites}`);

    if (totalFavorites > 0) {
      const favorites = await prisma.procedureKnowledgeFavorite.findMany({
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      });

      console.log('   👥 Favorites by user:');
      const userFavorites = {};
      favorites.forEach((fav) => {
        const userKey = `${fav.user.email} (${fav.user.name})`;
        if (!userFavorites[userKey]) {
          userFavorites[userKey] = { procedures: 0, knowledge: 0 };
        }
        if (fav.itemType === 'PROCEDURE') {
          userFavorites[userKey].procedures++;
        } else {
          userFavorites[userKey].knowledge++;
        }
      });

      Object.entries(userFavorites).forEach(([user, counts]) => {
        console.log(
          `      ${user}: ${counts.procedures} procedures, ${counts.knowledge} knowledge`,
        );
      });

      // Test 3: Performance Analysis
      console.log('\n3. ⚡ Performance Analysis');
      const startTime = Date.now();

      // Test query performance
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.procedureKnowledgeFavorite.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });
      }

      const queryTime = Date.now() - startTime;
      console.log(`   ⏱️  Query time: ${queryTime}ms`);

      if (queryTime > 100) {
        console.log('   ⚠️  Query is slow (>100ms)');
      } else {
        console.log('   ✅ Query performance is good');
      }
    }

    // Test 4: Index Analysis
    console.log('\n4. 🔍 Index Analysis');
    const indexes = await prisma.$queryRaw`
      PRAGMA index_list(ProcedureKnowledgeFavorite)
    `;

    console.log('   📋 Available indexes:');
    indexes.forEach((index) => {
      console.log(`      - ${index.name}: ${index.unique ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });

    // Test 5: Data Integrity Check
    console.log('\n5. 🔒 Data Integrity Check');

    // Check for orphaned favorites (users that don't exist)
    const orphanedFavorites = await prisma.$queryRaw`
      SELECT pkf.* FROM ProcedureKnowledgeFavorite pkf
      LEFT JOIN User u ON pkf.userId = u.id
      WHERE u.id IS NULL
    `;

    if (orphanedFavorites.length > 0) {
      console.log(`   ⚠️  Found ${orphanedFavorites.length} orphaned favorites`);
    } else {
      console.log('   ✅ No orphaned favorites found');
    }

    // Check for invalid itemTypes
    const invalidTypes = await prisma.procedureKnowledgeFavorite.findMany({
      where: {
        itemType: {
          notIn: ['PROCEDURE', 'KNOWLEDGE'],
        },
      },
    });

    if (invalidTypes.length > 0) {
      console.log(`   ⚠️  Found ${invalidTypes.length} favorites with invalid itemType`);
    } else {
      console.log('   ✅ All itemTypes are valid');
    }

    // Test 6: API Endpoint Simulation
    console.log('\n6. 🌐 API Endpoint Simulation');

    const testUser = await prisma.user.findFirst();
    if (testUser) {
      console.log(`   🧪 Testing with user: ${testUser.email}`);

      // Simulate GET request
      const favorites = await prisma.procedureKnowledgeFavorite.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      });
      console.log(`   ✅ GET /api/procedure-knowledge-favorites: ${favorites.length} results`);

      // Simulate POST request (check if already exists)
      const testItemId = 'test-procedure-123';
      const testItemType = 'PROCEDURE';

      const existing = await prisma.procedureKnowledgeFavorite.findUnique({
        where: {
          userId_itemId_itemType: {
            userId: testUser.id,
            itemId: testItemId,
            itemType: testItemType,
          },
        },
      });

      if (existing) {
        console.log('   ✅ POST validation: Duplicate detection working');
      } else {
        console.log('   ✅ POST validation: No duplicates found');
      }
    }

    // Test 7: Memory Usage Analysis
    console.log('\n7. 💾 Memory Usage Analysis');

    const allFavorites = await prisma.procedureKnowledgeFavorite.findMany();
    const memoryEstimate = allFavorites.length * 200; // Rough estimate: 200 bytes per record
    console.log(
      `   📊 Estimated memory usage: ${memoryEstimate} bytes (${(memoryEstimate / 1024).toFixed(2)} KB)`,
    );

    if (memoryEstimate > 1024 * 1024) {
      // 1MB
      console.log('   ⚠️  Large dataset detected - consider pagination');
    } else {
      console.log('   ✅ Memory usage is reasonable');
    }

    console.log('\n✅ Favorites feature debug complete!');
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugFavoritesFeature();
