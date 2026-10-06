var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Media } from './media.entity.js';
import { Comment } from './comment.entity.js';
import { Rating } from './rating.entity.js';
export var PostCategory;
(function (PostCategory) {
    PostCategory["GAMES"] = "games";
    PostCategory["PORTFOLIOS"] = "portfolios";
    PostCategory["SAAS"] = "saas";
    PostCategory["CSS_UI"] = "css_ui";
    PostCategory["MISC"] = "misc";
})(PostCategory || (PostCategory = {}));
let Post = class Post {
    id;
    userId;
    caption;
    description;
    link;
    repoUrl;
    techStack;
    category;
    rating;
    ratingCount;
    visitCount;
    media;
    comments;
    ratings;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], Post.prototype, "userId", void 0);
__decorate([
    Column({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Post.prototype, "caption", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Post.prototype, "description", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Post.prototype, "link", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "repoUrl", void 0);
__decorate([
    Column('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], Post.prototype, "techStack", void 0);
__decorate([
    Column({ type: 'enum', enum: PostCategory }),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    Column({
        type: 'decimal',
        precision: 2,
        scale: 1,
        default: 0,
        transformer: { to: (value) => value, from: (value) => Number(value) }
    }),
    __metadata("design:type", Number)
], Post.prototype, "rating", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "ratingCount", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "visitCount", void 0);
__decorate([
    OneToMany(() => Media, (media) => media.post),
    __metadata("design:type", Object)
], Post.prototype, "media", void 0);
__decorate([
    OneToMany(() => Comment, (comment) => comment.post),
    __metadata("design:type", Object)
], Post.prototype, "comments", void 0);
__decorate([
    OneToMany(() => Rating, (rating) => rating.post),
    __metadata("design:type", Object)
], Post.prototype, "ratings", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
Post = __decorate([
    Entity('posts')
], Post);
export { Post };
//# sourceMappingURL=post.entity.js.map