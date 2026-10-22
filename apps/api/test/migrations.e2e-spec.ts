import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DataSource } from 'typeorm';

// Every migration, in order, on a brand-new database (<DB_DATABASE>_migrations, or TEST_MIGRATIONS_DB_DATABASE),
// dropped and recreated on every run. Then the newest migrations go down and up again: the post_media rename must
// keep its data, and the ratings cache rebuild is checked in both directions.
config({ path: resolve(import.meta.dirname, '../../../.env'), quiet: true });
const db = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const MIGRATIONS_DB = process.env.TEST_MIGRATIONS_DB_DATABASE ?? `${process.env.DB_DATABASE}_migrations`;

// The same TypeScript files `pnpm migration:run` uses; vitest compiles them on import
const MIGRATIONS_DIR = resolve(import.meta.dirname, '../src/database/migrations');
async function loadMigrations(): Promise<Function[]> {
  const files = readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.ts')).sort();
  const modules: Record<string, unknown>[] = await Promise.all(files.map((file) => import(pathToFileURL(join(MIGRATIONS_DIR, file)).href)));
  return modules.flatMap((mod) => Object.values(mod).filter((value): value is Function => typeof value === 'function'));
}

describe('Migrations (e2e)', () => {
  let dataSource: DataSource;
  let migrations: Function[];

  const columnType = async (table: string, column: string) => {
    const [row] = await dataSource.query(
      `SELECT data_type, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      [table, column],
    );
    return row as { data_type: string; numeric_precision: number | null; numeric_scale: number | null } | undefined;
  };
  const undo = async (count: number) => {
    for (let i = 0; i < count; i++) await dataSource.undoLastMigration({ transaction: 'each' });
  };
  const postCache = async (id: string) => {
    const [row] = await dataSource.query(`SELECT "rating"::text AS rating, "ratingCount" FROM "posts" WHERE "id" = $1`, [id]);
    return row as { rating: string; ratingCount: number };
  };

  beforeAll(async () => {
    const admin = await new DataSource({ type: 'postgres', ...db, database: 'postgres' }).initialize();
    const name = MIGRATIONS_DB.replace(/"/g, '');
    await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
    await admin.query(`CREATE DATABASE "${name}"`);
    await admin.destroy();

    migrations = await loadMigrations();
    dataSource = await new DataSource({ type: 'postgres', ...db, database: MIGRATIONS_DB, migrations }).initialize();
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('runs every migration up on an empty database', async () => {
    const ran = await dataSource.runMigrations({ transaction: 'each' });
    expect(ran.length).toBe(migrations.length);
    expect(await columnType('posts', 'rating')).toMatchObject({ data_type: 'numeric', numeric_precision: 3, numeric_scale: 2 });
    expect(await columnType('ratings', 'updatedAt')).toMatchObject({ data_type: 'timestamp with time zone' });
    expect(await columnType('post_media', 'key')).toMatchObject({ data_type: 'character varying' });
    expect(await columnType('post_media', 'url')).toBeUndefined();
  });

  it('renames post_media.url to key and back without losing a row', async () => {
    const postId = randomUUID();
    const key = `posts/${randomUUID()}/${randomUUID()}.png`;
    await dataSource.query(
      `INSERT INTO "posts" ("id", "userId", "caption", "description", "link", "category") VALUES ($1, $2, 'c', 'd', 'https://a.example.com', 'games')`,
      [postId, randomUUID()],
    );
    await dataSource.query(`INSERT INTO "post_media" ("postId", "type", "key") VALUES ($1, 'image', $2)`, [postId, key]);

    await undo(1);
    expect(await dataSource.query(`SELECT "url" FROM "post_media" WHERE "postId" = $1`, [postId])).toEqual([{ url: key }]);
    await dataSource.runMigrations({ transaction: 'each' });
    expect(await dataSource.query(`SELECT "key" FROM "post_media" WHERE "postId" = $1`, [postId])).toEqual([{ key }]);
  });

  it('takes the ratings migration down and up again, rebuilding the cached average each way', async () => {
    // The post_media rename sits on top of it, so it comes off first
    await undo(2);
    expect(await columnType('posts', 'rating')).toMatchObject({ numeric_precision: 2, numeric_scale: 1 });
    expect(await columnType('ratings', 'updatedAt')).toBeUndefined();

    // A post with 5, 4 and 4 (average 4.333…) whose cache is wrong, and one nobody rated
    const rated = randomUUID();
    const unrated = randomUUID();
    for (const id of [rated, unrated]) {
      await dataSource.query(
        `INSERT INTO "posts" ("id", "userId", "caption", "description", "link", "category", "rating", "ratingCount")
         VALUES ($1, $2, 'c', 'd', 'https://a.example.com', 'games', 1, 9)`,
        [id, randomUUID()],
      );
    }
    for (const value of [5, 4, 4]) {
      await dataSource.query(`INSERT INTO "ratings" ("postId", "userId", "value") VALUES ($1, $2, $3)`, [rated, randomUUID(), value]);
    }

    await dataSource.runMigrations({ transaction: 'each' });
    expect(await postCache(rated)).toEqual({ rating: '4.33', ratingCount: 3 });
    expect(await postCache(unrated)).toEqual({ rating: '0.00', ratingCount: 0 });
    const [{ same }] = await dataSource.query(`SELECT bool_and("updatedAt" = "createdAt") AS same FROM "ratings"`);
    expect(same).toBe(true);

    await undo(2);
    expect(await postCache(rated)).toEqual({ rating: '4.3', ratingCount: 3 });
    expect(await postCache(unrated)).toEqual({ rating: '0.0', ratingCount: 0 });

    // Leave the database at the latest schema
    await dataSource.runMigrations({ transaction: 'each' });
    expect(await dataSource.showMigrations()).toBe(false);
  });
});
