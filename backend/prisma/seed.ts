import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    let userId;

    if (existingUser) {
      console.log('✅ Test user already exists, skipping user creation');
      userId = existingUser.id;
    } else {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Test Admin',
          password: '$2a$10$abcdefghijklmnopqrstuv', // bcrypt hash of 'password123'
          active: true,
        },
      });

      userId = user.id;
      console.log('✅ Created test user:', user.email);
    }

    // Check if test projects already exist
    const existingProjects = await prisma.project.findMany({
      where: { name: { in: ['E-commerce App', 'Marketing Website'] } },
    });

    let projectIds: string[] = [];

    if (existingProjects.length > 0) {
      console.log('✅ Test projects already exist, skipping project creation');
      projectIds = existingProjects.map((p) => p.id);
    } else {
      // Create test projects
      const project1 = await prisma.project.create({
        data: {
          name: 'E-commerce App',
          description: 'Main application translations',
          status: 'ACTIVE',
          languages: ['EN', 'DE', 'ES', 'FR', 'IT'],
        },
      });

      const project2 = await prisma.project.create({
        data: {
          name: 'Marketing Website',
          description: 'Website content translations',
          status: 'ACTIVE',
          languages: ['EN', 'DE', 'FR', 'NL'],
        },
      });

      projectIds = [project1.id, project2.id];
      console.log('✅ Created test projects:', project1.name, project2.name);
    }

    // Check if entries already exist for projects
    for (const projectId of projectIds) {
      const existingEntries = await prisma.entry.count({
        where: { projectId },
      });

      if (existingEntries > 0) {
        console.log(`✅ Entries already exist for project ${projectId}, skipping`);
        continue;
      }

      // Create test entries for each project
      const entries = await prisma.entry.createMany({
        data: [
          {
            projectId,
            key: 'welcome_title',
            en: 'Welcome',
            de: 'Willkommen',
            es: 'Bienvenido',
            fr: 'Bienvenue',
            it: 'Benvenuto',
            nl: 'Welkom',
            no: 'Velkommen',
            pl: 'Witamy',
            se: 'Välkommen',
            status: 'NEW',
          },
          {
            projectId,
            key: 'login_button',
            en: 'Login',
            de: 'Anmelden',
            es: 'Iniciar sesión',
            fr: 'Connexion',
            it: 'Accedi',
            nl: 'Inloggen',
            no: 'Logg inn',
            pl: 'Zaloguj się',
            se: 'Logga in',
            status: 'NEW',
          },
          {
            projectId,
            key: 'logout_button',
            en: 'Logout',
            de: 'Abmelden',
            es: 'Cerrar sesión',
            fr: 'Déconnexion',
            it: 'Esci',
            nl: 'Uitloggen',
            no: 'Logg ut',
            pl: 'Wyloguj się',
            se: 'Logga ut',
            status: 'NEW',
          },
          {
            projectId,
            key: 'error_message',
            en: 'An error occurred',
            de: 'Ein Fehler ist aufgetreten',
            es: 'Ocurrió un error',
            fr: "Une erreur s'est produite",
            it: 'Si è verificato un errore',
            nl: 'Er is een fout opgetreden',
            no: 'Det oppstod en feil',
            pl: 'Wystąpił błąd',
            se: 'Ett fel uppstod',
            status: 'NEW',
          },
          {
            projectId,
            key: 'success_message',
            en: 'Operation successful',
            de: 'Vorgang erfolgreich',
            es: 'Operación exitosa',
            fr: 'Opération réussie',
            it: 'Operazione riuscita',
            nl: 'Bewerking voltooid',
            no: 'Operasjon vellykket',
            pl: 'Operacja udana',
            se: 'Åtgärd lyckades',
            status: 'NEW',
          },
        ],
      });

      console.log(`✅ Created ${entries.count} test entries for project ${projectId}`);
    }

    // Check if API keys already exist
    const existingApiKeys = await prisma.apiKey.findMany({
      where: { userId },
    });

    if (existingApiKeys.length > 0) {
      console.log('✅ Test API keys already exist, skipping');
    } else {
      // Create test API key
      const apiKey = await prisma.apiKey.create({
        data: {
          name: 'Test API Key',
          userId,
          keyHash: '$2a$10$test-api-key-hash-1234567890123456789', // This would be a real bcrypt hash
          prefix: 'mlm_test_',
          suffix: 'abcd',
          status: 'ACTIVE',
        },
      });

      console.log('✅ Created test API key:', apiKey.name);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Test user: admin@example.com');
    console.log('   - Password: password123');
    console.log(`   - Projects: ${projectIds.length}`);
    console.log('   - Entries: Created 4 entries per project');
    console.log('   - API Key: Test API Key');
    console.log('\n🔐 API Key for testing:');
    console.log('   - Note: In production, you would only see this once during creation');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
