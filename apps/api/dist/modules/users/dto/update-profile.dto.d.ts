export declare class TechStackDto {
    frontend?: string[];
    backend?: string[];
    tools?: string[];
}
export declare class UpdateProfileDto {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    websiteUrl?: string | null;
    techStack?: TechStackDto;
}
