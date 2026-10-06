import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { AuthUser } from '../auth/auth.types.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<Omit<import("./entities/user.entity.js").User, "passwordHash">>;
    findAll(): Promise<import("./entities/user.entity.js").User[]>;
    me(user: AuthUser): Promise<Omit<import("./entities/user.entity.js").User, "passwordHash"> | null>;
    findOne(id: string): Promise<Omit<import("./entities/user.entity.js").User, "passwordHash"> | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity.js").User | null>;
    remove(id: string): Promise<void>;
}
