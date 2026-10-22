import { BadRequestException } from '@nestjs/common';
import type { AwsService } from '../../src/modules/aws/aws.services.js';

export const MEDIA_BASE_URL = 'https://media.example.com';

// Stands in for AwsService so the e2e suites never reach S3. An upload counts as finished when its key sits under
// the caller's folder, which keeps the ownership rule; `missing` holds keys to treat as never uploaded.
export function fakeStorage() {
  const missing = new Set<string>();
  const fake: Pick<AwsService, 'verifyUpload' | 'publicUrl'> & { missing: Set<string> } = {
    missing,
    verifyUpload: async (userId: string, key: string) => {
      if (!key.startsWith(`posts/${userId}/`)) throw new BadRequestException('One of the screenshots is not your upload');
      if (missing.has(key)) throw new BadRequestException('One of the screenshots never finished uploading');
    },
    publicUrl: (key: string) => `${MEDIA_BASE_URL}/${key}`,
  };
  return fake;
}
