import { applyDecorators } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { BIO_MAX, DISPLAY_NAME_MAX, MAX_STACK_PER_GROUP, STACK_NAME_MAX, URL_MAX } from '../users.constants.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
// Blank means "remove it", stored as null
const trimOrNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);

const SITE_URL = { protocols: ['http', 'https'], require_protocol: true, require_tld: true };

const StackGroup = () =>
    applyDecorators(
        IsOptional(),
        IsArray(),
        ArrayMaxSize(MAX_STACK_PER_GROUP),
        IsString({ each: true }),
        IsNotEmpty({ each: true }),
        MaxLength(STACK_NAME_MAX, { each: true }),
    );

// A group that is left out keeps what it has; a group that is sent replaces its whole list.
export class TechStackDto {
    @StackGroup()
    frontend?: string[];

    @StackGroup()
    backend?: string[];

    @StackGroup()
    tools?: string[];
}

// Every field optional: only what is sent changes. The user id always comes from the access token, never the body.
export class UpdateProfileDto {
    @Transform(trim)
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'displayName cannot be blank' })
    @MaxLength(DISPLAY_NAME_MAX)
    displayName?: string;

    @Transform(trimOrNull)
    @IsOptional()
    @IsString()
    @MaxLength(BIO_MAX)
    bio?: string | null;

    // Until avatar uploads go through signed URLs, this is an already-hosted image's https address
    @Transform(trimOrNull)
    @IsOptional()
    @IsUrl({ protocols: ['https'], require_protocol: true, require_tld: true }, { message: 'avatarUrl must be an https:// image address' })
    @MaxLength(URL_MAX)
    avatarUrl?: string | null;

    @Transform(trimOrNull)
    @IsOptional()
    @IsUrl(SITE_URL, { message: 'websiteUrl must be the full address, starting with https://' })
    @MaxLength(URL_MAX)
    websiteUrl?: string | null;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => TechStackDto)
    techStack?: TechStackDto;
}
