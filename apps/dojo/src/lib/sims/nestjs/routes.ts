/** Routes are tried in the order they're declared: the first match wins. */
import { swapped } from "../engines";

export interface RouteDef {
  path: string;
  handler: string;
}
export const ROUTES_START: readonly RouteDef[] = [
  { path: "*path", handler: "notFoundPage" },
  { path: ":slug", handler: "findOne" },
  { path: ":slug/tests", handler: "listTests" },
  { path: "featured", handler: "featured" },
  { path: "featured/tests", handler: "featuredTests" },
];
export const REQUESTS: readonly { url: string; wants: string }[] = [
  { url: "two-sum", wants: "findOne" },
  { url: "featured", wants: "featured" },
  { url: "two-sum/tests", wants: "listTests" },
  { url: "featured/tests", wants: "featuredTests" },
  { url: "pair-budget", wants: "findOne" },
  { url: "a/b/c", wants: "notFoundPage" },
];

export function matches(path: string, url: string): boolean {
  if (path.startsWith("*")) return true;
  const p = path.split("/"), u = url.split("/");
  return p.length === u.length && p.every((seg, i) => seg.startsWith(":") || seg === u[i]);
}
export const dispatch = (routes: readonly RouteDef[], url: string) => routes.find((r) => matches(r.path, url))?.handler ?? "404";
export const routesWon = (routes: readonly RouteDef[]) => REQUESTS.every((r) => dispatch(routes, r.url) === r.wants);
export function moveRoute(routes: readonly RouteDef[], i: number, by: -1 | 1): readonly RouteDef[] {
  const j = i + by;
  return j < 0 || j >= routes.length ? routes : swapped(routes, i, j);
}
