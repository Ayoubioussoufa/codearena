"use client";
import { INCIDENTS, ONCALL_PASS } from "@/lib/sims/oncall";
import { CaseStation } from "./engines";
import { Stat } from "./ui";

export default function OnCall() {
  return (
    <CaseStation
      id="oncall"
      cases={INCIDENTS}
      pass={ONCALL_PASS}
      noun="Incident"
      ask="Your first move?"
      endings={{ perfect: "Flawless. Go and get some sleep.", won: "The site is up, and so are you.", lost: `You need ${ONCALL_PASS}. Reread the lessons of the red ones, press Reset, and take another shift.` }}
      extra={(x) => (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {x.metrics.map((m) => (
            <Stat key={m.label} label={m.label} value={m.value} tone={m.bad ? "bad" : "plain"} />
          ))}
        </div>
      )}
    />
  );
}
