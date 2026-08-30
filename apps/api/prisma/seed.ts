import { readFileSync } from 'node:fs';
import { PrismaClient, Difficulty } from '../generated/prisma/client';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';

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
  console.log(`Seeded ${await prisma.problem.count()} problems`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
