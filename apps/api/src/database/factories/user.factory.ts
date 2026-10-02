import { faker } from '@faker-js/faker';
import { PasswordHasher } from '@nestjs/authentication';
import { setSeederFactory } from 'typeorm-extension';
import { User, UserRole } from '../../modules/users/entities/user.entity.js';

/** Every seeded account shares this password, so any of them can log in during development. */
export const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'Shoof-dev-123!';

// scrypt is deliberately slow, so hash once and reuse it for every seeded user.
// Same default parameters as the app's PasswordHasher, so CredentialsService.verify() accepts it.
let seedPasswordHash: Promise<string> | undefined;
export function hashSeedPassword(): Promise<string> {
    seedPasswordHash ??= new PasswordHasher().hash(SEED_PASSWORD);
    return seedPasswordHash;
}

export default setSeederFactory(User, async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    // exampleEmail() only uses reserved example.* domains, so no real inbox is ever addressed.
    user.email = faker.internet.exampleEmail({ firstName, lastName }).toLowerCase();
    // Usernames are 5-25 characters (see SignUpDto); the suffix keeps them unique.
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
