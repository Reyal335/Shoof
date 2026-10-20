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
import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ListPostsQueryDto } from '../posts/dto/query.dto.js';
import { FeedService } from './feed.service.js';
let FeedController = class FeedController {
    feedService;
    constructor(feedService) {
        this.feedService = feedService;
    }
    following(user, query) {
        return this.feedService.following(user.id, query);
    }
};
__decorate([
    Get('following'),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListPostsQueryDto]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "following", null);
FeedController = __decorate([
    Controller('feed'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [FeedService])
], FeedController);
export { FeedController };
//# sourceMappingURL=feed.controller.js.map