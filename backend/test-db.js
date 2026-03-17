import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 2: Check if tables exist
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const entryCount = await prisma.entry.count();
    const exportCount = await prisma.export.count();
    const apiKeyCount = await prisma.apiKey.count();

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Entries: ${entryCount}`);
    console.log(`   Exports: ${exportCount}`);
    console.log(`   API Keys: ${apiKeyCount}`);

    // Test 3: Query test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (testUser) {
      console.log('\n✅ Test user found:', testUser.email);
    } else {
      console.log('\n⚠️  Test user not found - need to run seed');
    }

    // Test 4: Query test projects
    const projects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (projects.length > 0) {
      console.log('\n✅ Test projects found:', projects.length);
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.languages.join(', ')})`);
      });
    } else {
      console.log('\n⚠️  No projects found - need to run seed');
    }

    console.log('\n🎉 All database tests passed!');
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
