import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileTechStack1791637955740 implements MigrationInterface {
    name = 'AddProfileTechStack1791637955740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Existing rows get the empty stack from the default, so every profile has all three groups
        await queryRunner.query(`ALTER TABLE "profiles" ADD "techStack" jsonb NOT NULL DEFAULT '{"tools": [], "backend": [], "frontend": []}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "techStack"`);
    }

}
