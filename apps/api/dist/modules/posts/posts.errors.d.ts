import { ForbiddenException, NotFoundException } from '@nestjs/common';
export declare const PostErrorCode: {
    readonly PostNotFound: "POST_NOT_FOUND";
    readonly OwnPost: "OWN_POST";
};
export declare function postNotFound(): NotFoundException;
export declare function cannotRateOwnPost(): ForbiddenException;
