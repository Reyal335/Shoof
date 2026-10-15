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
import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UsePipes, ValidationPipe, } from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";
import { ListNotificationsQueryDto } from "./dto/list-notifications.query.js";
import { MarkAllReadDto, SetReadDto } from "./dto/set-read.dto.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
const uuid = new ParseUUIDPipe();
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    list(user, query) {
        return this.notificationsService.list(user.id, query);
    }
    async unreadCount(user) {
        return { count: await this.notificationsService.unreadCount(user.id) };
    }
    setRead(id, user, dto) {
        return this.notificationsService.setRead(id, user.id, dto.read);
    }
    markAllRead(user, dto) {
        return this.notificationsService.markAllRead(user.id, dto.upTo);
    }
};
__decorate([
    Get(),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListNotificationsQueryDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    Get('unread-count'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unreadCount", null);
__decorate([
    Patch(':id'),
    HttpCode(204),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, SetReadDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "setRead", null);
__decorate([
    Post('read-all'),
    HttpCode(204),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MarkAllReadDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllRead", null);
NotificationsController = __decorate([
    Controller('notifications'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsController);
export { NotificationsController };
//# sourceMappingURL=notifications.controller.js.map