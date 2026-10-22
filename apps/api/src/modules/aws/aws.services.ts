import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, HeadObjectCommand, NotFound, type HeadObjectCommandOutput } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config';

// The image types a screenshot can be, and the extension its key gets. Same list as the web form.
const IMAGE_TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

@Injectable()
export class AwsService {
    private readonly s3: S3Client
    private readonly bucket: string
    private readonly mediaBaseUrl: string

    constructor (
        config: ConfigService,
    ) {
        this.s3 = new S3Client({ region: config.getOrThrow<string>('AWS_REGION') });
        this.bucket = config.getOrThrow<string>('S3_BUCKET')
        this.mediaBaseUrl = config.getOrThrow<string>('MEDIA_BASE_URL').replace(/\/+$/, '')
    }

    async createUploadUrl(userId: string, contentType: string): Promise<{ key: string; url: string }> {
        const ext = IMAGE_TYPES[contentType];
        if (!ext) throw new BadRequestException('Unsupported image type');

        const key = `posts/${userId}/${randomUUID()}.${ext}`;
        const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 minutes is plenty for an upload
        return { key, url };
    }

    /**
     * Throws unless `key` is one of `userId`'s uploads and really landed as an image under the size limit. A presigned
     * PUT can't cap the size, so it is checked here, before a post may use the file.
     */
    async verifyUpload(userId: string, key: string): Promise<void> {
        if (!key.startsWith(`posts/${userId}/`)) throw new BadRequestException('One of the screenshots is not your upload');

        let head: HeadObjectCommandOutput;
        try {
            head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
        } catch (err) {
            // Anything else (403, network) is our configuration, not the caller's mistake, so it stays a 500
            if (err instanceof NotFound) throw new BadRequestException('One of the screenshots never finished uploading');
            throw err;
        }
        if ((head.ContentLength ?? 0) > MAX_UPLOAD_BYTES) throw new BadRequestException('Screenshots must be 5 MB or smaller');
        if (!head.ContentType || !IMAGE_TYPES[head.ContentType]) throw new BadRequestException('Screenshots must be PNG, JPG, WebP or GIF');
    }

    /** Where the public reads `key` from: the CDN, or the bucket while there is none. */
    publicUrl(key: string): string {
        return `${this.mediaBaseUrl}/${key}`;
    }
}
