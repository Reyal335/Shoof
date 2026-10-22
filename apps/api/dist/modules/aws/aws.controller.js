var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { AwsService } from "./aws.services.js";
let AwsController = class AwsController {
    aws;
    constructor(aws) {
        this.aws = aws;
    }
    create(user, contentType) {
        return this.aws.createUploadUrl(user.id, contentType);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUser()),
    __param(1, Body('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AwsController.prototype, "create", null);
AwsController = __decorate([
    Controller('uploads'),
    __metadata("design:paramtypes", [AwsService])
], AwsController);
export { AwsController };
//# sourceMappingURL=aws.controller.js.map