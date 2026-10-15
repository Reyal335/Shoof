import type { Seeder } from 'typeorm-extension';
import { Skill, type SkillKind } from '../../modules/skills/entities/skill.entity.js';

type SeederDataSource = Parameters<Seeder['run']>[0];

// [slug, display name, aliases]. Slugs and aliases are lowercase URL keys; multi-word ones use hyphens.
type SkillSeed = [slug: string, name: string, aliases?: string[]];

// The curated starting catalog. Unlike UserSeeder this is real reference data, so it is safe to run in production.
// Engines count as frameworks; apps, services and datastores as platforms (see skill.entity.ts).
const CATALOG: Record<SkillKind, SkillSeed[]> = {
    language: [
        ['javascript', 'JavaScript', ['js', 'ecmascript']],
        ['typescript', 'TypeScript', ['ts']],
        ['html', 'HTML', ['html5']],
        ['css', 'CSS', ['css3']],
        ['sass', 'Sass', ['scss']],
        ['sql', 'SQL'],
        ['graphql', 'GraphQL', ['gql']],
        ['python', 'Python', ['py']],
        ['java', 'Java'],
        ['kotlin', 'Kotlin', ['kt']],
        ['csharp', 'C#', ['c-sharp', 'cs']],
        ['cplusplus', 'C++', ['cpp', 'c-plus-plus']],
        ['c', 'C'],
        ['go', 'Go', ['golang']],
        ['rust', 'Rust', ['rs']],
        ['php', 'PHP'],
        ['ruby', 'Ruby', ['rb']],
        ['elixir', 'Elixir'],
        ['swift', 'Swift'],
        ['dart', 'Dart'],
        ['lua', 'Lua'],
        ['gdscript', 'GDScript'],
        ['glsl', 'GLSL'],
        ['bash', 'Bash', ['shell', 'sh']],
        ['webassembly', 'WebAssembly', ['wasm']],
    ],
    framework: [
        // Frontend
        ['react', 'React', ['reactjs', 'react-js']],
        ['nextjs', 'Next.js', ['next', 'next-js']],
        ['vue', 'Vue', ['vuejs', 'vue-js']],
        ['nuxt', 'Nuxt', ['nuxtjs', 'nuxt-js']],
        ['angular', 'Angular'],
        ['svelte', 'Svelte'],
        ['sveltekit', 'SvelteKit'],
        ['solidjs', 'SolidJS', ['solid']],
        ['astro', 'Astro'],
        ['remix', 'Remix'],
        ['gatsby', 'Gatsby'],
        ['htmx', 'htmx'],
        ['alpinejs', 'Alpine.js', ['alpine']],
        ['jquery', 'jQuery'],
        ['tailwindcss', 'Tailwind CSS', ['tailwind']],
        ['bootstrap', 'Bootstrap'],
        ['shadcn-ui', 'shadcn/ui', ['shadcn']],
        ['redux', 'Redux'],
        ['tanstack-query', 'TanStack Query', ['react-query']],
        ['threejs', 'Three.js', ['three']],
        ['d3', 'D3.js', ['d3js']],
        // Backend
        ['express', 'Express', ['expressjs']],
        ['nestjs', 'NestJS', ['nest']],
        ['fastify', 'Fastify'],
        ['hono', 'Hono'],
        ['trpc', 'tRPC'],
        ['django', 'Django'],
        ['flask', 'Flask'],
        ['fastapi', 'FastAPI'],
        ['rails', 'Ruby on Rails', ['ruby-on-rails', 'ror']],
        ['laravel', 'Laravel'],
        ['spring-boot', 'Spring Boot', ['spring']],
        ['aspnet-core', 'ASP.NET Core', ['aspnet']],
        ['phoenix', 'Phoenix'],
        ['prisma', 'Prisma'],
        ['typeorm', 'TypeORM'],
        ['drizzle', 'Drizzle ORM', ['drizzle-orm']],
        // Mobile and desktop
        ['react-native', 'React Native'],
        ['expo', 'Expo'],
        ['flutter', 'Flutter'],
        ['electron', 'Electron', ['electronjs']],
        ['tauri', 'Tauri'],
        // Testing
        ['jest', 'Jest'],
        ['vitest', 'Vitest'],
        ['playwright', 'Playwright'],
        ['cypress', 'Cypress'],
        // Game engines
        ['godot', 'Godot', ['godot-engine']],
        ['unity', 'Unity', ['unity3d']],
        ['unreal-engine', 'Unreal Engine', ['unreal', 'ue5']],
        ['gamemaker', 'GameMaker', ['game-maker']],
        ['phaser', 'Phaser', ['phaserjs']],
        ['pixijs', 'PixiJS', ['pixi']],
        ['bevy', 'Bevy'],
        ['love2d', 'LÖVE', ['love']],
    ],
    platform: [
        // Runtimes and build tools
        ['nodejs', 'Node.js', ['node', 'node-js']],
        ['deno', 'Deno'],
        ['bun', 'Bun'],
        ['vite', 'Vite'],
        ['webpack', 'webpack'],
        ['storybook', 'Storybook'],
        // Datastores and backend services
        ['postgresql', 'PostgreSQL', ['postgres', 'pg']],
        ['mysql', 'MySQL'],
        ['sqlite', 'SQLite'],
        ['mongodb', 'MongoDB', ['mongo']],
        ['redis', 'Redis'],
        ['supabase', 'Supabase'],
        ['firebase', 'Firebase'],
        // Infrastructure and hosting
        ['docker', 'Docker'],
        ['kubernetes', 'Kubernetes', ['k8s']],
        ['nginx', 'NGINX'],
        ['linux', 'Linux'],
        ['aws', 'AWS', ['amazon-web-services']],
        ['google-cloud', 'Google Cloud', ['gcp']],
        ['azure', 'Microsoft Azure', ['microsoft-azure']],
        ['vercel', 'Vercel'],
        ['netlify', 'Netlify'],
        ['cloudflare', 'Cloudflare'],
        // Version control
        ['git', 'Git'],
        ['github', 'GitHub'],
        ['gitlab', 'GitLab'],
        // Site builders and CMS
        ['wordpress', 'WordPress', ['wp']],
        ['webflow', 'Webflow'],
        ['framer', 'Framer'],
        ['shopify', 'Shopify'],
        // Mobile OSes
        ['android', 'Android'],
        ['ios', 'iOS'],
        // Design and creative software
        ['figma', 'Figma'],
        ['sketch', 'Sketch'],
        ['photoshop', 'Adobe Photoshop', ['adobe-photoshop']],
        ['illustrator', 'Adobe Illustrator', ['adobe-illustrator']],
        ['after-effects', 'Adobe After Effects', ['adobe-after-effects']],
        ['premiere-pro', 'Adobe Premiere Pro', ['adobe-premiere-pro', 'premiere']],
        ['affinity-designer', 'Affinity Designer'],
        ['blender', 'Blender'],
        ['aseprite', 'Aseprite'],
        ['procreate', 'Procreate'],
        ['krita', 'Krita'],
        ['clip-studio-paint', 'Clip Studio Paint', ['csp']],
        ['davinci-resolve', 'DaVinci Resolve'],
    ],
    discipline: [
        // Development
        ['frontend-development', 'Frontend Development', ['frontend', 'front-end']],
        ['backend-development', 'Backend Development', ['backend', 'back-end']],
        ['full-stack-development', 'Full-Stack Development', ['full-stack', 'fullstack']],
        ['mobile-development', 'Mobile Development', ['mobile-dev']],
        ['game-development', 'Game Development', ['gamedev']],
        ['api-design', 'API Design'],
        ['devops', 'DevOps'],
        ['web-performance', 'Web Performance'],
        ['web-security', 'Web Security'],
        ['accessibility', 'Accessibility', ['a11y']],
        ['seo', 'SEO', ['search-engine-optimization']],
        ['creative-coding', 'Creative Coding'],
        ['data-visualization', 'Data Visualization', ['dataviz']],
        ['technical-writing', 'Technical Writing'],
        // Design
        ['ui-design', 'UI Design'],
        ['ux-design', 'UX Design'],
        ['product-design', 'Product Design'],
        ['interaction-design', 'Interaction Design'],
        ['web-design', 'Web Design'],
        ['graphic-design', 'Graphic Design'],
        ['branding', 'Branding', ['brand-identity']],
        ['logo-design', 'Logo Design'],
        ['typography', 'Typography'],
        // Art and media
        ['illustration', 'Illustration'],
        ['concept-art', 'Concept Art'],
        ['character-design', 'Character Design'],
        ['pixel-art', 'Pixel Art'],
        ['3d-modeling', '3D Modeling', ['3d-modelling']],
        ['animation', 'Animation'],
        ['motion-design', 'Motion Design', ['motion-graphics']],
        ['photography', 'Photography'],
        ['video-editing', 'Video Editing'],
        ['sound-design', 'Sound Design'],
        ['music-production', 'Music Production'],
        // Games
        ['game-design', 'Game Design'],
        ['level-design', 'Level Design'],
    ],
};

// An alias that is also another skill's slug or alias would make typed names ambiguous; fail before writing anything.
function assertUniqueKeys(rows: Pick<Skill, 'slug' | 'aliases'>[]): void {
    const seen = new Map<string, string>();
    for (const { slug, aliases } of rows) {
        for (const key of [slug, ...aliases]) {
            const owner = seen.get(key);
            if (owner) throw new Error(`SkillSeeder: "${key}" is used by both "${owner}" and "${slug}".`);
            seen.set(key, slug);
        }
    }
}

export default class SkillSeeder implements Seeder {
    async run(dataSource: SeederDataSource): Promise<void> {
        const rows = (Object.entries(CATALOG) as [SkillKind, SkillSeed[]][]).flatMap(([kind, seeds]) =>
            seeds.map(([slug, name, aliases = []]) => ({ slug, name, kind, aliases, status: 'approved' as const })),
        );
        assertUniqueKeys(rows);

        // Upsert on slug: re-running applies edits to this list, and approves any matching skill a user typed in.
        await dataSource.getRepository(Skill).upsert(rows, { conflictPaths: ['slug'] });

        console.log(`SkillSeeder: upserted ${rows.length} approved skills.`);
    }
}
