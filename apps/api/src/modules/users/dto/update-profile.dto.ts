import { Transform } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    MaxLength
} from 'class-validator';
import { BIO_MAX, DISPLAY_NAME_MAX, MAX_PROFILE_SKILLS, URL_MAX } from '../users.constants.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
// Blank means "remove it", stored as null
const trimOrNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);

const SITE_URL = { protocols: ['http', 'https'], require_protocol: true, require_tld: true };

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

    // Picked from GET /skills. Left out keeps the current skills; sent (even []) replaces the whole set.
    // UsersService checks each id exists in the catalog.
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_PROFILE_SKILLS)
    @ArrayUnique()
    @IsUUID('all', { each: true })
    skillIds?: string[];
}
