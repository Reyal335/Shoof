import { Injectable } from '@nestjs/common';

// DTO
import { CreateUserDto, CreateWithSignIn } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Profile } from './entities/profile.entity.js';
import { NotFoundException } from '@nestjs/common';
import { normalize } from 'node:path';
import { _normalize } from 'zod/v4/core';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>
  ) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const newUser = this.usersRepository.create(createUserDto);

    try {
      // The profile is created with the user so a user never exists without one
      const savedUser = await this.usersRepository.manager.transaction(async (manager) => {
        const user = await manager.save(newUser)
        await manager.insert(Profile, { userId: user.id, displayName: user.username })
        return user
      })

      const { passwordHash, ...result } = savedUser;

      return result
    } catch (error) {
      console.log('There was an error during the save')
      throw error
    }
  }

  async createWithEmail(createWithSignIn: CreateWithSignIn) {
    
  }

  findAll() {
    return this.usersRepository.find();
  }

  // Find by Id
  async findOne(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const foundUser =  await this.usersRepository.findOneBy({ id });

    if (!foundUser) {
      return null;
    }

    const { passwordHash, ...result } = foundUser;

    return result
  }

  // Find by Email
  async findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    const foundUser =  await this.usersRepository.findOneBy({ email })

    if (!foundUser) {
      return null;
    }

    const { passwordHash, ...result } = foundUser;

    return result
  }

  // Null for an unknown email: sign-in must not reveal which addresses have accounts
  async findCredentials(email: string): Promise<{user: Omit<User, 'passwordHash'>, passwordHash: string | null} | null> {
    const found = await this.usersRepository.findOneBy({email})
    if (!found) {
      return null
    }

    const { passwordHash, ...user } = found;

    return { user, passwordHash }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    // 1. Execute direct database update
    const result = await this.usersRepository.update(id, updateUserDto);

    // 2. Check if the row actually existed
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 3. Manually fetch and return the updated entity if needed
    return await this.usersRepository.findOneBy({ id });

  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async markEmailVerified(id: string, email: string) {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user || user.email !== email) {
      return false
    }
    return true
  }

  async findByIdentity(provider: string, subject: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: "1" })
  }

  async linkIdentity(id: string, provider: string, subject: string) {
    return 
  }
}
