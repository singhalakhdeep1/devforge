/**
 * Seeds demo content: an instructor, a student and three published courses with
 * lessons and quizzes. Safe to run repeatedly.
 *
 * Demo logins (password for all: Password123) are created by the auth-service seed.
 *   instructor@devforge.dev   student@devforge.dev   admin@devforge.dev
 */
import { LessonType, Level, PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

// Fixed ids shared with the auth-service seed, so both services describe the same people
const IDS = {
    instructor: '00000000-0000-4000-8000-000000000001',
    student: '00000000-0000-4000-8000-000000000002',
}

interface Q {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
}
interface SeedLesson {
    title: string
    type?: LessonType
    durationMin: number
    content?: string
    questions?: Q[]
}
interface SeedCourse {
    title: string
    description: string
    category: string
    level: Level
    price: number
    modules: { title: string; lessons: SeedLesson[] }[]
}

// Lesson bodies are Markdown. The lesson title is shown by the page, so bodies do not repeat it.
const FENCE = '```'
const block = (lang: string, code: string) => `${FENCE}${lang}\n${code}\n${FENCE}`

const courses: SeedCourse[] = [
    {
        title: 'JavaScript Essentials',
        description: 'Learn the core of JavaScript from scratch: values, functions, arrays and objects, with a quiz to check your understanding after each part.',
        category: 'Programming',
        level: 'BEGINNER',
        price: 0,
        modules: [
            {
                title: 'Getting started',
                lessons: [
                    {
                        title: 'What is JavaScript?',
                        durationMin: 6,
                        content: [
                            'JavaScript is the programming language of the web. It runs in every browser and, with Node.js, on servers too.',
                            '## Your first program',
                            block('js', "console.log('Hello, DevForge!')"),
                            'Open the **Code Editor**, paste this in and press **Run**.',
                            '## Where JavaScript runs',
                            '- **Browsers**: make pages interactive\n- **Node.js**: command-line tools and servers\n- **Everywhere else**: desktop apps, mobile apps, serverless functions',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Variables and types',
                        durationMin: 10,
                        content: [
                            'Use `const` for values that never get reassigned and `let` for values that do. Avoid `var`.',
                            block('js', "const name = 'Ada'      // string\nlet score = 10          // number\nconst passed = true     // boolean\nconst nothing = null    // intentionally empty\nlet unset               // undefined"),
                            '## Checking a type',
                            block('js', "typeof 'hello' // 'string'\ntypeof 42      // 'number'\ntypeof []      // 'object' (arrays are objects)"),
                            '## Equality',
                            'Prefer `===` over `==`. The strict operator never converts types behind your back.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Functions',
                        durationMin: 12,
                        content: [
                            'A function packages reusable logic.',
                            block('js', 'function add(a, b) {\n  return a + b\n}\n\nconst multiply = (a, b) => a * b\n\nconsole.log(add(2, 3), multiply(4, 5))'),
                            '## Default parameters',
                            block('js', "const greet = (name = 'friend') => `Hello, ${name}!`\ngreet()       // Hello, friend!\ngreet('Ada')  // Hello, Ada!"),
                            '**Exercise:** write `isEven(n)` that returns `true` for even numbers.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Quiz: the basics',
                        type: 'QUIZ',
                        durationMin: 5,
                        questions: [
                            { question: 'Which keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], correctAnswer: 2, explanation: '`const` creates a binding that cannot be reassigned.' },
                            { question: 'Which operator compares two values without converting their types?', options: ['==', '===', '=', '!='], correctAnswer: 1, explanation: '`===` is the strict equality operator.' },
                            { question: 'What does `(a, b) => a * b` define?', options: ['A class', 'An arrow function', 'A loop', 'A module'], correctAnswer: 1 },
                        ],
                    },
                ],
            },
            {
                title: 'Working with data',
                lessons: [
                    {
                        title: 'Arrays',
                        durationMin: 12,
                        content: [
                            block('js', 'const nums = [1, 2, 3, 4, 5]\n\nnums.map((n) => n * 2)             // [2, 4, 6, 8, 10]\nnums.filter((n) => n % 2 === 0)    // [2, 4]\nnums.reduce((sum, n) => sum + n, 0) // 15'),
                            '`map`, `filter` and `reduce` return new values and do not change the original array.',
                            '## Finding things',
                            block('js', 'nums.find((n) => n > 3)     // 4\nnums.includes(3)            // true'),
                        ].join('\n\n'),
                    },
                    {
                        title: 'Objects',
                        durationMin: 12,
                        content: [
                            block('js', "const user = { name: 'Ada', skills: ['math', 'code'] }\n\nuser.name          // 'Ada'\nuser['skills'][0]  // 'math'\n\nconst { name } = user              // destructuring\nconst copy = { ...user, age: 36 }  // spread"),
                            '## Iterating',
                            block('js', 'for (const [key, value] of Object.entries(user)) {\n  console.log(key, value)\n}'),
                        ].join('\n\n'),
                    },
                    {
                        title: 'Quiz: arrays and objects',
                        type: 'QUIZ',
                        durationMin: 5,
                        questions: [
                            { question: 'Which array method returns a new array containing only matching items?', options: ['map', 'filter', 'reduce', 'find'], correctAnswer: 1 },
                            { question: 'What does `{ ...user, age: 36 }` do?', options: ['Mutates user', 'Creates a copy with an extra property', 'Deletes age', 'Throws an error'], correctAnswer: 1, explanation: 'Spread copies the properties into a new object.' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        title: 'Build REST APIs with Node and Express',
        description: 'Design, build and secure a production-style REST API: routing, validation, authentication and error handling.',
        category: 'Backend',
        level: 'INTERMEDIATE',
        price: 49,
        modules: [
            {
                title: 'Express foundations',
                lessons: [
                    {
                        title: 'Routing and middleware',
                        durationMin: 14,
                        content: [
                            block('js', "import express from 'express'\nconst app = express()\n\napp.use(express.json())\n\napp.get('/health', (req, res) => res.json({ ok: true }))\n\napp.listen(3000)"),
                            'Middleware is a function `(req, res, next)`. It can read or change the request, end the response, or call `next()` to continue.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Validating input',
                        durationMin: 14,
                        content: [
                            'Never trust request data. Validate it at the edge with a schema library such as Zod:',
                            block('ts', 'const schema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n})\n\nconst result = schema.safeParse(req.body)\nif (!result.success) return res.status(400).json(result.error.issues)'),
                            'Return **400** for bad input, **401** when not signed in, **403** when signed in but not allowed, **404** when missing.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Quiz: Express basics',
                        type: 'QUIZ',
                        durationMin: 5,
                        questions: [
                            { question: 'Which HTTP status means the caller is signed in but not allowed to do this?', options: ['400', '401', '403', '404'], correctAnswer: 2 },
                            { question: 'What must middleware call to pass control onward?', options: ['res.end()', 'next()', 'app.listen()', 'return'], correctAnswer: 1 },
                        ],
                    },
                ],
            },
            {
                title: 'Security',
                lessons: [
                    {
                        title: 'Password storage and JWTs',
                        durationMin: 15,
                        content: [
                            'Store **hashes**, never passwords:',
                            block('js', 'const hash = await bcrypt.hash(password, 12)\nconst ok = await bcrypt.compare(password, hash)'),
                            'An access token (JWT) should be short-lived. Pair it with an httpOnly refresh cookie that you can rotate and revoke on the server.',
                        ].join('\n\n'),
                    },
                ],
            },
        ],
    },
    {
        title: 'Git and the Command Line',
        description: 'Everyday Git and shell skills every developer needs: commits, branches, merging and recovering from mistakes.',
        category: 'Tools',
        level: 'BEGINNER',
        price: 0,
        modules: [
            {
                title: 'Git basics',
                lessons: [
                    {
                        title: 'Commits and history',
                        durationMin: 10,
                        content: [
                            block('bash', 'git init\ngit add .\ngit commit -m "Add login page"\ngit log --oneline'),
                            'A commit is a snapshot plus a message. Write messages that explain **why**, not just what.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Branching and merging',
                        durationMin: 12,
                        content: [
                            block('bash', 'git switch -c feature/search\n# ...edit, commit...\ngit switch main\ngit merge feature/search'),
                            'Branches are cheap. Use one per change and merge through a pull request.',
                        ].join('\n\n'),
                    },
                    {
                        title: 'Quiz: Git',
                        type: 'QUIZ',
                        durationMin: 4,
                        questions: [
                            { question: 'Which command shows a compact commit history?', options: ['git status', 'git log --oneline', 'git diff', 'git remote'], correctAnswer: 1 },
                            { question: 'Which command creates and switches to a new branch?', options: ['git switch -c name', 'git branch -d name', 'git merge name', 'git stash name'], correctAnswer: 0 },
                        ],
                    },
                ],
            },
        ],
    },
]

async function main() {
    // Users live in the auth-service; this service keeps a projection used for joins
    const instructor = await prisma.user.upsert({
        where: { id: IDS.instructor },
        update: {},
        create: {
            id: IDS.instructor,
            email: 'instructor@devforge.dev',
            name: 'Alicia Reed',
            role: 'INSTRUCTOR',
            isVerified: true,
            bio: 'Staff engineer and teacher. I build and explain web backends.',
            skills: ['JavaScript', 'Node.js', 'PostgreSQL'],
        },
    })
    await prisma.user.upsert({
        where: { id: IDS.student },
        update: {},
        create: { id: IDS.student, email: 'student@devforge.dev', name: 'Sam Student', role: 'STUDENT', isVerified: true },
    })

    for (const c of courses) {
        if (await prisma.course.findFirst({ where: { title: c.title, instructorId: instructor.id } })) continue

        await prisma.course.create({
            data: {
                title: c.title,
                description: c.description,
                category: c.category,
                level: c.level,
                price: c.price,
                published: true,
                instructorId: instructor.id,
                modules: {
                    create: c.modules.map((m, mi) => ({
                        title: m.title,
                        position: mi,
                        lessons: {
                            create: m.lessons.map((l, li) => ({
                                title: l.title,
                                type: l.type ?? 'ARTICLE',
                                durationMin: l.durationMin,
                                content: l.content ?? '',
                                position: li,
                                questions: l.questions ? { create: l.questions.map((q, qi) => ({ ...q, position: qi })) } : undefined,
                            })),
                        },
                    })),
                },
            },
        })
        console.log(`Seeded course: ${c.title}`)
    }

    console.log('Seed complete. Demo logins: instructor@devforge.dev / student@devforge.dev (password: Password123)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
