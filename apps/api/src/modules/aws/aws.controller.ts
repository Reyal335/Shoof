import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthUser } from "../auth/auth.types.js";
import { AwsService } from "./aws.services.js";

@Controller('uploads')
export class AwsController {
    constructor(private readonly aws: AwsService) {}

    // Signed in only (global JwtAuthGuard). Returns where to PUT the file and the key to send with the post.
    @Post()
    create(@CurrentUser() user: AuthUser, @Body('contentType') contentType: string) {
        return this.aws.createUploadUrl(user.id, contentType);
    }
}
