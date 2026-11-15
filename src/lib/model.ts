import { CFIG } from "@/data/cfiG";

export type Row = { type: "normal" | "inverse"; fuel: string; o2: number; bar: number; ign: number; burn: number };
export const ROWS: Row[] = CFIG.map(([t, f, o, p, i, b]) => ({ type: t === "n" ? "normal" : "inverse", fuel: f, o2: o, bar: p, ign: i, burn: b }));
export const FUELS = [...new Set(ROWS.map((r) => r.fuel))];

const feats = (r: Pick<Row, "type" | "fuel" | "o2" | "bar">) => [1, r.o2, Math.log(r.bar), r.type === "inverse" ? 1 : 0, ...FUELS.slice(1).map((f) => (r.fuel === f ? 1 : 0))];

/** Logistic regression for hot ignition, trained by gradient descent on the CFI-G rows. */
export function train(rows: Row[] = ROWS, iters = 3000, lr = 0.5) {
  const X = rows.map(feats), y = rows.map((r) => r.ign);
  const mu = X[0]!.map((_, j) => (j === 0 ? 0 : X.reduce((s, x) => s + x[j]!, 0) / X.length));
  const sd = X[0]!.map((_, j) => (j === 0 ? 1 : Math.sqrt(X.reduce((s, x) => s + (x[j]! - mu[j]!) ** 2, 0) / X.length) || 1));
  const Z = X.map((x) => x.map((v, j) => (v - mu[j]!) / sd[j]!));
  const w = new Array(Z[0]!.length).fill(0);
  for (let it = 0; it < iters; it++) {
    const g = new Array(w.length).fill(0);
    Z.forEach((z, i) => { const p = 1 / (1 + Math.exp(-z.reduce((s, v, j) => s + v * w[j], 0))); z.forEach((v, j) => (g[j] += (p - y[i]!) * v)); });
    w.forEach((_, j) => (w[j] -= (lr * (g[j] + 0.01 * w[j])) / Z.length));
  }
  const predict = (r: Pick<Row, "type" | "fuel" | "o2" | "bar">) => 1 / (1 + Math.exp(-feats(r).reduce((s, v, j) => s + ((v - mu[j]!) / sd[j]!) * w[j], 0)));
  const accuracy = rows.filter((r) => (predict(r) >= 0.5 ? 1 : 0) === r.ign).length / rows.length;
  return { predict, accuracy };
}

export function stats(rows: Row[]) {
  const ig = rows.filter((r) => r.ign);
  const burn = ig.map((r) => r.burn).sort((a, b) => a - b);
  return { n: rows.length, rate: rows.length ? ig.length / rows.length : 0, medianBurn: burn.length ? burn[Math.floor(burn.length / 2)]! : 0, maxBurn: burn.at(-1) ?? 0 };
}

/** Share of CFI-G tests within ±3 points of O2 and ±25% of pressure that hot-ignited. Null when no tests are nearby. */
export function nearShare(o2Fraction: number, bar: number, rows: Row[] = ROWS) {
  const near = rows.filter((r) => Math.abs(r.o2 - o2Fraction) <= 0.03 && Math.abs(Math.log(r.bar / bar)) <= Math.log(1.25));
  return near.length ? { share: near.filter((r) => r.ign).length / near.length, n: near.length } : null;
}
