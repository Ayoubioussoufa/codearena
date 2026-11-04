import type { Lesson } from "../types";

export const lesson0039: Lesson = {
  slug: "0039-async-tokio",
  number: 39,
  track: "rust",
  title: "Async with tokio: many waits, few threads",
  summary:
    "Run hundreds of jobs with a concurrency limit and per-job timeouts, and know when async is the wrong tool.",
  minutes: 90,
  status: "ready",
  builds: "An async runner with a semaphore limit, per-job timeouts, a select! race and spawn_blocking, tested on a paused clock",
  lab: { dir: "0039-async-tokio", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-systems",
  warmup: [
    { lesson: "0038-threads", question: 1 },
    { lesson: "0013-queue-from-scratch", question: 0 },
  ],
  words: ["future", ".await", "async runtime", "task", "cancellation", "spawn_blocking"],
  answers: [
    { id: "node", label: "Section 4: tokio next to Node's event loop, one difference that matters" },
    { id: "challenge", label: "Challenge: a real TCP echo server (optional)" },
  ],
  quiz: [
    {
      prompt: "`let f = fetch(url);` where `fetch` is an `async fn`. What has happened after this line?",
      options: [
        "The request went out, and f holds the answer",
        "Nothing yet: a future runs only when it's awaited",
        "The request is now running on a background thread",
        "The runtime queued it for the next event-loop tick",
      ],
      correct: 1,
      why: "Calling an `async fn` builds a future, a state machine, and runs none of its body. It makes progress only when polled: by `.await`, `join!`, `select!`, or `tokio::spawn`. That's the opposite of a JavaScript promise, which starts running the moment it's created.",
    },
    {
      prompt: "Why can tokio run 10,000 waiting tasks on 4 threads?",
      options: [
        "Each task gets a time slice from the OS scheduler",
        "Tasks sleep in the kernel, so they need no threads",
        "Each .await that can't finish yet gives the thread back",
        "tokio starts one more thread each time the queue grows",
      ],
      correct: 2,
      why: "A task runs until it reaches an `.await` on something not ready (a socket, a timer). Then it yields, and the runtime polls another task on that same thread; the waiting task is woken when its event arrives. A waiting task costs its state machine's size, not a thread's stack.",
    },
    {
      prompt: "An async request handler runs a two-second CPU loop with no `.await` inside. What happens to other tasks on its thread?",
      options: [
        "They wait two seconds: the loop never yields",
        "The runtime preempts the loop every few milliseconds",
        "They move to another thread at once, automatically",
        "The compiler refuses CPU loops in async functions",
      ],
      correct: 0,
      why: "Async scheduling is cooperative: a task gives the thread back only at an `.await`. A long CPU loop, or a blocking call like `std::thread::sleep`, starves every task on that thread. Your lab measured it: a 50 ms timer fired after 1.25 s. Move such work to `spawn_blocking`, or to rayon.",
    },
    {
      prompt: "`tokio::select!` has two branches, and the first finishes. What happens to the other future?",
      options: [
        "It keeps running in the background until done",
        "It's dropped, which cancels it where it waits",
        "It's paused, and resumed by the next select!",
        "It becomes a task, awaited when main ends",
      ],
      correct: 1,
      why: "The losing future is dropped: it never runs again, and its destructors run, so it's cancelled at the `.await` where it was waiting. That's how `timeout` works too. It also means code between two `.await`s may never get to run: cancellation safety is a real design concern.",
    },
    {
      prompt: "When does tokio's own tutorial say not to use tokio?",
      options: [
        "For servers that keep many connections open at once",
        "For any program that will run on Linux servers",
        "For CPU-bound work, many file reads, or one request",
        "For any code that needs timeouts or cancellation logic",
      ],
      correct: 2,
      why: "The tutorial lists three cases: CPU-bound parallel computation (use rayon), reading many files (no advantage over a thread pool, since operating systems lack good async file APIs), and a single web request (the blocking version is simpler). Async pays off when tasks mostly wait.",
    },
  ],
};
