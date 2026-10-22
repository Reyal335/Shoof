import { ConfigService } from '@nestjs/config';
export declare class AwsService {
    private readonly s3;
    private readonly bucket;
    constructor(config: ConfigService);
    createUploadUrl(userId: string, contentType: string): Promise<{
        key: string;
        url: string;
    }>;
}
