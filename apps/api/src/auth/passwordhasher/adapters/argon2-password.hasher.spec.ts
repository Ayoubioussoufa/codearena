import { Argon2Hasher } from './argon2-password.hasher';

// TIP: name the describe after the UNIT UNDER TEST, not the topic.
// When 40 suites fail in CI, "Argon2Hasher" tells you where to look.
describe('Argon2Hasher', () => {
  // TIP: name constants by their ROLE in the test, not by number.
  // `WRONG_PASSWORD` says what it's for; `PASSWORD2` makes the reader work it out.
  const PASSWORD = 'correct-horse-battery';
  const WRONG_PASSWORD = 'correct-horse-batteru';

  // No Nest, no database, no DI container — a plain constructor call.
  // This is only possible because the adapter has no injected dependencies.
  const hasher = new Argon2Hasher();

  // TIP: name each `it` so that "it ___" reads as a sentence describing BEHAVIOUR.
  // Your old name said "should be the same" — but the hashes are deliberately
  // different. A wrong name is worse than no name: the next reader trusts it.
  it('verifies a correct password', async () => {
    const hash = await hasher.hash(PASSWORD);

    // `.resolves` unwraps a PROMISE. `hasher.verify(...)` returns one, so it fits.
    // TIP: always `await` a .resolves/.rejects. Forget it and Jest 30 crashes the
    // whole run with a stack trace pointing at Jest internals, not your test.
    await expect(hasher.verify(hash, PASSWORD)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hasher.hash(PASSWORD);

    // THE MOST IMPORTANT TEST IN THIS FILE.
    // Without it, a broken `verify()` that just `return true` would pass the suite.
    // TIP: always assert the negative case. It's what separates "this test passes"
    // from "this test would catch a bug".
    await expect(hasher.verify(hash, WRONG_PASSWORD)).resolves.toBe(false);
  });

  it('produces a different hash each time (salting)', async () => {
    const first = await hasher.hash(PASSWORD);
    const second = await hasher.hash(PASSWORD);

    // FIXED: your version was `await expect(first === second).resolves.toBe(false)`.
    // `first === second` is already a boolean — you awaited both hashes above, so
    // there is no promise left for `.resolves` to unwrap.
    // TIP: `.resolves` is ONLY for values that are still promises.
    //      Once you've awaited, assert on the plain value.
    expect(first).not.toBe(second);

    // TIP: prefer `.not.toBe(x)` over `.toBe(false)` on a comparison.
    // On failure Jest prints both hashes; `expect(a === b).toBe(false)` would only
    // print "expected false, received true" — useless for debugging.
  });

  it('produces a hash that verifies regardless of which salt was used', async () => {
    // Proves the salt is EMBEDDED in the hash string: two different hashes of the
    // same password both verify, with no salt stored anywhere by us.
    const first = await hasher.hash(PASSWORD);
    const second = await hasher.hash(PASSWORD);

    await expect(hasher.verify(first, PASSWORD)).resolves.toBe(true);
    await expect(hasher.verify(second, PASSWORD)).resolves.toBe(true);
  });
});
