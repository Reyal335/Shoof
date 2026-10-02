export declare enum UserRole {
    GUEST = "Guest",
    MEMBER = "Member",
    INFLUENCER = "Influencer",
    MODERATOR = "Moderator",
    ADMIN = "Admin"
}
export declare class User {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
