import { Argon2Hasher } from './argon2-password.hasher';

describe('Argon2Hasher', () => {
  const PASSWORD = 'correct-horse-battery';
  const WRONG_PASSWORD = 'correct-horse-batteru';

  // No Nest, no database, no DI container: a plain constructor call, possible
  // because the adapter has no injected dependencies.
  const hasher = new Argon2Hasher();

  it('verifies a correct password', async () => {
    const hash = await hasher.hash(PASSWORD);

    await expect(hasher.verify(hash, PASSWORD)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hasher.hash(PASSWORD);

    // Without this case, a verify() that always returned true would pass.
    await expect(hasher.verify(hash, WRONG_PASSWORD)).resolves.toBe(false);
  });

  it('produces a different hash each time (salting)', async () => {
    const first = await hasher.hash(PASSWORD);
    const second = await hasher.hash(PASSWORD);

    // .not.toBe prints both hashes on failure, unlike expect(a === b).toBe(false).
    expect(first).not.toBe(second);
  });

  it('produces a hash that verifies regardless of which salt was used', async () => {
    // The salt is embedded in the hash string: two different hashes of the same
    // password both verify, and we store no salt anywhere.
    const first = await hasher.hash(PASSWORD);
    const second = await hasher.hash(PASSWORD);

    await expect(hasher.verify(first, PASSWORD)).resolves.toBe(true);
    await expect(hasher.verify(second, PASSWORD)).resolves.toBe(true);
  });
});
