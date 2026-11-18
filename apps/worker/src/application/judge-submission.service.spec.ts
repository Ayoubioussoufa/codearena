import { JudgeService } from "./judge.service";
import { JudgeSubmissionService } from "./judge-submission.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import type {
  JudgeTask,
  SubmissionStore,
} from "../ports/submission-store.port";
import type { Judgement } from "../domain/verdict.entity";

/**
 * One submission in memory. The claim is a plain field: this fake proves the
 * use case calls the store in the right order. The race itself is proven
 * against real Postgres, in judge-submission.integration-spec.ts.
 */
class FakeStore implements SubmissionStore {
  readonly saved: Judgement[] = [];
  claimant: string | null = null;
  released = false;
  systemError = false;

  constructor(private readonly task: JudgeTask | null) {}

  claim(_id: string, claimant: string): Promise<boolean> {
    if (this.task === null || this.claimant !== null) {
      return Promise.resolve(false);
    }
    this.claimant = claimant;
    return Promise.resolve(true);
  }

  load(): Promise<JudgeTask | null> {
    return Promise.resolve(this.task);
  }

  saveVerdict(
    _id: string,
    claimant: string,
    judgement: Judgement,
  ): Promise<boolean> {
    if (claimant !== this.claimant) return Promise.resolve(false);
    this.saved.push(judgement);
    return Promise.resolve(true);
  }

  release(): Promise<void> {
    this.claimant = null;
    this.released = true;
    return Promise.resolve();
  }

  markSystemError(): Promise<void> {
    this.systemError = true;
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

  it("throws when the runner throws, stores nothing, and gives the claim back", async () => {
    const store = new FakeStore(task);
    runner.willReturnInOrder([new Error("Docker is down")]);

    await expect(serviceWith(store).handle("sub-1")).rejects.toThrow(
      "Docker is down",
    );

    expect(store.saved).toEqual([]);
    expect(store.released).toBe(true);
  });

  it("does not run anything when the claim is lost", async () => {
    const store = new FakeStore(task);
    store.claimant = "another-worker";

    await serviceWith(store).handle("sub-1");

    expect(runner.inputs).toEqual([]);
    expect(store.saved).toEqual([]);
  });

  it("skips a submission that no longer exists, without throwing", async () => {
    const store = new FakeStore(null);

    await expect(serviceWith(store).handle("gone")).resolves.toBeUndefined();

    expect(runner.inputs).toEqual([]);
  });

  it("marks SYSTEM_ERROR when it gives up", async () => {
    const store = new FakeStore(task);

    await serviceWith(store).giveUp("sub-1");

    expect(store.systemError).toBe(true);
  });
});
