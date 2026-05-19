#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const program = new Command();

program
    .name('devhub')
    .description('DevHub CLI - Manage your DevHub projects')
    .version('1.0.0');

// Initialize new project
program
    .command('init')
    .description('Initialize a new DevHub project')
    .option('-n, --name <name>', 'Project name')
    .option('-t, --template <template>', 'Project template (fullstack, frontend, backend)')
    .action(async (options) => {
        console.log(chalk.blue.bold('\n🚀 DevHub Project Initializer\n'));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Project name:',
                default: options.name || 'my-devhub-project',
                validate: (input) => {
                    if (/^[a-z0-9-]+$/.test(input)) return true;
                    return 'Project name must contain only lowercase letters, numbers, and hyphens';
                }
            },
            {
                type: 'list',
                name: 'template',
                message: 'Choose a template:',
                choices: [
                    { name: 'Full Stack (Next.js + Express)', value: 'fullstack' },
                    { name: 'Frontend Only (Next.js)', value: 'frontend' },
                    { name: 'Backend Only (Express + PostgreSQL)', value: 'backend' },
                    { name: 'Microservices (13 services)', value: 'microservices' }
                ],
                default: options.template || 'fullstack'
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select features:',
                choices: [
                    { name: 'Authentication (JWT + OAuth)', value: 'auth', checked: true },
                    { name: 'Database (PostgreSQL + MongoDB)', value: 'database', checked: true },
                    { name: 'File Storage (AWS S3)', value: 'storage', checked: true },
                    { name: 'Real-time (WebSockets)', value: 'realtime', checked: true },
                    { name: 'Email Service (SendGrid)', value: 'email', checked: true },
                    { name: 'Payment (Stripe)', value: 'payment', checked: false },
                    { name: 'Search (Elasticsearch)', value: 'search', checked: false },
                    { name: 'Video (WebRTC)', value: 'video', checked: false },
                    { name: 'Docker & Docker Compose', value: 'docker', checked: true },
                    { name: 'CI/CD (GitHub Actions)', value: 'cicd', checked: true }
                ]
            }
        ]);

        const spinner = ora('Creating project...').start();

        try {
            // Create project directory
            await fs.mkdir(answers.name, { recursive: true });
            process.chdir(answers.name);

            // Create project structure based on template
            await createProjectStructure(answers.template, answers.features);

            // Initialize git
            await execAsync('git init');

            // Create .gitignore
            await fs.writeFile('.gitignore', getGitignoreContent());

            // Create README
            await fs.writeFile('README.md', getReadmeContent(answers.name, answers.template));

            // Create environment files
            await fs.writeFile('.env.example', getEnvContent(answers.features));

            spinner.succeed(chalk.green('Project created successfully!'));

            console.log(chalk.cyan('\n📦 Next steps:\n'));
            console.log(chalk.white(`  cd ${answers.name}`));
            console.log(chalk.white('  cp .env.example .env'));
            console.log(chalk.white('  npm install'));
            console.log(chalk.white('  npm run dev\n'));

        } catch (error: any) {
            spinner.fail(chalk.red('Failed to create project'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// Deploy command
program
    .command('deploy')
    .description('Deploy DevHub project')
    .option('-e, --env <environment>', 'Environment (staging, production)', 'production')
    .option('-s, --service <service>', 'Specific service to deploy (optional)')
    .action(async (options) => {
        console.log(chalk.blue.bold(`\n🚀 Deploying to ${options.env}...\n`));

        const spinner = ora('Building project...').start();

        try {
            // Build
            spinner.text = 'Building Docker images...';
            await execAsync('docker-compose build');

            // Push to registry
            spinner.text = 'Pushing to container registry...';
            await execAsync('docker-compose push');

            // Deploy to Kubernetes
            spinner.text = 'Deploying to Kubernetes...';
            await execAsync(`kubectl apply -k k8s/overlays/${options.env}`);

            // Wait for rollout
            spinner.text = 'Waiting for rollout to complete...';
            await execAsync('kubectl rollout status deployment/api-gateway');

            spinner.succeed(chalk.green('Deployment successful!'));

            // Show service URLs
            const { stdout } = await execAsync('kubectl get ingress -o json');
            const ingress = JSON.parse(stdout);
            console.log(chalk.cyan('\n🌐 Service URLs:\n'));
            ingress.items.forEach((ing: any) => {
                ing.spec.rules?.forEach((rule: any) => {
                    console.log(chalk.white(`  https://${rule.host}`));
                });
            });

        } catch (error: any) {
            spinner.fail(chalk.red('Deployment failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// Logs command
program
    .command('logs')
    .description('View logs from services')
    .option('-s, --service <service>', 'Service name', 'api-gateway')
    .option('-f, --follow', 'Follow log output')
    .option('-n, --lines <lines>', 'Number of lines', '100')
    .action(async (options) => {
        const followFlag = options.follow ? '-f' : '';
        const command = `kubectl logs deployment/${options.service} ${followFlag} --tail=${options.lines}`;

        try {
            const child = exec(command);
            child.stdout?.pipe(process.stdout);
            child.stderr?.pipe(process.stderr);
        } catch (error: any) {
            console.error(chalk.red('Failed to fetch logs:'), error.message);
            process.exit(1);
        }
    });

// Status command
program
    .command('status')
    .description('Check status of all services')
    .action(async () => {
        console.log(chalk.blue.bold('\n📊 DevHub Services Status\n'));

        const spinner = ora('Fetching status...').start();

        try {
            const { stdout } = await execAsync('kubectl get deployments -o json');
            const deployments = JSON.parse(stdout);

            spinner.stop();

            console.log(chalk.white('Service'.padEnd(30)) + chalk.white('Status'.padEnd(15)) + chalk.white('Replicas'));
            console.log('-'.repeat(60));

            deployments.items.forEach((deployment: any) => {
                const name = deployment.metadata.name;
                const ready = deployment.status.readyReplicas || 0;
                const desired = deployment.status.replicas || 0;
                const status = ready === desired ? chalk.green('✓ Running') : chalk.yellow('⚠ Degraded');

                console.log(
                    name.padEnd(30) +
                    status.padEnd(15) +
                    chalk.white(`${ready}/${desired}`)
                );
            });

        } catch (error: any) {
            spinner.fail(chalk.red('Failed to fetch status'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// Database commands
const db = program.command('db').description('Database management commands');

db.command('migrate')
    .description('Run database migrations')
    .action(async () => {
        const spinner = ora('Running migrations...').start();
        try {
            await execAsync('npx prisma migrate deploy');
            spinner.succeed(chalk.green('Migrations completed successfully'));
        } catch (error: any) {
            spinner.fail(chalk.red('Migration failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

db.command('seed')
    .description('Seed database with initial data')
    .action(async () => {
        const spinner = ora('Seeding database...').start();
        try {
            await execAsync('npx prisma db seed');
            spinner.succeed(chalk.green('Database seeded successfully'));
        } catch (error: any) {
            spinner.fail(chalk.red('Seeding failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

db.command('backup')
    .description('Create database backup')
    .option('-o, --output <path>', 'Backup file path')
    .action(async (options) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = options.output || `backup-${timestamp}.sql`;
        const spinner = ora('Creating backup...').start();

        try {
            await execAsync(`pg_dump $DATABASE_URL > ${outputPath}`);
            spinner.succeed(chalk.green(`Backup saved to ${outputPath}`));
        } catch (error: any) {
            spinner.fail(chalk.red('Backup failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
        }
    });

// Helper functions
async function createProjectStructure(template: string, features: string[]) {
    const spinner = ora('Creating project structure...').start();

    const dirs = [
        'frontend/app',
        'frontend/components',
        'frontend/lib',
        'backend/src',
        'backend/prisma',
        'docker',
        'k8s/base',
        'docs'
    ];

    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }

    spinner.succeed('Project structure created');
}

function getGitignoreContent(): string {
    return `
node_modules
dist
build
.env
.env.local
*.log
.DS_Store
coverage
.next
`;
}

function getReadmeContent(name: string, template: string): string {
    return `# ${name}

A DevHub project using ${template} template.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

\`\`\`bash
devhub deploy --env production
\`\`\`

## Documentation

Visit [https://docs.devhub.com](https://docs.devhub.com) for full documentation.
`;
}

function getEnvContent(features: string[]): string {
    let content = `# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devhub
MONGODB_URI=mongodb://localhost:27017/devhub

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

`;

    if (features.includes('email')) {
        content += `# Email
SENDGRID_API_KEY=your-sendgrid-api-key

`;
    }

    if (features.includes('storage')) {
        content += `# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name

`;
    }

    if (features.includes('payment')) {
        content += `# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

`;
    }

    return content;
}

program.parse();
