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
import { Controller } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "./posts.service.js";
import { Get, Param, Query } from "@nestjs/common";
import { ListPostsQueryDto } from "./dto/query.dto.js";
let UserPostsController = class UserPostsController {
    usersService;
    postsService;
    constructor(usersService, postsService) {
        this.usersService = usersService;
        this.postsService = postsService;
    }
    async listByUsername(username, userPostQuery) {
        const user = await this.usersService.findByUsername(username);
        return this.postsService.findAll(userPostQuery);
    }
};
__decorate([
    Get(),
    __param(0, Param('username')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ListPostsQueryDto]),
    __metadata("design:returntype", Promise)
], UserPostsController.prototype, "listByUsername", null);
UserPostsController = __decorate([
    Controller('users/:username/posts'),
    __metadata("design:paramtypes", [UsersService,
        PostsService])
], UserPostsController);
export { UserPostsController };
//# sourceMappingURL=user-posts.controller.js.map