import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveProfileTechStackToSkills1792078339883 implements MigrationInterface {
    name = 'MoveProfileTechStackToSkills1792078339883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Copy profiles.techStack ({ frontend, backend, tools } of free-text names) into user_skills before the column
        // is dropped. Same matching as MoveTechStackToSkills: 'Next.js', 'next js', 'NextJS' and 'next-js' all become
        // 'nextjs'; 'C#' becomes 'csharp' and 'C++' 'cplusplus'
        const key = (expr: string) =>
            `regexp_replace(replace(replace(lower(${expr}), '+', 'plus'), '#', 'sharp'), '[^a-z0-9]', '', 'g')`
        // Every group in the object, whatever groups a row happens to have
        const names = `SELECT p."userId", t.name, ${key('t.name')} AS key
                       FROM profiles p
                       CROSS JOIN LATERAL jsonb_each(p."techStack") AS g(grp, list)
                       CROSS JOIN LATERAL jsonb_array_elements_text(
                           CASE WHEN jsonb_typeof(g.list) = 'array' THEN g.list ELSE '[]'::jsonb END) AS t(name)`
        const skillKeys = `SELECT s.id AS "skillId", ${key('k')} AS key
                           FROM skills s CROSS JOIN LATERAL unnest(array_append(s.aliases, s.slug)) AS k`

        // The catalog comes from SkillSeeder, not a migration. Without it every profile would silently lose its stack.
        const [{ tagged, skills }] = await queryRunner.query(`
            SELECT (SELECT count(*) FROM (${names}) n)::int AS tagged, (SELECT count(*) FROM skills)::int AS skills`)
        if (tagged > 0 && skills === 0) throw new Error('Seed the skills catalog (pnpm run seed:run) before this migration.')

        // Names with no matching skill are dropped; list them so common ones can be added to the catalog first
        const unmatched = await queryRunner.query(`
            SELECT n.name, count(*)::int AS profiles FROM (${names}) n
            WHERE NOT EXISTS (SELECT 1 FROM (${skillKeys}) k WHERE k.key = n.key)
            GROUP BY n.name ORDER BY profiles DESC`)
        if (unmatched.length > 0) console.warn('MoveProfileTechStackToSkills: no matching skill for', unmatched)

        await queryRunner.query(`
            INSERT INTO user_skills ("userId", "skillId")
            SELECT DISTINCT n."userId", k."skillId" FROM (${names}) n JOIN (${skillKeys}) k ON k.key = n.key
            ON CONFLICT DO NOTHING`)

        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "techStack"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "techStack" jsonb NOT NULL DEFAULT '{"tools": [], "backend": [], "frontend": []}'`);
        // Put the names back from user_skills. Lossy: catalog spellings, names that had no match are gone, and every
        // skill comes back under "tools" because the old groups weren't kept.
        await queryRunner.query(`
            UPDATE profiles p
            SET "techStack" = jsonb_build_object('frontend', '[]'::jsonb, 'backend', '[]'::jsonb, 'tools', sub.names)
            FROM (SELECT us."userId", jsonb_agg(s.name ORDER BY s.name) AS names
                  FROM user_skills us JOIN skills s ON s.id = us."skillId" GROUP BY us."userId") sub
            WHERE sub."userId" = p."userId"`)
    }

}
