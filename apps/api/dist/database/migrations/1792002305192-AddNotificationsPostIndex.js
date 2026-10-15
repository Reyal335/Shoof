export class AddNotificationsPostIndex1792002305192 {
    name = 'AddNotificationsPostIndex1792002305192';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_notifications_post" ON "notifications"  ("postId") WHERE "postId" IS NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_notifications_post"`);
    }
}
//# sourceMappingURL=1792002305192-AddNotificationsPostIndex.js.map