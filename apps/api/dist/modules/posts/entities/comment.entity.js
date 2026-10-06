var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post.entity.js';
let Comment = class Comment {
    id;
    postId;
    post;
    userId;
    content;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "id", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "postId", void 0);
__decorate([
    ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'postId' }),
    __metadata("design:type", Object)
], Comment.prototype, "post", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "userId", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
Comment = __decorate([
    Entity('comments')
], Comment);
export { Comment };
//# sourceMappingURL=comment.entity.js.map