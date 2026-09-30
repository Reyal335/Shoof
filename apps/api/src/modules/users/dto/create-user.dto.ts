import { 
    IsEmail, 
    IsString, 
    IsInt, 
    Min, 
    IsOptional, 
    MaxLength, 
    MinLength,
    IsStrongPassword
} from 'class-validator'
import { string } from 'zod';

let max_username_len: number = 25;
let min_username_len: number = 5

let max_password_len: number = 25;
let min_password_len: number = 8


export class CreateUserDto {
    // Email
    @IsEmail({}, {
        message: "ts not an email twin"
    })
    email: string

    // Username
    @MaxLength(max_username_len, {
        message: `Can only have up to ${max_username_len} characters`
    })
    @MinLength(min_username_len, {
        message: `Should at least have ${min_username_len} characters`
    })
    @IsString()
    username: string;

    // Password
    @MaxLength(max_password_len, {
        message: `Can only have up to ${max_password_len} characters`
    })
    @MinLength(min_password_len, {
        message: `Should at least have ${min_password_len} characters`
    })
    @IsStrongPassword()
    @IsString()
    password: string;


}
