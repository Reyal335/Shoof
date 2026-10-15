export class MoveProfileTechStackToSkills1792078339883 {
    name = 'MoveProfileTechStackToSkills1792078339883';
    async up(queryRunner) {
        const key = (expr) => `regexp_replace(replace(replace(lower(${expr}), '+', 'plus'), '#', 'sharp'), '[^a-z0-9]', '', 'g')`;
        const names = `SELECT p."userId", t.name, ${key('t.name')} AS key
                       FROM profiles p
                       CROSS JOIN LATERAL jsonb_each(p."techStack") AS g(grp, list)
                       CROSS JOIN LATERAL jsonb_array_elements_text(
                           CASE WHEN jsonb_typeof(g.list) = 'array' THEN g.list ELSE '[]'::jsonb END) AS t(name)`;
        const skillKeys = `SELECT s.id AS "skillId", ${key('k')} AS key
                           FROM skills s CROSS JOIN LATERAL unnest(array_append(s.aliases, s.slug)) AS k`;
        const [{ tagged, skills }] = await queryRunner.query(`
            SELECT (SELECT count(*) FROM (${names}) n)::int AS tagged, (SELECT count(*) FROM skills)::int AS skills`);
        if (tagged > 0 && skills === 0)
            throw new Error('Seed the skills catalog (pnpm run seed:run) before this migration.');
        const unmatched = await queryRunner.query(`
            SELECT n.name, count(*)::int AS profiles FROM (${names}) n
            WHERE NOT EXISTS (SELECT 1 FROM (${skillKeys}) k WHERE k.key = n.key)
            GROUP BY n.name ORDER BY profiles DESC`);
        if (unmatched.length > 0)
            console.warn('MoveProfileTechStackToSkills: no matching skill for', unmatched);
        await queryRunner.query(`
            INSERT INTO user_skills ("userId", "skillId")
            SELECT DISTINCT n."userId", k."skillId" FROM (${names}) n JOIN (${skillKeys}) k ON k.key = n.key
            ON CONFLICT DO NOTHING`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "techStack"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "techStack" jsonb NOT NULL DEFAULT '{"tools": [], "backend": [], "frontend": []}'`);
        await queryRunner.query(`
            UPDATE profiles p
            SET "techStack" = jsonb_build_object('frontend', '[]'::jsonb, 'backend', '[]'::jsonb, 'tools', sub.names)
            FROM (SELECT us."userId", jsonb_agg(s.name ORDER BY s.name) AS names
                  FROM user_skills us JOIN skills s ON s.id = us."skillId" GROUP BY us."userId") sub
            WHERE sub."userId" = p."userId"`);
    }
}
//# sourceMappingURL=1792078339883-MoveProfileTechStackToSkills.js.map