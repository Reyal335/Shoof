import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSkills1792066749966 implements MigrationInterface {
    name = 'AddSkills1792066749966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(64) NOT NULL, "name" character varying(64) NOT NULL, "kind" character varying(20) NOT NULL, "aliases" text array NOT NULL DEFAULT '{}', "status" character varying(10) NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_55b7acbf80551e7fa2b5a33ed6c" UNIQUE ("slug"), CONSTRAINT "CHK_f5a54b5c22a74cce80afa06e9c" CHECK ("status" IN ('pending', 'approved')), CONSTRAINT "CHK_e0ae49b1fd44f1e8c07472c2eb" CHECK ("kind" IN ('language', 'framework', 'platform', 'discipline')), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_skills" ("postId" uuid NOT NULL, "skillId" uuid NOT NULL, "position" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_ebb4022293ac3d86219e7ba378b" PRIMARY KEY ("postId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ebb4022293ac3d86219e7ba378" ON "post_skills"  ("skillId", "postId") `);
        await queryRunner.query(`CREATE TABLE "user_skills" ("userId" uuid NOT NULL, "skillId" uuid NOT NULL, "position" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_060bea7fd45868588324719de3c" PRIMARY KEY ("userId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_060bea7fd45868588324719de3" ON "user_skills"  ("skillId", "userId") `);
        await queryRunner.query(`ALTER TABLE "post_skills" ADD CONSTRAINT "FK_6440f1624019e9511794843e9d5" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_skills" ADD CONSTRAINT "FK_60177dd93dcdc055e4eaa93bade" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_60177dd93dcdc055e4eaa93bade"`);
        await queryRunner.query(`ALTER TABLE "post_skills" DROP CONSTRAINT "FK_6440f1624019e9511794843e9d5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_060bea7fd45868588324719de3"`);
        await queryRunner.query(`DROP TABLE "user_skills"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebb4022293ac3d86219e7ba378"`);
        await queryRunner.query(`DROP TABLE "post_skills"`);
        await queryRunner.query(`DROP TABLE "skills"`);
    }

}
