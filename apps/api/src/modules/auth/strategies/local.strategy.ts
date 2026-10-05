
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from '../credentials.service.js';
import type { User } from '../../users/entities/user.entity.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private credentialsService: CredentialsService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.credentialsService.verify(email, password);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
