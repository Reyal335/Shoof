import { IsIn } from 'class-validator';

/** PUT /posts/:postId/ratings/me. 0 is not a rating: removing one is DELETE. */
export class RatePostDto {
    // One strict check, so every bad value gets exactly one message: a missing value, null, a string ("4" too: there
    // is no implicit conversion), 2.5, 0 and 6 are all refused
    @IsIn([1, 2, 3, 4, 5], { message: 'Rating must be a whole number from 1 to 5.' })
    value: number;
}
