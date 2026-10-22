import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        config: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: config.get<string>(
                'GOOGLE_CALLBACK_URL',
                'http://localhost:5000/api/v1/auth/google/redirect',
            ),
            scope: ['email', 'profile']
        });
    }

    // Runs on google/redirect, once Google has sent the profile. Google's own tokens only fetched that profile;
    // they are dropped here, and Shoof issues its own in the controller.
    async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
        const email = profile.emails?.[0];

        // What it returns becomes req.user: the Shoof user, found, linked or created
        return this.authService.signInWithGoogle({
            googleId: profile.id,
            email: email?.value ?? '',
            emailVerified: email?.verified === true,
            displayName: profile.displayName,
        });
    }
}
