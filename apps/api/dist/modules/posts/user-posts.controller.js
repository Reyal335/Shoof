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
import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "./posts.service.js";
import { ListPostsQueryDto } from "./dto/query.dto.js";
import { Public } from "../auth/decorators/public.decorator.js";
let UserPostsController = class UserPostsController {
    usersService;
    postsService;
    constructor(usersService, postsService) {
        this.usersService = usersService;
        this.postsService = postsService;
    }
    async listByUsername(username, query) {
        const userId = await this.usersService.findIdByUsername(username);
        return this.postsService.findAll(query, { userIds: [userId] });
    }
};
__decorate([
    Public(),
    Get(),
    __param(0, Param('username')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ListPostsQueryDto]),
    __metadata("design:returntype", Promise)
], UserPostsController.prototype, "listByUsername", null);
UserPostsController = __decorate([
    Controller('users/:username/posts'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [UsersService,
        PostsService])
], UserPostsController);
export { UserPostsController };
//# sourceMappingURL=user-posts.controller.js.map