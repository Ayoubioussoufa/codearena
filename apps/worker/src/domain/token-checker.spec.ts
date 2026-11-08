import { compareTokens } from "./token-checker";

describe("compareTokens", () => {
  it.each([
    ["identical", "5\n", "5\n", true],
    ["a missing trailing newline", "5\n", "5", true],
    ["double spaces", "1 2 3", "1  2   3", true],
    ["\\r\\n line endings", "1\n2\n", "1\r\n2\r\n", true],
    ["tabs instead of spaces", "1 2", "1\t2", true],
    ["both empty", "", "\n  \n", true],
    ["a different token", "5", "6", false],
    ["an extra token", "1 2", "1 2 3", false],
    ["a missing token", "1 2 3", "1 2", false],
    ["the wrong order", "1 2", "2 1", false],
    ["empty output when an answer is expected", "5", "", false],
    ["case matters", "YES", "yes", false],
  ])("%s", (_name, expected, actual, match) => {
    expect(compareTokens(expected, actual)).toBe(match);
  });
});
