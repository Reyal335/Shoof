var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
let AwsService = class AwsService {
    s3;
    bucket;
    constructor(config) {
        this.s3 = new S3Client({ region: config.getOrThrow('AWS_REGION') });
        this.bucket = config.getOrThrow('S3_BUCKET');
    }
    async createUploadUrl(userId, contentType) {
        const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[contentType];
        if (!ext)
            throw new BadRequestException('Unsupported image type');
        const key = `posts/${userId}/${randomUUID()}.${ext}`;
        const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });
        return { key, url };
    }
};
AwsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], AwsService);
export { AwsService };
//# sourceMappingURL=aws.services.js.map