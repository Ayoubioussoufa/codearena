"use client";
import { useState } from "react";
import { CLINIC, CLINIC_PASS } from "@/lib/sims/nestjs/clinic";
import { PLACEMENT, PROVIDERS } from "@/lib/sims/nestjs/decks";
import { STUCK, diTrace } from "@/lib/sims/nestjs/di";
import { runLeak, type Style } from "@/lib/sims/nestjs/leak";
import { WIRING_START, boot, modulesWon, type Wiring } from "@/lib/sims/nestjs/modules";
import { STAGES, pipelineTrace } from "@/lib/sims/nestjs/pipeline";
import { REQUESTS, ROUTES_START, dispatch, moveRoute, routesWon } from "@/lib/sims/nestjs/routes";
import { PAYLOADS, PIPE_START, receive, validationWon } from "@/lib/sims/nestjs/validation";
import { CardStation, CaseStation, Exhibit, TraceStation } from "../engines";
import { SimFrame } from "../SimFrame";
import { Check, Say, Segmented, Stat, Toggle } from "../ui";

export function Di() {
  return (
    <TraceStation id="di" trace={diTrace} onBoard={(m) => m !== STUCK}>
      {(s, play) => (
        <>
          <p className="text-sm">You are Nest&apos;s container. Click the classes in an order that works: everything a constructor needs must exist first.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {s.classes.map((c) => {
              const n = s.built.indexOf(c.name);
              return (
                <button key={c.name} type="button" onClick={() => play(c.name)} className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${n >= 0 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900"}`}>
                  <span className="block font-mono font-semibold">
                    {n >= 0 ? `✓ ${n + 1}. ` : ""}
                    {c.name}
                  </span>
                  <span className="block break-words font-mono text-xs text-slate-600 dark:text-slate-400">constructor({c.needs.join(", ")})</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </TraceStation>
  );
}

export function Modules() {
  const [w, setW] = useState<Wiring>(WIRING_START);
  const r = boot(w);
  const set = (patch: Partial<Wiring>) => setW({ ...w, ...patch });
  return (
    <SimFrame id="modules" won={modulesWon(w)} onReset={() => setW(WIRING_START)}>
      <p className="text-sm">AuthService injects UsersService, which lives in UsersModule and needs a repository that lives there too.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border-2 border-slate-300 p-3 dark:border-slate-700">
          <p className="font-mono text-sm font-semibold">UsersModule</p>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-400">providers: [UsersService, USERS_REPOSITORY]</p>
          <Toggle label="exports: [UsersService]" on={w.exported} onChange={(exported) => set({ exported })} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border-2 border-slate-300 p-3 dark:border-slate-700">
          <p className="font-mono text-sm font-semibold">AuthModule</p>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-400">providers: [AuthService]</p>
          <Toggle label="imports: [UsersModule]" on={w.imported} onChange={(imported) => set({ imported })} />
          <Toggle label="imports: [UsersService]" on={w.serviceInImports} onChange={(serviceInImports) => set({ serviceInImports })} />
          <Toggle label="providers: [UsersService]" on={w.copied} onChange={(copied) => set({ copied })} />
          <Toggle label="providers: [USERS_REPOSITORY]" on={w.copiedRepo} onChange={(copiedRepo) => set({ copiedRepo })} />
        </div>
      </div>
      <Exhibit wrap>{`${r.ok ? "LOG" : "ERROR"} ${r.log}`}</Exhibit>
      <Stat label="UsersService objects in memory" value={String(r.instances)} tone={r.instances === 1 ? "ok" : r.instances > 1 ? "warn" : "bad"} />
      <Say tone={modulesWon(w) ? "ok" : "warn"}>{r.hint}</Say>
    </SimFrame>
  );
}

export const Providers = () => <CardStation id="providers" deck={PROVIDERS} />;
export const Placement = () => <CardStation id="placement" deck={PLACEMENT} />;

const STYLES = [
  { value: "field", label: "Singleton, this.user" },
  { value: "argument", label: "Singleton, an argument" },
  { value: "request", label: "One object per request" },
] as const;
export function Leak() {
  const [style, setStyle] = useState<Style>("field");
  const [together, setTogether] = useState(false);
  const [seen, setSeen] = useState({ leaked: false, fixed: false });
  const r = runLeak(style, together);
  function change(nextStyle: Style, nextTogether: boolean) {
    const n = runLeak(nextStyle, nextTogether);
    setStyle(nextStyle);
    setTogether(nextTogether);
    setSeen({ leaked: seen.leaked || n.leaked, fixed: seen.fixed || (seen.leaked && nextTogether && !n.leaked && n.instances === 1) });
  }
  return (
    <SimFrame
      id="leak"
      won={seen.leaked && seen.fixed}
      onReset={() => {
        setStyle("field");
        setTogether(false);
        setSeen({ leaked: false, fixed: false });
      }}
    >
      <p className="text-sm">A ProfileService remembers who is asking, waits for the database, and answers. Two people use it.</p>
      <Segmented label="Where the user is kept" value={style} options={STYLES} onChange={(v) => change(v, together)} />
      <Toggle label="Both arrive within 5 ms" on={together} onChange={(v) => change(style, v)} />
      <ol className="flex flex-col gap-1 font-mono text-sm">
        {r.timeline.map((t) => (
          <li key={t.at + t.text} className={`flex gap-3 rounded px-2 py-1 ${t.bad ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200" : "bg-white dark:bg-slate-900"}`}>
            <span className="w-14 shrink-0 text-right text-slate-500 dark:text-slate-400">{t.at}</span>
            <span>{t.text}</span>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Wrong answers" value={String(r.answers.filter((a) => a.got !== a.user).length)} tone={r.leaked ? "bad" : "ok"} />
        <Stat label="Objects per 1,000 requests" value={r.instances.toLocaleString("en")} tone={r.instances > 1 ? "warn" : "ok"} />
      </div>
      <Say tone={r.leaked ? "bad" : "plain"}>
        {r.leaked
          ? "Amina got Youssef's profile. One object, one field, and the second request overwrote it while the first was waiting."
          : style === "field"
            ? "It looks fine, and it would pass your tests: they send one request at a time."
            : style === "argument"
              ? "Nothing to overwrite: each call carries its own user."
              : "Safe, and you build the service, and everything that injects it, again for every request."}
      </Say>
      <ul className="flex flex-col gap-1">
        <Check done={seen.leaked}>Someone got the wrong profile</Check>
        <Check done={seen.fixed}>Both at once, right answers, one object</Check>
      </ul>
    </SimFrame>
  );
}

export function Routes() {
  const [routes, setRoutes] = useState(ROUTES_START);
  return (
    <SimFrame id="routes" won={routesWon(routes)} onReset={() => setRoutes(ROUTES_START)}>
      <p className="text-sm">
        <code className="font-mono">@Controller(&apos;problems&apos;)</code>, with five handlers. Reorder them.
      </p>
      <ol className="flex flex-col gap-1.5">
        {routes.map((r, i) => (
          <li key={r.path} className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            <span className="min-w-0 flex-1 break-words font-mono text-sm">
              @Get(&apos;{r.path}&apos;) <span className="text-slate-500 dark:text-slate-400">{r.handler}()</span>
            </span>
            <button type="button" aria-label={`Move ${r.path} up`} disabled={i === 0} onClick={() => setRoutes(moveRoute(routes, i, -1))} className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-slate-700">
              ↑
            </button>
            <button type="button" aria-label={`Move ${r.path} down`} disabled={i === routes.length - 1} onClick={() => setRoutes(moveRoute(routes, i, 1))} className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-slate-700">
              ↓
            </button>
          </li>
        ))}
      </ol>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {REQUESTS.map((q) => {
          const got = dispatch(routes, q.url);
          const good = got === q.wants;
          return (
            <li key={q.url} className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${good ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"}`}>
              GET /problems/{q.url}
              <span className="block text-xs">
                {good ? "✓ " : "✗ "}
                {got}(){good ? "" : `, wanted ${q.wants}()`}
              </span>
            </li>
          );
        })}
      </ul>
      <Say tone={routesWon(routes) ? "ok" : "warn"}>{REQUESTS.filter((q) => dispatch(routes, q.url) === q.wants).length} of {REQUESTS.length} go to the right handler.</Say>
    </SimFrame>
  );
}

export function Validation() {
  const [o, setO] = useState(PIPE_START);
  return (
    <SimFrame id="validation" won={validationWon(o)} onReset={() => setO(PIPE_START)}>
      <div className="flex flex-wrap gap-2">
        <Toggle label="whitelist" on={o.whitelist} onChange={(whitelist) => setO({ ...o, whitelist })} />
        <Toggle label="forbidNonWhitelisted" on={o.forbid} onChange={(forbid) => setO({ ...o, forbid })} />
        <Toggle label="transform" on={o.transform} onChange={(transform) => setO({ ...o, transform })} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PAYLOADS.map((p) => {
          const r = receive(p.id, o);
          return (
            <div key={p.id} className={`flex min-w-0 flex-col gap-1 rounded-xl border-2 p-3 text-sm ${r.good ? "border-emerald-500" : "border-rose-400"}`}>
              <p className="font-semibold">{p.title}</p>
              <p className="break-words font-mono text-xs text-slate-600 dark:text-slate-400">sent: {p.sent}</p>
              <p className="break-words font-mono text-xs">
                {r.status === 400 ? "400 " : "handler gets: "}
                {r.got}
              </p>
              <p>
                {r.good ? "✓ " : "✗ "}
                {r.verdict}
              </p>
            </div>
          );
        })}
      </div>
      {o.forbid && !o.whitelist && <Say tone="warn">forbidNonWhitelisted does nothing on its own: it needs whitelist.</Say>}
    </SimFrame>
  );
}

export function Pipeline() {
  return (
    <TraceStation id="pipeline" trace={pipelineTrace}>
      {(s) => (
        <>
          <p className="text-sm">{s.story}</p>
          <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {STAGES.map((name, i) => {
              const here = i === s.stage;
              const look = here && s.stopped ? "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : here ? "border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/50 dark:text-cyan-100" : i < s.stage ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400";
              return (
                <li key={name} aria-current={here ? "step" : undefined} className={`rounded-lg border-2 px-2 py-2 text-center text-sm ${look}`}>
                  {here && s.stopped ? "✋ " : i < s.stage ? "✓ " : ""}
                  {name}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </TraceStation>
  );
}

export function Clinic() {
  return <CaseStation id="clinic" cases={CLINIC} pass={CLINIC_PASS} noun="Patient" ask="What do you prescribe?" endings={{ perfect: "All of them walked out cured.", won: "The waiting room is empty.", lost: `You need ${CLINIC_PASS}. Reread the lessons of the red ones, press Reset, and see them again.` }} />;
}

