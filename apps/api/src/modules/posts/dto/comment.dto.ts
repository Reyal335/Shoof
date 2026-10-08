import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { COMMENT_MAX } from '../posts.constants.js';

// Used to add and to edit a comment
export class CommentDto {
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(COMMENT_MAX)
    content: string;
}
