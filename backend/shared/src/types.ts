export interface IUser {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
    isVerified: boolean;
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
    }
}
