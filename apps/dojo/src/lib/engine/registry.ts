/**
 * Topic registry — the single list every page renders from.
 */
import type { Topic, TopicId } from "./types";
import { typescriptTopic } from "./topics/typescript";
import { reactTopic } from "./topics/react";
import { tailwindTopic } from "./topics/tailwind";
import { sqlTopic } from "./topics/sql";
import { authTopic } from "./topics/auth";
import { sandboxTopic } from "./topics/sandbox";
import { ratingTopic } from "./topics/rating";
import { distributedTopic } from "./topics/distributed";
import { systemDesignTopic } from "./topics/system-design";
import { systemDesignDrillsTopic } from "./topics/system-design-drills";
import { aptitudeTopic } from "./topics/aptitude";
import { csFundamentalsTopic } from "./topics/cs-fundamentals";
import { javaSpringBootTopic } from "./topics/java-spring-boot";
import { pythonTopic } from "./topics/python";
import { testingTopic } from "./topics/testing";
import { gitTopic } from "./topics/git";
import { courseRecallTopic } from "../courses/recall";

export const TOPICS: Topic[] = [
  reactTopic,
  tailwindTopic,
  typescriptTopic,
  sqlTopic,
  authTopic,
  sandboxTopic,
  ratingTopic,
  distributedTopic,
  systemDesignTopic,
  systemDesignDrillsTopic,
  testingTopic,
  gitTopic,
  aptitudeTopic,
  csFundamentalsTopic,
  javaSpringBootTopic,
  pythonTopic,
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === (id as TopicId));
}

export const TOTAL_GENERATORS = TOPICS.reduce(
  (sum, t) => sum + t.generators.length,
  0,
);

export interface PoolEntry {
  generator: Topic["generators"][number];
  topicId: TopicId;
}

/** Every generator across every topic — the Mixed-review pool. */
export const ALL_GENERATORS: PoolEntry[] = TOPICS.flatMap((t) =>
  t.generators.map((generator) => ({ generator, topicId: t.id })),
);

/**
 * The spaced-review pool: every drill generator, plus the course lesson
 * questions. Lesson questions stay out of Mixed: they enter review only once
 * answered inside their lesson.
 */
export const REVIEW_POOL: PoolEntry[] = [
  ...ALL_GENERATORS,
  ...courseRecallTopic.generators.map((generator) => ({
    generator,
    topicId: courseRecallTopic.id,
  })),
];

/** Display title of any topic id, the course recall topic included. */
export function topicTitle(id: string): string | undefined {
  return id === courseRecallTopic.id ? courseRecallTopic.title : getTopic(id)?.title;
}
