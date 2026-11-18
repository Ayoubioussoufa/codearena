# Query 6 · Revoking a refresh-token family (I-16)

**The page:** none. It runs when a stolen refresh token is reused (reuse detection, ADR-003): every token of that family is revoked.

```sql
UPDATE "RefreshToken" SET "revokedAt" = now()
WHERE family = 'seed_f_77777' AND "revokedAt" IS NULL;
```

**Prediction (I-16, written in week 1):** the index `(userId, family)` can't serve `WHERE family = …`, because `family` isn't its first column.

**Before:** `Seq Scan on "RefreshToken"`, `Rows Removed by Filter: 199998`: about 3,000 buffers, **15.4 ms**, to change 2 rows. The prediction was right.

**The change:** an index on `(family)`.

**After:** `Index Scan using "RefreshToken_family_idx"`: 6 buffers for the scan, **0.15 ms**.

**Why:** a B-tree is sorted by its first column, then by the second inside each first value, like a phone book sorted by surname, then first name. Finding a family without its user means reading the whole book.

**Should `(userId, family)` stay?** No query filters by both. But deleting a user cascades to their tokens (`ON DELETE CASCADE`), and that delete looks tokens up by `userId`, which needs a `userId`-first index. So it stays, with a comment saying why.
