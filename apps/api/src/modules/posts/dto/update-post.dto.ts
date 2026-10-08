import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto.js';

// Every field optional. `repoUrl: null` clears the repository link; `media`, when sent, replaces the whole set.
export class UpdatePostDto extends PartialType(CreatePostDto) {}
