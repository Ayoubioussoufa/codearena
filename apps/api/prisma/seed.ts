import { readFileSync } from 'node:fs';
import { PrismaClient, Difficulty } from '../generated/prisma/client';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { originalProblems } from './seed-data/original';
import { runProgram } from './seed-data/original/run-program';
import { OriginalProblem, STDIN_STARTER } from './seed-data/original/types';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedProblem = {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string[];
  constraints: string[];
  starterCode: Record<string, string>;
  acceptanceRate: number;
  totalSubmissions: number;
  tags: string[];
  examples: { input: string; output: string; explanation?: string }[];
};

const toDifficulty: Record<string, Difficulty> = {
  Easy: Difficulty.EASY,
  Medium: Difficulty.MEDIUM,
  Hard: Difficulty.HARD,
};

/**
 * Each problem's rows are replaced in one transaction, so running the seed
 * twice gives the same result, and a failure can't leave half a problem.
 */
async function seedOriginalProblem(problem: OriginalProblem) {
  const { id, slug, examples, generatedInputs, tags, ...fields } = problem;
  const inputs = [...examples.map((e) => e.input), ...generatedInputs()];

  // `expected` comes from the reference solution, the only source of truth.
  const testCases = inputs.map((input, order) => ({
    problemId: id,
    input,
    expected: runProgram(slug, 'solution.js', input).output,
    isSample: order < examples.length,
    order,
  }));

  const data = { ...fields, starterCode: STDIN_STARTER };
  const connectTags = {
    connectOrCreate: tags.map((name) => ({
      where: { name },
      create: { name },
    })),
  };

  await prisma.$transaction([
    prisma.problem.upsert({
      where: { slug },
      update: data,
      create: { id, slug, ...data, tags: connectTags },
    }),
    prisma.testCase.deleteMany({ where: { problemId: id } }),
    prisma.problemExample.deleteMany({ where: { problemId: id } }),
    prisma.problemExample.createMany({
      data: examples.map((example, order) => ({
        problemId: id,
        input: example.input,
        output: example.output,
        explanation: example.explanation ?? null,
        order,
      })),
    }),
    prisma.testCase.createMany({ data: testCases }),
  ]);
}

async function main() {
  const raw = readFileSync(
    join(__dirname, 'seed-data', 'problems.json'),
    'utf8',
  );
  // JSON.parse returns `any`; assert the shape we know the file has.
  const problems = JSON.parse(raw) as SeedProblem[];

  for (const p of problems) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        difficulty: toDifficulty[p.difficulty]!,
        description: p.description,
        constraints: p.constraints,
        starterCode: p.starterCode,
        acceptanceRate: p.acceptanceRate,
        totalSubmissions: p.totalSubmissions,
      },
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: toDifficulty[p.difficulty]!,
        description: p.description,
        constraints: p.constraints,
        starterCode: p.starterCode,
        acceptanceRate: p.acceptanceRate,
        totalSubmissions: p.totalSubmissions,
        tags: {
          connectOrCreate: p.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        examples: {
          create: p.examples.map((e, i) => ({
            input: e.input,
            output: e.output,
            explanation: e.explanation ?? null,
            order: i,
          })),
        },
      },
    });
  }
  for (const problem of originalProblems) {
    await seedOriginalProblem(problem);
  }

  console.log(`Seeded ${await prisma.problem.count()} problems`);
  console.log(`Seeded ${await prisma.testCase.count()} test cases`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
