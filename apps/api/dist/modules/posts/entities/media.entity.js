var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity.js';
export var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
})(MediaType || (MediaType = {}));
let Media = class Media {
    id;
    postId;
    post;
    type;
    url;
    sortOrder;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Media.prototype, "id", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], Media.prototype, "postId", void 0);
__decorate([
    ManyToOne(() => Post, (post) => post.media, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'postId' }),
    __metadata("design:type", Object)
], Media.prototype, "post", void 0);
__decorate([
    Column({ type: 'enum', enum: MediaType }),
    __metadata("design:type", String)
], Media.prototype, "type", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Media.prototype, "sortOrder", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Media.prototype, "createdAt", void 0);
Media = __decorate([
    Entity('post_media')
], Media);
export { Media };
//# sourceMappingURL=media.entity.js.map