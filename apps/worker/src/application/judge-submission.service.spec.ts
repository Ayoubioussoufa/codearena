import { JudgeService } from "./judge.service";
import { JudgeSubmissionService } from "./judge-submission.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import type {
  JudgeTask,
  SubmissionStore,
} from "../ports/submission-store.port";
import type { Judgement } from "../domain/verdict.entity";

/** One submission in memory, and every verdict it was given. */
class FakeStore implements SubmissionStore {
  readonly saved: Judgement[] = [];

  constructor(private readonly task: JudgeTask | null) {}

  load(): Promise<JudgeTask | null> {
    return Promise.resolve(this.task);
  }

  saveVerdict(_id: string, judgement: Judgement): Promise<void> {
    this.saved.push(judgement);
    return Promise.resolve();
  }
}

const task: JudgeTask = {
  submissionId: "sub-1",
  code: "console.log(1)",
  language: "JAVASCRIPT",
  tests: [{ input: "", expected: "1" }],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
};

const printed = (stdout: string) => ({
  outcome: "EXIT" as const,
  exitCode: 0,
  stdout,
  stderr: "",
  timeMs: 12,
});

describe("JudgeSubmissionService", () => {
  let runner: FakeCodeRunner;

  beforeEach(() => {
    runner = new FakeCodeRunner();
  });

  // The REAL JudgeService, on a fake runner: we test the whole use case,
  // and only fake what touches the outside world.
  const serviceWith = (store: FakeStore) =>
    new JudgeSubmissionService(store, new JudgeService(runner));

  it("stores ACCEPTED for a right answer", async () => {
    const store = new FakeStore(task);
    runner.willReturn(printed("1\n"));

    await serviceWith(store).handle("sub-1");

    expect(store.saved).toEqual([
      { verdict: "ACCEPTED", failedTest: null, maxTimeMs: 12 },
    ]);
  });

  it("stores WRONG_ANSWER and resolves: a wrong answer is a successful job", async () => {
    const store = new FakeStore(task);
    runner.willReturn(printed("2\n"));

    await expect(serviceWith(store).handle("sub-1")).resolves.toBeUndefined();

    expect(store.saved).toMatchObject([{ verdict: "WRONG_ANSWER" }]);
  });

  it("throws when the runner throws, and stores nothing, so BullMQ retries", async () => {
    const store = new FakeStore(task);
    runner.willReturnInOrder([new Error("Docker is down")]);

    await expect(serviceWith(store).handle("sub-1")).rejects.toThrow(
      "Docker is down",
    );

    expect(store.saved).toEqual([]);
  });

  it("skips a submission that no longer exists, without throwing", async () => {
    const store = new FakeStore(null);

    await expect(serviceWith(store).handle("gone")).resolves.toBeUndefined();

    expect(store.saved).toEqual([]);
    expect(runner.inputs).toEqual([]);
  });
});
