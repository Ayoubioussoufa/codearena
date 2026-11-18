export type Language = 'TYPESCRIPT' | 'PYTHON' | 'CPP' | 'JAVA' | 'JAVASCRIPT';

export type Verdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'MEMORY_LIMIT'
  | 'OUTPUT_LIMIT'
  | 'JUDGING'
  | 'SYSTEM_ERROR';

export interface Submission {
  id: string;
  problemId: number;
  userId: string;
  language: Language;
  verdict: Verdict;
  code: string;
  runtimeMs: number | null;
  createdAt: Date;
}
