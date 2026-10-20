import { MigrationInterface, QueryRunner } from "typeorm";

// Ratings get an updatedAt (rating again replaces the value), and the cached average on posts moves from one decimal
// to two. The cache is then rebuilt from the ratings table for every post, so it can't carry an old rounding.
//
// Already in place from InitialSchema and kept: the 1..5 check, the unique (postId, userId) index (which also serves
// postId lookups) and ON DELETE CASCADE from posts. ratings.userId deliberately has no foreign key into the users
// module's table, same as posts.userId and comments.userId.
export class RatingsTwoDecimalAverage1792526191133 implements MigrationInterface {
    name = 'RatingsTwoDecimalAverage1792526191133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        // Existing rows were never changed after they were made
        await queryRunner.query(`UPDATE "ratings" SET "updatedAt" = "createdAt"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "rating" TYPE numeric(3,2)`);
        await this.rebuildCache(queryRunner, 2);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "rating" TYPE numeric(2,1)`);
        await this.rebuildCache(queryRunner, 1);
        await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "updatedAt"`);
    }

    // rating and ratingCount from the ratings table, for every post (0 and 0 for posts nobody rated).
    // Leaves updatedAt alone: a recount is not an edit.
    private async rebuildCache(queryRunner: QueryRunner, decimals: 1 | 2): Promise<void> {
        await queryRunner.query(`
            UPDATE "posts" AS p
               SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
              FROM (SELECT p2."id", ROUND(AVG(r."value"), ${decimals}) AS avg, COUNT(r."id")::int AS count
                      FROM "posts" p2 LEFT JOIN "ratings" r ON r."postId" = p2."id"
                     GROUP BY p2."id") AS s
             WHERE s."id" = p."id"`);
    }

}
