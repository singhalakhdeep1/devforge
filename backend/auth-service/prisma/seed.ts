/**
 * Seeds demo accounts. Safe to run repeatedly. Passwords: Password123
 *   admin@devforge.dev       ADMIN
 *   instructor@devforge.dev  INSTRUCTOR
 *   student@devforge.dev     STUDENT
 * Ids are fixed so the other services' seeds can refer to the same people.
 */
import bcrypt from 'bcryptjs'
import { PrismaClient, type Role } from '../src/generated/client'

const prisma = new PrismaClient()

const people: { id: string; email: string; name: string; role: Role; bio?: string; skills?: string[] }[] = [
    { id: '00000000-0000-4000-8000-000000000003', email: 'admin@devforge.dev', name: 'Ada Admin', role: 'ADMIN' },
    {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'instructor@devforge.dev',
        name: 'Alicia Reed',
        role: 'INSTRUCTOR',
        bio: 'Staff engineer and teacher. I build and explain web backends.',
        skills: ['JavaScript', 'Node.js', 'PostgreSQL'],
    },
    { id: '00000000-0000-4000-8000-000000000002', email: 'student@devforge.dev', name: 'Sam Student', role: 'STUDENT' },
]

async function main() {
    const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || 'Password123', 12)
    for (const p of people) {
        await prisma.user.upsert({
            where: { id: p.id },
            update: {},
            create: { ...p, skills: p.skills ?? [], isVerified: true, passwordHash },
        })
    }
    console.log('Seeded accounts: ' + people.map((p) => p.email).join(', '))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
