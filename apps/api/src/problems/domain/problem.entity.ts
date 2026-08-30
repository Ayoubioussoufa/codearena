export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type ProblemExample = {
  input: string;
  output: string;
  explanation?: string | undefined;
};

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  description: string[];
  constraints: string[];
  examples: ProblemExample[];
  starterCode: Record<string, string>;
  acceptanceRate: number;
  totalSubmissions: number;
  tags: string[];
}
