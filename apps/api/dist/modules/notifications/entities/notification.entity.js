var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export var NotificationType;
(function (NotificationType) {
    NotificationType["FOLLOW"] = "follow";
    NotificationType["COMMENT"] = "comment";
    NotificationType["RATING"] = "rating";
})(NotificationType || (NotificationType = {}));
let Notification = class Notification {
    id;
    recipientId;
    actorId;
    type;
    postId;
    commentId;
    readAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    Column('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    Column('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "actorId", void 0);
__decorate([
    Column({ type: 'enum', enum: NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    Column({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "postId", void 0);
__decorate([
    Column({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "commentId", void 0);
__decorate([
    Column({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "readAt", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
Notification = __decorate([
    Entity('notifications'),
    Check(`"actorId" <> "recipientId"`),
    Check(`
    ("type" = 'follow' AND "postId" IS NULL AND "commentId" IS NULL) OR
    ("type" = 'comment' AND "postId" IS NOT NULL AND "commentId" IS NOT NULL) OR
    ("type" = 'rating' AND "postId" IS NOT NULL AND "commentId" IS NULL)
`),
    Index(['recipientId', 'createdAt']),
    Index('IDX_notifications_unread', ['recipientId'], { where: `"readAt" IS NULL` }),
    Index('UQ_notifications_follow', ['recipientId', 'actorId'], { unique: true, where: `"type" = 'follow'` }),
    Index('UQ_notifications_rating', ['postId', 'actorId'], { unique: true, where: `"type" = 'rating'` }),
    Index('UQ_notifications_comment', ['commentId'], { unique: true, where: `"commentId" IS NOT NULL` })
], Notification);
export { Notification };
//# sourceMappingURL=notification.entity.js.map