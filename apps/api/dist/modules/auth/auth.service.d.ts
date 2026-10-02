import { UsersService } from '../users/users.service.js';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UsersService);
    signIn(username: string, pass: string): Promise<any>;
}
