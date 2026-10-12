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
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
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
