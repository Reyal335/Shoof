import { ConfigService } from '@nestjs/config';
export declare class AwsService {
    private readonly s3;
    private readonly bucket;
    private readonly mediaBaseUrl;
    constructor(config: ConfigService);
    createUploadUrl(userId: string, contentType: string): Promise<{
        key: string;
        url: string;
    }>;
    verifyUpload(userId: string, key: string): Promise<void>;
    publicUrl(key: string): string;
}
