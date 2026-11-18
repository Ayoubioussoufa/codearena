-- DropIndex
DROP INDEX "Submission_userId_createdAt_idx";

-- CreateIndex
CREATE INDEX "RefreshToken_family_idx" ON "RefreshToken"("family");

-- CreateIndex
CREATE INDEX "Submission_userId_createdAt_id_idx" ON "Submission"("userId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Submission_solved_idx" ON "Submission"("userId", "problemId") WHERE (verdict = 'ACCEPTED');

-- CreateIndex
CREATE INDEX "Submission_accepted_recent_idx" ON "Submission"("problemId", "createdAt" DESC) WHERE (verdict = 'ACCEPTED');
