import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { AuthUser } from '../auth/auth.types.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: AuthUser): Promise<import("./users.service.js").AccountView>;
    username(param: any): Promise<import("./users.service.js").PublicProfileView>;
    myProfile(user: AuthUser): Promise<import("./users.service.js").ProfileView>;
    updateMyProfile(user: AuthUser, dto: UpdateProfileDto): Promise<import("./users.service.js").ProfileView>;
}
