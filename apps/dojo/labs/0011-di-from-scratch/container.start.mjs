// @ts-check
/**
 * Lesson 0011: a dependency-injection container, from scratch.
 *
 *   cp container.start.mjs container.mjs     then fill in the class below
 *
 * A token is anything that names a dependency: a class, or a Symbol (for a
 * port like CODE_RUNNER, because interfaces don't exist at runtime).
 *
 * Providers:
 *   { useClass: SomeClass, deps: [tokenA, tokenB], scope?: "singleton" | "transient" }
 *   { useValue: anything }
 *   { useFactory: (a, b) => value, inject: [tokenA, tokenB] }
 *
 * Rules (each one is a checker case):
 *   - nothing is created before someone resolves it (lazy);
 *   - "singleton" (the default): created once, then the same instance for everyone;
 *   - "transient": a new instance on every resolve;
 *   - a missing provider throws an Error naming the token AND who needed it;
 *   - a cycle throws an Error showing the path, e.g. "A -> B -> A".
 */
export class Container {
  /**
   * @param {unknown} token
   * @param {object} provider
   */
  register(token, provider) {
    void token; void provider;
    throw new Error("Not written yet.");
  }

  /**
   * @param {unknown} token
   * @returns {any}
   */
  resolve(token) {
    void token;
    throw new Error("Not written yet.");
  }
}

/** A readable name for a token, for error messages: a class's name, or a Symbol's description. */
export function nameOf(token) {
  if (typeof token === "function") return token.name;
  if (typeof token === "symbol") return token.description ?? "Symbol()";
  return String(token);
}
