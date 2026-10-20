import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto.js';

// Every field optional. `repoUrl: null` clears the repository link; `media` and `skillIds`, when sent, replace the
// whole set. Left out, they keep what the post has.
export class UpdatePostDto extends PartialType(CreatePostDto) {}
