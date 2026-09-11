import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { PasswordHasher } from '../passwordhasher/ports/password-hasher.port';
import type { RefreshTokenService } from './refresh-token.service';
import type { UsersService } from '../../users/application/users.service';

/**
 * Unit tests: no Nest container, no database, no argon2.
 *
 * This is only possible because every dependency sits behind a port. If you
 * ever find yourself needing a real database to test a service, the service is
 * reaching past its layer -- the slow test is the architecture telling on
 * itself. These should finish in milliseconds.
 */
describe('AuthService', () => {
  const USER = {
    id: 'user-1',
    passwordHash: 'stored-hash',
    role: 'USER' as const,
  };
  const PAIR = { accessToken: 'access', refreshToken: 'refresh' };

  // A fake is just an object with the right method names. No mocking library
  // is needed to stand in for an interface.
  const makeHasher = (verifyResult: boolean): PasswordHasher => ({
    hash: jest.fn().mockResolvedValue('new-hash'),
    verify: jest.fn().mockResolvedValue(verifyResult),
  });

  const makeUsers = (found: typeof USER | null) =>
    ({
      getCredentialsByEmail: jest.fn().mockResolvedValue(found),
      createUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
    }) as unknown as UsersService;

  const makeTokens = () =>
    ({
      issueForLogin: jest.fn().mockResolvedValue(PAIR),
      rotate: jest.fn().mockResolvedValue(PAIR),
      revokeSession: jest.fn().mockResolvedValue(undefined),
    }) as unknown as RefreshTokenService;

  describe('login', () => {
    it('returns a token pair for correct credentials', async () => {
      const tokens = makeTokens();
      const service = new AuthService(
        makeUsers(USER),
        tokens,
        makeHasher(true),
      );

      await expect(
        service.login({ email: 'a@b.com', password: 'pw' }),
      ).resolves.toEqual(PAIR);
      expect(tokens.issueForLogin).toHaveBeenCalledWith('user-1', 'USER');
    });

    it('verifies the stored hash against the supplied password, in that order', async () => {
      const hasher = makeHasher(true);
      const service = new AuthService(makeUsers(USER), makeTokens(), hasher);

      await service.login({ email: 'a@b.com', password: 'pw' });

      // The port declares verify(hash, plain). Getting these backwards makes
      // every login fail, and the error says nothing useful.
      expect(hasher.verify).toHaveBeenCalledWith('stored-hash', 'pw');
    });

    it('throws for a wrong password', async () => {
      const service = new AuthService(
        makeUsers(USER),
        makeTokens(),
        makeHasher(false),
      );
      await expect(
        service.login({ email: 'a@b.com', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws for an unknown email', async () => {
      const service = new AuthService(
        makeUsers(null),
        makeTokens(),
        makeHasher(false),
      );
      await expect(
        service.login({ email: 'ghost@b.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('uses the SAME message for an unknown email and a wrong password', async () => {
      const unknown = await new AuthService(
        makeUsers(null),
        makeTokens(),
        makeHasher(false),
      )
        .login({ email: 'ghost@b.com', password: 'pw' })
        .catch((e: Error) => e.message);

      const wrong = await new AuthService(
        makeUsers(USER),
        makeTokens(),
        makeHasher(false),
      )
        .login({ email: 'a@b.com', password: 'bad' })
        .catch((e: Error) => e.message);

      // Two different messages would be a user-enumeration oracle: an attacker
      // could discover which addresses are registered.
      expect(unknown).toEqual(wrong);
    });

    it('still calls verify when the user does NOT exist', async () => {
      // The timing defence. Returning instantly for unknown emails and slowly
      // for known ones leaks exactly what the identical message hides.
      const hasher = makeHasher(false);
      await new AuthService(makeUsers(null), makeTokens(), hasher)
        .login({ email: 'ghost@b.com', password: 'pw' })
        .catch(() => undefined);

      expect(hasher.verify).toHaveBeenCalledTimes(1);
    });

    it('never issues tokens when verification fails', async () => {
      const tokens = makeTokens();
      await new AuthService(makeUsers(USER), tokens, makeHasher(false))
        .login({ email: 'a@b.com', password: 'bad' })
        .catch(() => undefined);

      expect(tokens.issueForLogin).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('hashes the password and never passes the plaintext on', async () => {
      const hasher = makeHasher(true);
      const users = makeUsers(null);
      const service = new AuthService(users, makeTokens(), hasher);

      await service.register({
        email: 'a@b.com',
        username: 'ayoub',
        password: 'plaintext-pw',
      });

      expect(hasher.hash).toHaveBeenCalledWith('plaintext-pw');
      const [arg] = (users.createUser as jest.Mock).mock.calls[0] as [
        Record<string, unknown>,
      ];
      expect(arg.passwordHash).toBe('new-hash');
      expect(arg).not.toHaveProperty('password');
    });
  });

  describe('refresh', () => {
    it('rejects a missing token without touching the rotation logic', async () => {
      const tokens = makeTokens();
      const service = new AuthService(
        makeUsers(USER),
        tokens,
        makeHasher(true),
      );

      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokens.rotate).not.toHaveBeenCalled();
    });

    it('delegates a present token to rotation', async () => {
      const tokens = makeTokens();
      const service = new AuthService(
        makeUsers(USER),
        tokens,
        makeHasher(true),
      );

      await expect(service.refresh('some-token')).resolves.toEqual(PAIR);
      expect(tokens.rotate).toHaveBeenCalledWith('some-token');
    });
  });

  describe('logout', () => {
    it('succeeds and does nothing when there is no token', async () => {
      const tokens = makeTokens();
      const service = new AuthService(
        makeUsers(USER),
        tokens,
        makeHasher(true),
      );

      // Idempotent: a double-click, a retry, or two open tabs must all succeed.
      await expect(service.logout(undefined)).resolves.toBeUndefined();
      expect(tokens.revokeSession).not.toHaveBeenCalled();
    });

    it('revokes the session when a token is present', async () => {
      const tokens = makeTokens();
      const service = new AuthService(
        makeUsers(USER),
        tokens,
        makeHasher(true),
      );

      await service.logout('some-token');
      expect(tokens.revokeSession).toHaveBeenCalledWith('some-token');
    });
  });
});
