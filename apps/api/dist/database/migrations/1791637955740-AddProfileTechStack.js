export class AddProfileTechStack1791637955740 {
    name = 'AddProfileTechStack1791637955740';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "techStack" jsonb NOT NULL DEFAULT '{"tools": [], "backend": [], "frontend": []}'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "techStack"`);
    }
}
//# sourceMappingURL=1791637955740-AddProfileTechStack.js.map