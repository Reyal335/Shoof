var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { applyDecorators } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { BIO_MAX, DISPLAY_NAME_MAX, MAX_STACK_PER_GROUP, STACK_NAME_MAX, URL_MAX } from '../users.constants.js';
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
const trimOrNull = ({ value }) => (typeof value === 'string' ? value.trim() || null : value);
const SITE_URL = { protocols: ['http', 'https'], require_protocol: true, require_tld: true };
const StackGroup = () => applyDecorators(IsOptional(), IsArray(), ArrayMaxSize(MAX_STACK_PER_GROUP), IsString({ each: true }), IsNotEmpty({ each: true }), MaxLength(STACK_NAME_MAX, { each: true }));
export class TechStackDto {
    frontend;
    backend;
    tools;
}
__decorate([
    StackGroup(),
    __metadata("design:type", Array)
], TechStackDto.prototype, "frontend", void 0);
__decorate([
    StackGroup(),
    __metadata("design:type", Array)
], TechStackDto.prototype, "backend", void 0);
__decorate([
    StackGroup(),
    __metadata("design:type", Array)
], TechStackDto.prototype, "tools", void 0);
export class UpdateProfileDto {
    displayName;
    bio;
    avatarUrl;
    websiteUrl;
    techStack;
}
__decorate([
    Transform(trim),
    IsOptional(),
    IsString(),
    IsNotEmpty({ message: 'displayName cannot be blank' }),
    MaxLength(DISPLAY_NAME_MAX),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "displayName", void 0);
__decorate([
    Transform(trimOrNull),
    IsOptional(),
    IsString(),
    MaxLength(BIO_MAX),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    Transform(trimOrNull),
    IsOptional(),
    IsUrl({ protocols: ['https'], require_protocol: true, require_tld: true }, { message: 'avatarUrl must be an https:// image address' }),
    MaxLength(URL_MAX),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "avatarUrl", void 0);
__decorate([
    Transform(trimOrNull),
    IsOptional(),
    IsUrl(SITE_URL, { message: 'websiteUrl must be the full address, starting with https://' }),
    MaxLength(URL_MAX),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "websiteUrl", void 0);
__decorate([
    IsOptional(),
    IsObject(),
    ValidateNested(),
    Type(() => TechStackDto),
    __metadata("design:type", TechStackDto)
], UpdateProfileDto.prototype, "techStack", void 0);
//# sourceMappingURL=update-profile.dto.js.map