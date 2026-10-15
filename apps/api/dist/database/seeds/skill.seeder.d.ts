import type { Seeder } from 'typeorm-extension';
type SeederDataSource = Parameters<Seeder['run']>[0];
export default class SkillSeeder implements Seeder {
    run(dataSource: SeederDataSource): Promise<void>;
}
export {};
