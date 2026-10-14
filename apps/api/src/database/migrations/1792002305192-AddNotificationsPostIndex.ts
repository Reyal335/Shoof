import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsPostIndex1792002305192 implements MigrationInterface {
    name = 'AddNotificationsPostIndex1792002305192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_notifications_post" ON "notifications"  ("postId") WHERE "postId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_notifications_post"`);
    }

}
