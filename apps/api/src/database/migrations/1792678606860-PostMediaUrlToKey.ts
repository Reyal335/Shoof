import { MigrationInterface, QueryRunner } from "typeorm";

// post_media holds the file's storage key instead of a URL: screenshots are now uploaded to our own bucket through
// signed URLs, and the public URL is built from MEDIA_BASE_URL on read. A rename, not drop-and-add, so existing rows
// keep their value (rows saved before this held full URLs and should be cleared in dev).
export class PostMediaUrlToKey1792678606860 implements MigrationInterface {
    name = 'PostMediaUrlToKey1792678606860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_media" RENAME COLUMN "url" TO "key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_media" RENAME COLUMN "key" TO "url"`);
    }

}
