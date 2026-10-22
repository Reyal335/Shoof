export class PostMediaUrlToKey1792678606860 {
    name = 'PostMediaUrlToKey1792678606860';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "post_media" RENAME COLUMN "url" TO "key"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "post_media" RENAME COLUMN "key" TO "url"`);
    }
}
//# sourceMappingURL=1792678606860-PostMediaUrlToKey.js.map