import { Module } from "@nestjs/common";
import { AwsController } from "./aws.controller.js";
import { AwsService } from "./aws.services.js";

@Module({
    controllers: [AwsController],
    providers: [AwsService],
    exports: [AwsService]
})
export class AwsModule {}