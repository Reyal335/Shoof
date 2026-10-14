import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service.js";
import { ListNotificationsQueryDto } from "./dto/list-notifications.query.js";
import { MarkAllReadDto, SetReadDto } from "./dto/set-read.dto.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthUser } from "../auth/auth.types.js";

const uuid = new ParseUUIDPipe();

// The signed-in user's own notifications only: every route passes user.id as the recipient
@Controller('notifications')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class NotificationsController {
    constructor (
        private readonly notificationsService: NotificationsService
    ) {}

    @Get()
    list(@CurrentUser() user: AuthUser, @Query() query: ListNotificationsQueryDto) {
        return this.notificationsService.list(user.id, query);
    }

    @Get('unread-count')
    async unreadCount(@CurrentUser() user: AuthUser) {
        return { count: await this.notificationsService.unreadCount(user.id) };
    }

    @Patch(':id')
    @HttpCode(204)
    setRead(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser, @Body() dto: SetReadDto) {
        return this.notificationsService.setRead(id, user.id, dto.read);
    }

    @Post('read-all')
    @HttpCode(204)
    markAllRead(@CurrentUser() user: AuthUser, @Body() dto: MarkAllReadDto) {
        return this.notificationsService.markAllRead(user.id, dto.upTo);
    }
}
