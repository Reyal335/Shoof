import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AwsService {
    private readonly s3: S3Client
    private readonly bucket: string

    constructor (
        config: ConfigService,
    ) {
        this.s3 = new S3Client({ region: config.getOrThrow<string>('AWS_REGION') });
        this.bucket = config.getOrThrow<string>('S3_BUCKET')
    }

    async createUploadUrl(userId: string, contentType: string): Promise<{ key: string; url: string }> {
        const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[contentType];
        if (!ext) throw new BadRequestException('Unsupported image type');

        const key = `posts/${userId}/${randomUUID()}.${ext}`;
        const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 minutes is plenty for an upload
        return { key, url };
    }
}