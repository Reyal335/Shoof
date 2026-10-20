import { ForbiddenException, NotFoundException } from '@nestjs/common';
export const PostErrorCode = {
    PostNotFound: 'POST_NOT_FOUND',
    OwnPost: 'OWN_POST',
};
export function postNotFound() {
    return new NotFoundException({ statusCode: 404, error: 'Not Found', message: 'Post not found', code: PostErrorCode.PostNotFound });
}
export function cannotRateOwnPost() {
    return new ForbiddenException({ statusCode: 403, error: 'Forbidden', message: "You can't rate your own site.", code: PostErrorCode.OwnPost });
}
//# sourceMappingURL=posts.errors.js.map