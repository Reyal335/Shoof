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
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query, UsePipes, ValidationPipe, } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ListPostsQueryDto, PaginationQueryDto } from './dto/query.dto.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { CommentDto } from './dto/comment.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
const uuid = new ParseUUIDPipe();
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    create(user, dto) {
        return this.postsService.create(user.id, dto);
    }
    findAll(query) {
        return this.postsService.findAll(query);
    }
    findOne(id) {
        return this.postsService.findOne(id);
    }
    update(id, user, dto) {
        return this.postsService.update(id, user, dto);
    }
    remove(id, user) {
        return this.postsService.remove(id, user);
    }
    recordVisit(id) {
        return this.postsService.recordVisit(id);
    }
    findMyRating(id, user) {
        return this.postsService.findMyRating(id, user);
    }
    rate(id, user, dto) {
        return this.postsService.rate(id, user, dto.value);
    }
    unrate(id, user) {
        return this.postsService.unrate(id, user);
    }
    findComments(id, query) {
        return this.postsService.findComments(id, query);
    }
    addComment(id, user, dto) {
        return this.postsService.addComment(id, user, dto.content);
    }
    updateComment(id, commentId, user, dto) {
        return this.postsService.updateComment(id, commentId, user, dto.content);
    }
    removeComment(id, commentId, user) {
        return this.postsService.removeComment(id, commentId, user);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreatePostDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "create", null);
__decorate([
    Public(),
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListPostsQueryDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findAll", null);
__decorate([
    Public(),
    Get(':id'),
    __param(0, Param('id', uuid)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, UpdatePostDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    HttpCode(HttpStatus.NO_CONTENT),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "remove", null);
__decorate([
    Public(),
    Post(':id/visits'),
    HttpCode(HttpStatus.NO_CONTENT),
    __param(0, Param('id', uuid)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "recordVisit", null);
__decorate([
    Get(':id/rating'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findMyRating", null);
__decorate([
    Put(':id/rating'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, RatePostDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "rate", null);
__decorate([
    Delete(':id/rating'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "unrate", null);
__decorate([
    Public(),
    Get(':id/comments'),
    __param(0, Param('id', uuid)),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findComments", null);
__decorate([
    Post(':id/comments'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, CommentDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "addComment", null);
__decorate([
    Patch(':id/comments/:commentId'),
    __param(0, Param('id', uuid)),
    __param(1, Param('commentId', uuid)),
    __param(2, CurrentUser()),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, CommentDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "updateComment", null);
__decorate([
    Delete(':id/comments/:commentId'),
    HttpCode(HttpStatus.NO_CONTENT),
    __param(0, Param('id', uuid)),
    __param(1, Param('commentId', uuid)),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "removeComment", null);
PostsController = __decorate([
    Controller('posts'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [PostsService])
], PostsController);
export { PostsController };
//# sourceMappingURL=posts.controller.js.map