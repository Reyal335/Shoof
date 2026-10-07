import { CreateUserDto, CreateWithSignIn } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Profile } from './entities/profile.entity.js';
export declare class UsersService {
    private usersRepository;
    private profilesRepository;
    constructor(usersRepository: Repository<User>, profilesRepository: Repository<Profile>);
    private readonly users;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    createWithEmail(createWithSignIn: CreateWithSignIn): Promise<void>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<Omit<User, 'passwordHash'> | null>;
    findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null>;
    findCredentials(email: string): Promise<{
        user: Omit<User, 'passwordHash'>;
        passwordHash: string | null;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: string): Promise<void>;
    markEmailVerified(id: string, email: string): Promise<boolean>;
    findByIdentity(provider: string, subject: string): Promise<User | null>;
    linkIdentity(id: string, provider: string, subject: string): Promise<void>;
}
