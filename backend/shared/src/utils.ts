import { randomBytes } from 'node:crypto';

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateRandomString = (length: number = 32): string => {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

export const parsePagination = (page?: string | number, limit?: string | number) => {
    const parsedPage = Math.max(1, parseInt(String(page || 1)));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20))));
    const skip = (parsedPage - 1) * parsedLimit;
    return { page: parsedPage, limit: parsedLimit, skip };
};
