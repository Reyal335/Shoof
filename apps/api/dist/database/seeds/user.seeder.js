import { User, UserRole } from '../../modules/users/entities/user.entity.js';
import { hashSeedPassword, SEED_PASSWORD } from '../factories/user.factory.js';
const DEMO_EMAIL = 'demo@example.com';
const FAKE_USER_COUNT = 25;
export default class UserSeeder {
    async run(dataSource, factoryManager) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('UserSeeder creates accounts with a shared, known password; refusing to run in production.');
        }
        const users = dataSource.getRepository(User);
        if (await users.existsBy({ email: DEMO_EMAIL })) {
            console.log(`UserSeeder: ${DEMO_EMAIL} already exists, skipping.`);
            return;
        }
        await users.insert({
            email: DEMO_EMAIL,
            username: 'demo_user',
            firstName: 'Demo',
            lastName: 'User',
            passwordHash: await hashSeedPassword(),
            emailVerified: true,
            role: UserRole.MEMBER,
        });
        await factoryManager.get(User).saveMany(FAKE_USER_COUNT);
        console.log(`UserSeeder: created ${DEMO_EMAIL} and ${FAKE_USER_COUNT} fake users. ` +
            `All share the password "${SEED_PASSWORD}".`);
    }
}
//# sourceMappingURL=user.seeder.js.map