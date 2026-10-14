import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity.js';
import { UsersModule } from '../users/users.module.js';
import { PostsModule } from '../posts/posts.module.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsListener } from './listeners/notifications.listener.js';

// Posts and follows send by emitting events (see the listener), so nothing imports this module and it exports
// nothing. It imports users and posts only to read names, captions and comment text for the list.
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UsersModule,
    PostsModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsListener]
})
export class NotificationsModule {}
