export class RatingsTwoDecimalAverage1792526191133 {
    name = 'RatingsTwoDecimalAverage1792526191133';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ratings" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`UPDATE "ratings" SET "updatedAt" = "createdAt"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "rating" TYPE numeric(3,2)`);
        await this.rebuildCache(queryRunner, 2);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "rating" TYPE numeric(2,1)`);
        await this.rebuildCache(queryRunner, 1);
        await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "updatedAt"`);
    }
    async rebuildCache(queryRunner, decimals) {
        await queryRunner.query(`
            UPDATE "posts" AS p
               SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
              FROM (SELECT p2."id", ROUND(AVG(r."value"), ${decimals}) AS avg, COUNT(r."id")::int AS count
                      FROM "posts" p2 LEFT JOIN "ratings" r ON r."postId" = p2."id"
                     GROUP BY p2."id") AS s
             WHERE s."id" = p."id"`);
    }
}
//# sourceMappingURL=1792526191133-RatingsTwoDecimalAverage.js.map