const tokens = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * True when both outputs hold the same tokens in the same order. Any
 * whitespace separates tokens, including \r, so a file written on Windows
 * can't turn a right answer into a wrong one.
 */
export function compareTokens(expected: string, actual: string): boolean {
  const want = tokens(expected);
  const got = tokens(actual);
  return (
    want.length === got.length &&
    want.every((token, index) => token === got[index])
  );
}
