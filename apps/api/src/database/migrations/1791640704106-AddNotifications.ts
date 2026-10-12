import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifications1791640704106 implements MigrationInterface {
    name = 'AddNotifications1791640704106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('follow', 'comment', 'rating')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipientId" uuid NOT NULL, "actorId" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "postId" uuid, "commentId" uuid, "readAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_aa0c97e14385480c73c5ca6023" CHECK (
    ("type" = 'follow' AND "postId" IS NULL AND "commentId" IS NULL) OR
    ("type" = 'comment' AND "postId" IS NOT NULL AND "commentId" IS NOT NULL) OR
    ("type" = 'rating' AND "postId" IS NOT NULL AND "commentId" IS NULL)
), CONSTRAINT "CHK_fa051cf187d5a7d42410bad1b7" CHECK ("actorId" <> "recipientId"), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_notifications_comment" ON "notifications"  ("commentId") WHERE "commentId" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_notifications_rating" ON "notifications"  ("postId", "actorId") WHERE "type" = 'rating'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_notifications_follow" ON "notifications"  ("recipientId", "actorId") WHERE "type" = 'follow'`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_unread" ON "notifications"  ("recipientId") WHERE "readAt" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_22dbdf106e7981d0d8e1aed884" ON "notifications"  ("recipientId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_22dbdf106e7981d0d8e1aed884"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notifications_unread"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_notifications_follow"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_notifications_rating"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_notifications_comment"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
