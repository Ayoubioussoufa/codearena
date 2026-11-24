"use client";
/** ```sim fences: "map", or a station id. Each station loads on its own. */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ROUTES, getSim, type SimId } from "@/lib/sims/catalog";
import { SimMap } from "./SimMap";

const loading = () => <div className="not-prose my-10 h-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700" aria-hidden />;

const STATIONS: Record<SimId, ComponentType> = {
  journey: dynamic(() => import("./Journey"), { loading }),
  napkin: dynamic(() => import("./Napkin"), { loading }),
  latency: dynamic(() => import("./Latency"), { loading }),
  nines: dynamic(() => import("./Nines"), { loading }),
  cache: dynamic(() => import("./Cache"), { loading }),
  stampede: dynamic(() => import("./Stampede"), { loading }),
  balancer: dynamic(() => import("./Balancer"), { loading }),
  scaledb: dynamic(() => import("./ScaleDb"), { loading }),
  cap: dynamic(() => import("./Cap"), { loading }),
  queue: dynamic(() => import("./QueueNight"), { loading }),
  ratelimit: dynamic(() => import("./RateLimit"), { loading }),
  ring: dynamic(() => import("./Ring"), { loading }),
  judge: dynamic(() => import("./Judge"), { loading }),
  oncall: dynamic(() => import("./OnCall"), { loading }),
  di: dynamic(() => import("./nestjs/stations").then((m) => m.Di), { loading }),
  modules: dynamic(() => import("./nestjs/stations").then((m) => m.Modules), { loading }),
  providers: dynamic(() => import("./nestjs/stations").then((m) => m.Providers), { loading }),
  leak: dynamic(() => import("./nestjs/stations").then((m) => m.Leak), { loading }),
  routes: dynamic(() => import("./nestjs/stations").then((m) => m.Routes), { loading }),
  validation: dynamic(() => import("./nestjs/stations").then((m) => m.Validation), { loading }),
  pipeline: dynamic(() => import("./nestjs/stations").then((m) => m.Pipeline), { loading }),
  placement: dynamic(() => import("./nestjs/stations").then((m) => m.Placement), { loading }),
  clinic: dynamic(() => import("./nestjs/stations").then((m) => m.Clinic), { loading }),
  blast: dynamic(() => import("./arch/stations").then((m) => m.Blast), { loading }),
  arrows: dynamic(() => import("./arch/stations").then((m) => m.Arrows), { loading }),
  boundary: dynamic(() => import("./arch/stations").then((m) => m.Boundary), { loading }),
  invariant: dynamic(() => import("./arch/stations").then((m) => m.Invariant), { loading }),
  whereto: dynamic(() => import("./arch/stations").then((m) => m.Whereto), { loading }),
  errors: dynamic(() => import("./arch/stations").then((m) => m.Errors), { loading }),
  outbox: dynamic(() => import("./arch/stations").then((m) => m.Outbox), { loading }),
  worthit: dynamic(() => import("./arch/stations").then((m) => m.Worthit), { loading }),
  whichtest: dynamic(() => import("./arch/stations").then((m) => m.Whichtest), { loading }),
  villains: dynamic(() => import("./arch/stations").then((m) => m.Villains), { loading }),
  places: dynamic(() => import("./git/stations").then((m) => m.Places), { loading }),
  graph: dynamic(() => import("./git/stations").then((m) => m.Graph), { loading }),
  conflict: dynamic(() => import("./git/stations").then((m) => m.Conflict), { loading }),
  undo: dynamic(() => import("./git/stations").then((m) => m.Undo), { loading }),
  lease: dynamic(() => import("./git/stations").then((m) => m.Lease), { loading }),
  bisect: dynamic(() => import("./git/stations").then((m) => m.Bisect), { loading }),
  sync: dynamic(() => import("./git/stations").then((m) => m.Sync), { loading }),
  rescue: dynamic(() => import("./git/stations").then((m) => m.Rescue), { loading }),
  danger: dynamic(() => import("./git/stations").then((m) => m.Danger), { loading }),
  pattern: dynamic(() => import("./dsa/decks").then((m) => m.Pattern), { loading }),
  budget: dynamic(() => import("./dsa/decks").then((m) => m.Budget), { loading }),
  hashing: dynamic(() => import("./dsa/arrays").then((m) => m.Hashing), { loading }),
  pointers: dynamic(() => import("./dsa/arrays").then((m) => m.Pointers), { loading }),
  window: dynamic(() => import("./dsa/arrays").then((m) => m.WindowStation), { loading }),
  reverse: dynamic(() => import("./dsa/structures").then((m) => m.Reverse), { loading }),
  nextgreater: dynamic(() => import("./dsa/arrays").then((m) => m.NextGreater), { loading }),
  bsearch: dynamic(() => import("./dsa/arrays").then((m) => m.BSearch), { loading }),
  queens: dynamic(() => import("./dsa/structures").then((m) => m.Queens), { loading }),
  tree: dynamic(() => import("./dsa/structures").then((m) => m.TreeWalk), { loading }),
  bfs: dynamic(() => import("./dsa/structures").then((m) => m.Bfs), { loading }),
  heap: dynamic(() => import("./dsa/structures").then((m) => m.Heap), { loading }),
  dijkstra: dynamic(() => import("./dsa/graphs").then((m) => m.Dijkstra), { loading }),
  topo: dynamic(() => import("./dsa/graphs").then((m) => m.Topo), { loading }),
  intervals: dynamic(() => import("./dsa/structures").then((m) => m.Intervals), { loading }),
  dp: dynamic(() => import("./dsa/arrays").then((m) => m.Dp), { loading }),
};

export function SimBlock({ id, guide }: { id: string; guide?: string | undefined }) {
  const route = ROUTES.find((r) => r.guide === guide);
  if (id === "map" && route) return <SimMap route={route} />;
  const sim = getSim(id);
  if (!sim) {
    return (
      <pre className="not-prose rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
        Unknown sim: {id}
      </pre>
    );
  }
  const Station = STATIONS[sim.id];
  return <Station />;
}
