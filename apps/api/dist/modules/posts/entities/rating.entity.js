var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Check, Column, CreateDateColumn, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity.js';
let Rating = class Rating {
    id;
    postId;
    post;
    userId;
    value;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Rating.prototype, "id", void 0);
__decorate([
    Column('uuid'),
    __metadata("design:type", String)
], Rating.prototype, "postId", void 0);
__decorate([
    ManyToOne(() => Post, (post) => post.ratings, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'postId' }),
    __metadata("design:type", Object)
], Rating.prototype, "post", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], Rating.prototype, "userId", void 0);
__decorate([
    Column('smallint'),
    __metadata("design:type", Number)
], Rating.prototype, "value", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Rating.prototype, "createdAt", void 0);
Rating = __decorate([
    Entity('ratings'),
    Index(['postId', 'userId'], { unique: true }),
    Check(`"value" BETWEEN 1 AND 5`)
], Rating);
export { Rating };
//# sourceMappingURL=rating.entity.js.map