import { PrismaClient } from './generated/client';

export const prisma = new PrismaClient();
export type { Role, User } from './generated/client';
