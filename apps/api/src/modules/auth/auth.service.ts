import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
    constructor (private readonly userService: UsersService) {}

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.userService.findOne(username);
        if (user?.passwordHash !== pass) {
            throw new UnauthorizedException();
        }
    }
}
