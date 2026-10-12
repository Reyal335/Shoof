import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791566462642 implements MigrationInterface {
    name = 'InitialSchema1791566462642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Baseline: the whole schema as it stood when `synchronize` was switched off. uuid_generate_v4() comes from
        // uuid-ossp; create it here so the migration works on a brand-new database. down() leaves it installed.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "user_identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "provider" character varying(40) NOT NULL, "providerUserId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_87b5856b206b5b77e6e2fa29508" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6d46a525c55104a04b24cb6639" ON "user_identity"  ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e6fd6fd9f93b61e512284b658e" ON "user_identity"  ("provider", "providerUserId") `);
        await queryRunner.query(`CREATE TABLE "profiles" ("userId" uuid NOT NULL, "displayName" character varying(80) NOT NULL, "bio" text, "avatarUrl" character varying, "websiteUrl" character varying, "links" jsonb NOT NULL DEFAULT '[]', "country" character(2), "locale" character varying(10), "timezone" character varying(64), "currency" character(3), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_315ecd98bd1a42dcf2ec4e2e985" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('Guest', 'Member', 'Influencer', 'Moderator', 'Admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(150) NOT NULL, "username" character varying(150) NOT NULL, "passwordHash" character varying, "isActive" boolean NOT NULL DEFAULT true, "emailVerified" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL DEFAULT 'Member', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "follows" ("followerId" uuid NOT NULL, "followingId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_e304c9a4ada5815ab376bedfec" CHECK ("followerId" <> "followingId"), CONSTRAINT "PK_105079775692df1f8799ed0fac8" PRIMARY KEY ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows"  ("followingId") `);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "familyId" uuid NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "familyExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens"  ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_40e9a8b923a1b3fb4429a5c624" ON "refresh_tokens"  ("familyId") `);
        await queryRunner.query(`CREATE TYPE "public"."post_media_type_enum" AS ENUM('image', 'video')`);
        await queryRunner.query(`CREATE TABLE "post_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, "type" "public"."post_media_type_enum" NOT NULL, "url" character varying NOT NULL, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_049edb1ce7ab3d2a98009b171d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4adcc5190e3b5c7e9001adef3b" ON "post_media"  ("postId") `);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, "userId" uuid NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e44ddaaa6d058cb4092f83ad61" ON "comments"  ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7e8d7c49f218ebb14314fdb374" ON "comments"  ("userId") `);
        await queryRunner.query(`CREATE TABLE "ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, "userId" uuid NOT NULL, "value" smallint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_9cf0acac1b57c4eefb4bd39dab" CHECK ("value" BETWEEN 1 AND 5), CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4d0b0e3a4c4af854d225154ba4" ON "ratings"  ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_777d9d91ce5540816cc5ec238a" ON "ratings"  ("postId", "userId") `);
        await queryRunner.query(`CREATE TYPE "public"."posts_category_enum" AS ENUM('games', 'portfolios', 'saas', 'css_ui', 'misc')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "caption" character varying(150) NOT NULL, "description" text NOT NULL, "link" character varying NOT NULL, "repoUrl" character varying, "techStack" text array NOT NULL DEFAULT '{}', "category" "public"."posts_category_enum" NOT NULL, "rating" numeric(2,1) NOT NULL DEFAULT '0', "ratingCount" integer NOT NULL DEFAULT '0', "visitCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_f6ad5765d45d34ce2a758fc8ab" CHECK ("ratingCount" >= 0 AND "visitCount" >= 0), CONSTRAINT "CHK_7f2ebb5107d019e8a6cd25bb6d" CHECK ("rating" BETWEEN 0 AND 5), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae05faaa55c866130abef6e1fe" ON "posts"  ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_identity" ADD CONSTRAINT "FK_6d46a525c55104a04b24cb66391" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_media" ADD CONSTRAINT "FK_4adcc5190e3b5c7e9001adef3b8" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_efec1f4c98e55e12969969cd9ad" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_efec1f4c98e55e12969969cd9ad"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`ALTER TABLE "post_media" DROP CONSTRAINT "FK_4adcc5190e3b5c7e9001adef3b8"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985"`);
        await queryRunner.query(`ALTER TABLE "user_identity" DROP CONSTRAINT "FK_6d46a525c55104a04b24cb66391"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae05faaa55c866130abef6e1fe"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_777d9d91ce5540816cc5ec238a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d0b0e3a4c4af854d225154ba4"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7e8d7c49f218ebb14314fdb374"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e44ddaaa6d058cb4092f83ad61"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4adcc5190e3b5c7e9001adef3b"`);
        await queryRunner.query(`DROP TABLE "post_media"`);
        await queryRunner.query(`DROP TYPE "public"."post_media_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40e9a8b923a1b3fb4429a5c624"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6fd6fd9f93b61e512284b658e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d46a525c55104a04b24cb6639"`);
        await queryRunner.query(`DROP TABLE "user_identity"`);
    }

}
