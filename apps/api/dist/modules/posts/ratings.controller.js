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
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { RatingsService } from './ratings.service.js';
const uuid = new ParseUUIDPipe();
let RatingsController = class RatingsController {
    ratingsService;
    constructor(ratingsService) {
        this.ratingsService = ratingsService;
    }
    summary(postId, user) {
        return this.ratingsService.summary(postId, user ?? null);
    }
    rate(postId, user, dto) {
        return this.ratingsService.rate(postId, user, dto.value);
    }
    remove(postId, user) {
        return this.ratingsService.remove(postId, user);
    }
};
__decorate([
    OptionalAuth(),
    Get('summary'),
    __param(0, Param('postId', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "summary", null);
__decorate([
    Put('me'),
    __param(0, Param('postId', uuid)),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, RatePostDto]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "rate", null);
__decorate([
    Delete('me'),
    __param(0, Param('postId', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RatingsController.prototype, "remove", null);
RatingsController = __decorate([
    Controller('posts/:postId/ratings'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [RatingsService])
], RatingsController);
export { RatingsController };
//# sourceMappingURL=ratings.controller.js.map