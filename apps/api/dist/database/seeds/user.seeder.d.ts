import type { Seeder, SeederFactoryManager } from 'typeorm-extension';
type SeederDataSource = Parameters<Seeder['run']>[0];
export default class UserSeeder implements Seeder {
    run(dataSource: SeederDataSource, factoryManager: SeederFactoryManager): Promise<void>;
}
export {};
