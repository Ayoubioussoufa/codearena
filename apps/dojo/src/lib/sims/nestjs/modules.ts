/** Two modules. AuthService wants UsersService, which wants USERS_REPOSITORY. */
export interface Wiring {
  /** UsersModule: exports: [UsersService] */
  exported: boolean;
  /** AuthModule: imports: [UsersModule] */
  imported: boolean;
  /** AuthModule: imports: [UsersService] */
  serviceInImports: boolean;
  /** AuthModule: providers: [UsersService] */
  copied: boolean;
  /** AuthModule: providers: [USERS_REPOSITORY] */
  copiedRepo: boolean;
}
export const WIRING_START: Wiring = { exported: false, imported: false, serviceInImports: false, copied: false, copiedRepo: false };
export interface Boot {
  ok: boolean;
  log: string;
  hint: string;
  instances: number;
}

export function boot(w: Wiring): Boot {
  const fail = (log: string, hint: string): Boot => ({ ok: false, log, hint, instances: 0 });
  if (w.serviceInImports) {
    return fail('"UsersService" is decorated with @Injectable() and cannot appear in the "imports" array of the AuthModule.', "imports takes modules. UsersService is a class inside one.");
  }
  if (w.copied) {
    if (!w.copiedRepo) {
      return fail("Nest can't resolve dependencies of the UsersService (?). Please make sure that the argument Symbol(UsersRepository) at index [0] is available in the AuthModule context.", "Your copy of UsersService is built inside AuthModule, where its repository doesn't exist.");
    }
    return { ok: true, log: "Nest application successfully started", hint: "It boots, with two UsersService objects: whatever one remembers, the other doesn't know.", instances: 2 };
  }
  if (w.imported && w.exported) return { ok: true, log: "Nest application successfully started", hint: "One object, owned by UsersModule, lent through its exports.", instances: 1 };
  return fail(
    "Nest can't resolve dependencies of the AuthService (?). Please make sure that the argument UsersService at index [0] is available in the AuthModule context.",
    w.imported ? "AuthModule looked inside UsersModule, but nothing there is exported." : w.exported ? "UsersModule opened its door. AuthModule never walked up to it." : "UsersService is private to UsersModule. Sharing it takes two moves.",
  );
}
export const modulesWon = (w: Wiring) => boot(w).ok && boot(w).instances === 1;
