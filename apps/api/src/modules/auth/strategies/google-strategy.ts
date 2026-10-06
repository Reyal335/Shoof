import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';


@Injectable()  
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(config: ConfigService) {
        super({
            clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: config.get<string>(
                'GOOGLE_CALLBACK_URL',
                'http://localhost:3000/api/v1/auth/google/redirect',
            ),
            scope: ['email', 'profile']
        });
    }

    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { emails } = profile;
        
        // Format the data to fit your application's schema
        const user = {
            username: profile.displayName,
            email: emails[0].value,
            accessToken
        };

        return user
    }
}
