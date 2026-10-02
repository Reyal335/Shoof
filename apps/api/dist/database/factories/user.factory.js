import { faker } from '@faker-js/faker';
import { PasswordHasher } from '@nestjs/authentication';
import { setSeederFactory } from 'typeorm-extension';
import { User, UserRole } from '../../modules/users/entities/user.entity.js';
export const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'Shoof-dev-123!';
let seedPasswordHash;
export function hashSeedPassword() {
    seedPasswordHash ??= new PasswordHasher().hash(SEED_PASSWORD);
    return seedPasswordHash;
}
export default setSeederFactory(User, async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = faker.internet.exampleEmail({ firstName, lastName }).toLowerCase();
    user.username = `${faker.internet.username({ firstName, lastName }).slice(0, 18)}_${faker.string.alphanumeric(5)}`.toLowerCase();
    user.passwordHash = await hashSeedPassword();
    user.isActive = true;
    user.emailVerified = faker.datatype.boolean({ probability: 0.8 });
    user.role = faker.helpers.weightedArrayElement([
        { weight: 8, value: UserRole.MEMBER },
        { weight: 2, value: UserRole.INFLUENCER },
    ]);
    return user;
});
//# sourceMappingURL=user.factory.js.map