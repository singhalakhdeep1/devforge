// Prisma writes each service's client (JS + native query engine) to src/generated, outside tsc's
// reach. Copy it next to the compiled output so `node dist/index.js` finds it.
import { cpSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const from = path.resolve('src/generated');
const to = path.resolve('dist/generated');
if (!existsSync(from)) {
  console.error('src/generated not found: run "prisma generate" first');
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log('copied prisma client -> dist/generated');
