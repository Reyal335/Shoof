import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { PostCategory } from '../entities/post.entity.js';
import { MediaType } from '../entities/media.entity.js';
import { CAPTION_MAX, DESCRIPTION_MAX, MAX_MEDIA, MAX_TECH_STACK, TECH_NAME_MAX, URL_MAX } from '../posts.constants.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Same rule as the web form: an http(s) address with a real hostname
const SITE_URL = { protocols: ['http', 'https'], require_protocol: true, require_tld: true };

export class MediaItemDto {
    @IsEnum(MediaType)
    type: MediaType;

    // Until uploads go through signed URLs this is the already-uploaded file's https address
    @IsUrl({ protocols: ['https'], require_protocol: true })
    @MaxLength(URL_MAX)
    url: string;
}

export class CreatePostDto {
    @IsEnum(PostCategory)
    category: PostCategory;

    @Transform(trim)
    @IsUrl(SITE_URL, { message: 'link must be the full address, starting with https://' })
    @MaxLength(URL_MAX)
    link: string;

    // Blank means no repository, stored as null
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value))
    @IsOptional()
    @IsUrl(SITE_URL, { message: 'repoUrl must be the full address, starting with https://' })
    @MaxLength(URL_MAX)
    repoUrl?: string | null;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(CAPTION_MAX)
    caption: string;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(DESCRIPTION_MAX)
    description: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_TECH_STACK)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @MaxLength(TECH_NAME_MAX, { each: true })
    techStack?: string[];

    // In display order; the first one is the cover
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_MEDIA)
    @ValidateNested({ each: true })
    @Type(() => MediaItemDto)
    media?: MediaItemDto[];
}
