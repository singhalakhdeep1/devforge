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

  if ((await prisma.course.count()) === 0) {
    await prisma.course.createMany({
      data: [
        {
          title: 'Complete React Developer',
          description: 'Learn React from scratch and build production-ready applications',
          instructor: 'John Smith',
          rating: 4.8,
          duration: '40 hours',
          level: 'Beginner',
          price: 99,
          category: 'Frontend',
          modules: [
            { id: 1, title: 'React fundamentals', duration: '2h' },
            { id: 2, title: 'Hooks and state', duration: '3h' },
            { id: 3, title: 'Routing and data fetching', duration: '4h' },
            { id: 4, title: 'Deployment patterns', duration: '2h' },
          ],
        },
        {
          title: 'Node.js API Mastery',
          description: 'Design production APIs with Express, security, testing, and deployment practices.',
          instructor: 'Alicia Reed',
          rating: 4.9,
          duration: '35 hours',
          level: 'Intermediate',
          price: 129,
          category: 'Backend',
          modules: [
            { id: 1, title: 'REST design', duration: '2h' },
            { id: 2, title: 'Authentication', duration: '3h' },
            { id: 3, title: 'Queues and jobs', duration: '4h' },
          ],
        },
      ],
    });
    console.log('Seeded sample courses');
  }

  if ((await prisma.quizQuestion.count()) === 0) {
    await prisma.quizQuestion.createMany({
      data: [
        { lessonId: '1', position: 1, question: 'What is the main responsibility of React?', options: ['Data persistence', 'Rendering UI', 'Database management', 'Packaging code'], correctAnswer: 1 },
        { lessonId: '1', position: 2, question: 'Which hook is used for side effects?', options: ['useMemo', 'useEffect', 'useCallback', 'useContext'], correctAnswer: 1 },
      ],
    });
    console.log('Seeded sample quiz');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
