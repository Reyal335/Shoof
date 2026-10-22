import {
    IsEmail,
    IsString,
    IsOptional,
    IsBoolean
} from 'class-validator'

// What GoogleStrategy reads from the Google profile and hands to AuthService.signInWithGoogle
export class GoogleAuthDto {
    // Google's stable id for the person (profile.id), stored as user_identity.providerUserId
    @IsString()
    googleId: string

    @IsEmail()
    email: string;

    // Google says the person owns this email
    @IsBoolean()
    emailVerified: boolean

    // Google's name for the person, e.g. "Sam Cruz". Not a username: it can have spaces and be taken.
    @IsOptional()
    @IsString()
    displayName?: string;
}
