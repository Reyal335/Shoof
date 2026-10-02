import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    private readonly users;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null>;
    findCredentials(email: string): Promise<{
        user: Omit<User, 'passwordHash'>;
        passwordHash: string;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: string): Promise<void>;
    markEmailVerified(id: string, email: string): Promise<boolean>;
}
