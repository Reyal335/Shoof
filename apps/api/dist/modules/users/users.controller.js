var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Body, Patch, UsePipes, ValidationPipe, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    me(user) {
        return this.usersService.findAccount(user.id);
    }
    username(param) {
        return this.usersService.findPublicProfile(param.username);
    }
    myProfile(user) {
        return this.usersService.findProfile(user.id);
    }
    updateMyProfile(user, dto) {
        return this.usersService.updateProfile(user.id, dto);
    }
};
__decorate([
    Get('me'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    Public(),
    Get(':username'),
    __param(0, Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "username", null);
__decorate([
    Get('me/profile'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "myProfile", null);
__decorate([
    Patch('me/profile'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyProfile", null);
UsersController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map