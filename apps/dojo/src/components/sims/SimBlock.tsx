"use client";
/** ```sim fences: "map", or a station id. Each station loads on its own. */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { getSim, type SimId } from "@/lib/sims/catalog";
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
};

export function SimBlock({ id }: { id: string }) {
  if (id === "map") return <SimMap />;
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
