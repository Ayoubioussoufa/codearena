# Architecture Decision Records

Each file records one decision: what we chose, what we rejected, and why.

- One decision per file, numbered: `0001-use-postgres.md`
- **Never edit an accepted record.** Supersede it with a new one instead.
- Copy `template.md` to start a new one.

| Status | Meaning |
| --- | --- |
| Proposed | Written, not yet agreed |
| Accepted | This is how the system works |
| Superseded by ADR-00XX | Replaced by a later decision |

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [002](002-argon2id-for-passwords.md) | Hash passwords with Argon2id | Accepted |
| [003](003-refresh-token-rotation.md) | Access + refresh tokens, with rotation and reuse detection | Accepted |
| [004](004-token-storage-cookie-vs-memory.md) | Refresh token in an httpOnly cookie, access token in memory | Accepted |
| [005](005-per-ip-rate-limiting.md) | Rate-limit the credential endpoints per IP | Accepted |
| [006](006-leetcode-codeforces-hybrid.md) | A LeetCode–Codeforces hybrid, judged through stdin/stdout | Proposed |
