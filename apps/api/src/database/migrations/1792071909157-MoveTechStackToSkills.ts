import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveTechStackToSkills1792071909157 implements MigrationInterface {
    name = 'MoveTechStackToSkills1792071909157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "CHK_f5a54b5c22a74cce80afa06e9c"`);

        // Copy posts.techStack (free-text names) into post_skills before the column is dropped.
        // Matches typed names to skills the way the catalog's slugs and aliases are written: 'Next.js', 'next js',
        // 'NextJS' and 'next-js' all become 'nextjs'; 'C#' becomes 'csharp' and 'C++' 'cplusplus'
        const key = (expr: string) =>
            `regexp_replace(replace(replace(lower(${expr}), '+', 'plus'), '#', 'sharp'), '[^a-z0-9]', '', 'g')`
        const names = `SELECT p.id AS "postId", t.name, ${key('t.name')} AS key
                       FROM posts p CROSS JOIN LATERAL unnest(p."techStack") AS t(name)`
        const skillKeys = `SELECT s.id AS "skillId", ${key('k')} AS key
                           FROM skills s CROSS JOIN LATERAL unnest(array_append(s.aliases, s.slug)) AS k`

        // The catalog comes from SkillSeeder, not a migration. Without it every post would silently lose its stack.
        const [{ tagged, skills }] = await queryRunner.query(`
            SELECT (SELECT count(*) FROM posts WHERE cardinality("techStack") > 0)::int AS tagged,
                   (SELECT count(*) FROM skills)::int AS skills`)
        if (tagged > 0 && skills === 0) throw new Error('Seed the skills catalog (pnpm run seed:run) before this migration.')

        // Names with no matching skill are dropped; list them so common ones can be added to the catalog first
        const unmatched = await queryRunner.query(`
            SELECT n.name, count(*)::int AS posts FROM (${names}) n
            WHERE NOT EXISTS (SELECT 1 FROM (${skillKeys}) k WHERE k.key = n.key)
            GROUP BY n.name ORDER BY posts DESC`)
        if (unmatched.length > 0) console.warn('MoveTechStackToSkills: no matching skill for', unmatched)

        await queryRunner.query(`
            INSERT INTO post_skills ("postId", "skillId")
            SELECT DISTINCT n."postId", k."skillId" FROM (${names}) n JOIN (${skillKeys}) k ON k.key = n.key
            ON CONFLICT DO NOTHING`)

        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "techStack"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "post_skills" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "user_skills" DROP COLUMN "position"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_skills" ADD "position" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post_skills" ADD "position" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "skills" ADD "status" character varying(10) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "techStack" text array NOT NULL DEFAULT '{}'`);
        // Put the names back from post_skills. Lossy: catalog spellings, and names that had no match are gone.
        await queryRunner.query(`
            UPDATE posts p SET "techStack" = sub.names
            FROM (SELECT ps."postId", array_agg(s.name ORDER BY s.name) AS names
                  FROM post_skills ps JOIN skills s ON s.id = ps."skillId" GROUP BY ps."postId") sub
            WHERE sub."postId" = p.id`)
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "CHK_f5a54b5c22a74cce80afa06e9c" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying])::text[])))`);
    }

}
