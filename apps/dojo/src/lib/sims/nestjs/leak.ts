/** Two requests through one service. Who gets whose data? */
export type Style = "field" | "argument" | "request";
export interface LeakRun {
  timeline: { at: string; text: string; bad?: boolean }[];
  answers: { user: string; got: string }[];
  leaked: boolean;
  /** Service objects built for a thousand requests. */
  instances: number;
}

export function runLeak(style: Style, together: boolean): LeakRun {
  const shared = style === "field";
  const timeline: LeakRun["timeline"] = [];
  const answers: LeakRun["answers"] = [];
  const arrive = (who: string, t: string) => timeline.push({ at: t, text: style === "argument" ? `${who} arrives: profile(${who})` : `${who} arrives: this.user = ${who}${shared ? "" : " (on a new object)"}` });
  const answer = (who: string, t: string, field: string) => {
    const got = shared ? field : who;
    timeline.push({ at: t, text: `${who}'s query is back: answers with ${got}'s profile`, bad: got !== who });
    answers.push({ user: who, got });
  };
  if (together) {
    arrive("Amina", "0 ms");
    arrive("Youssef", "5 ms");
    answer("Amina", "20 ms", "Youssef");
    answer("Youssef", "25 ms", "Youssef");
  } else {
    arrive("Amina", "0 ms");
    answer("Amina", "20 ms", "Amina");
    arrive("Youssef", "400 ms");
    answer("Youssef", "420 ms", "Youssef");
  }
  return { timeline, answers, leaked: answers.some((a) => a.user !== a.got), instances: style === "request" ? 1000 : 1 };
}
