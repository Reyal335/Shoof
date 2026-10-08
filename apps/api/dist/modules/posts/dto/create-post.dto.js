var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { PostCategory } from '../entities/post.entity.js';
import { MediaType } from '../entities/media.entity.js';
import { CAPTION_MAX, DESCRIPTION_MAX, MAX_MEDIA, MAX_TECH_STACK, TECH_NAME_MAX, URL_MAX } from '../posts.constants.js';
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
const SITE_URL = { protocols: ['http', 'https'], require_protocol: true, require_tld: true };
export class MediaItemDto {
    type;
    url;
}
__decorate([
    IsEnum(MediaType),
    __metadata("design:type", String)
], MediaItemDto.prototype, "type", void 0);
__decorate([
    IsUrl({ protocols: ['https'], require_protocol: true }),
    MaxLength(URL_MAX),
    __metadata("design:type", String)
], MediaItemDto.prototype, "url", void 0);
export class CreatePostDto {
    category;
    link;
    repoUrl;
    caption;
    description;
    techStack;
    media;
}
__decorate([
    IsEnum(PostCategory),
    __metadata("design:type", String)
], CreatePostDto.prototype, "category", void 0);
__decorate([
    Transform(trim),
    IsUrl(SITE_URL, { message: 'link must be the full address, starting with https://' }),
    MaxLength(URL_MAX),
    __metadata("design:type", String)
], CreatePostDto.prototype, "link", void 0);
__decorate([
    Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value)),
    IsOptional(),
    IsUrl(SITE_URL, { message: 'repoUrl must be the full address, starting with https://' }),
    MaxLength(URL_MAX),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "repoUrl", void 0);
__decorate([
    Transform(trim),
    IsString(),
    IsNotEmpty(),
    MaxLength(CAPTION_MAX),
    __metadata("design:type", String)
], CreatePostDto.prototype, "caption", void 0);
__decorate([
    Transform(trim),
    IsString(),
    IsNotEmpty(),
    MaxLength(DESCRIPTION_MAX),
    __metadata("design:type", String)
], CreatePostDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(MAX_TECH_STACK),
    IsString({ each: true }),
    IsNotEmpty({ each: true }),
    MaxLength(TECH_NAME_MAX, { each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "techStack", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    ArrayMaxSize(MAX_MEDIA),
    ValidateNested({ each: true }),
    Type(() => MediaItemDto),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "media", void 0);
//# sourceMappingURL=create-post.dto.js.map