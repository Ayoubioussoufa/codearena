/** Shared shape of the two story stations: a situation, four moves, one best. */
export interface Move {
  text: string;
  outcome: string;
}
export interface Situation {
  id: string;
  title: string;
  story: string;
  moves: readonly [Move, Move, Move, Move];
  /** Index of the best move. */
  best: number;
  lesson: string;
  /** An error message or a piece of code, shown as it is. */
  exhibit?: string;
}
