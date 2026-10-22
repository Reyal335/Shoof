import type { AuthUser } from "../auth/auth.types.js";
import { AwsService } from "./aws.services.js";
export declare class AwsController {
    private readonly aws;
    constructor(aws: AwsService);
    create(user: AuthUser, contentType: string): Promise<{
        key: string;
        url: string;
    }>;
}
