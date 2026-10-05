import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Skips the global access-token guard: sign-in, refresh, public pages
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
