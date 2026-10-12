import { AppError, asyncHandler } from '@devhub/shared'

/** Kept as a thin layer over the shared AppError so route code reads the same as before. */
export class HttpError extends AppError {
    constructor(statusCode: number, message: string, details?: unknown) {
        super(statusCode, message, undefined, details)
    }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details)
export const unauthorized = (message = 'Not authorized') => new HttpError(401, message)
export const forbidden = (message = 'Forbidden') => new HttpError(403, message)
export const notFound = (what = 'Resource') => new HttpError(404, `${what} not found`)
export const conflict = (message: string) => new HttpError(409, message)

/** Forwards rejected promises to the error middleware (Express 4 does not do this itself). */
export const handle = asyncHandler

/** Parses a numeric route param; throws a 400 instead of passing NaN to Prisma. */
export const intParam = (value: string | undefined, name = 'id'): number => {
    const n = Number(value)
    if (!Number.isInteger(n) || n <= 0) throw badRequest(`Invalid ${name}`)
    return n
}
