import { z } from 'zod';

export const userSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(8),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
