import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity.js';

// Entities only for now; the service (exported to posts and follows for sending) and the controller land with the
// notification endpoints.
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
})
export class NotificationsModule {}
