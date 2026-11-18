import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { JudgeService } from "./judge.service";
import { JudgeSubmissionService } from "./judge-submission.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import { PrismaSubmissionStore } from "../adapters/prisma-submission.store";
import { PrismaService } from "../prisma/prisma.service";
import { CODE_RUNNER } from "../ports/code-runner.port";
import { SUBMISSION_STORE } from "../ports/submission-store.port";
import { validateEnv } from "../config/env.schema";

/**
 * The idempotency test. The guarantee lives in the database, so this runs
 * against real Postgres. The runner is a fake: what we count is how many
 * times it was called.
 */
describe("Judging a submission delivered twice", () => {
  let prisma: PrismaService;
  let runner: FakeCodeRunner;
  let judging: JudgeSubmissionService;
  let userId: string;
  let problemId: number;

  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const TESTS = 2;

  beforeAll(async () => {
    runner = new FakeCodeRunner();
    runner.willReturn({
      outcome: "EXIT",
      exitCode: 0,
      stdout: "1\n",
      stderr: "",
      timeMs: 5,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
      ],
      providers: [
        PrismaService,
        JudgeService,
        JudgeSubmissionService,
        { provide: CODE_RUNNER, useValue: runner },
        { provide: SUBMISSION_STORE, useClass: PrismaSubmissionStore },
      ],
    }).compile();
    await moduleRef.init();

    prisma = moduleRef.get(PrismaService);
    judging = moduleRef.get(JudgeSubmissionService);

    const user = await prisma.user.create({
      data: {
        email: `idem-${unique}@test.com`,
        username: `idem${unique}`.slice(0, 20),
        passwordHash: "not-a-real-hash",
      },
    });
    userId = user.id;
    const problem = await prisma.problem.create({
      data: {
        slug: `idem-${unique}`,
        title: "Idempotency",
        difficulty: "EASY",
        description: ["Print 1."],
        constraints: [],
        starterCode: {},
        testCases: {
          create: Array.from({ length: TESTS }, (_, order) => ({
            input: "",
            expected: "1",
            order,
          })),
        },
      },
    });
    problemId = problem.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } }); // cascades to submissions
    await prisma.problem.delete({ where: { id: problemId } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    runner.inputs.length = 0;
  });

  const newSubmission = () =>
    prisma.submission.create({
      data: {
        userId,
        problemId,
        language: "JAVASCRIPT",
        code: "console.log(1)",
      },
    });

  it("judges once when the same job arrives twice, one after the other", async () => {
    const { id } = await newSubmission();

    await judging.handle(id);
    await judging.handle(id);

    expect(runner.inputs).toHaveLength(TESTS); // one run per test, not two
    const row = await prisma.submission.findUniqueOrThrow({ where: { id } });
    expect(row.verdict).toBe("ACCEPTED");
  });

  it("judges once when the same job arrives twice at the same moment", async () => {
    const { id } = await newSubmission();

    await Promise.all([judging.handle(id), judging.handle(id)]);

    expect(runner.inputs).toHaveLength(TESTS);
  });

  it("lets a new attempt take over a claim whose lease has expired", async () => {
    const { id } = await newSubmission();
    // A worker claimed it an hour ago, then died.
    await prisma.submission.update({
      where: { id },
      data: {
        verdict: "JUDGING",
        claimedBy: "dead-worker",
        claimedAt: new Date(Date.now() - 60 * 60_000),
      },
    });

    await judging.handle(id);

    const row = await prisma.submission.findUniqueOrThrow({ where: { id } });
    expect(row.verdict).toBe("ACCEPTED");
  });
});
