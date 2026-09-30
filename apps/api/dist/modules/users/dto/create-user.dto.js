var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsString, MaxLength, MinLength, IsStrongPassword } from 'class-validator';
let max_username_len = 25;
let min_username_len = 5;
let max_password_len = 25;
let min_password_len = 8;
export class CreateUserDto {
    email;
    username;
    password;
}
__decorate([
    IsEmail({}, {
        message: "ts not an email twin"
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    MaxLength(max_username_len, {
        message: `Can only have up to ${max_username_len} characters`
    }),
    MinLength(min_username_len, {
        message: `Should at least have ${min_username_len} characters`
    }),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    MaxLength(max_username_len, {
        message: `Can only have up to ${max_username_len} characters`
    }),
    MinLength(min_username_len, {
        message: `Should at least have ${min_username_len} characters`
    }),
    IsStrongPassword(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
//# sourceMappingURL=create-user.dto.js.map