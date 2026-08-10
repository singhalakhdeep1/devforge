import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DevForge database...');

  const project = await prisma.project.create({
    data: {
      name: 'Microservice Gateway',
      repository: 'https://github.com/devforge/gateway.git',
      status: 'ACTIVE',
      deployments: {
        create: {
          environment: 'production',
          status: 'SUCCESS',
          logs: 'Build completed in 14.2s. Container pushed to registry.',
        },
      },
    },
  });

  console.log(`Seeded project: ${project.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
