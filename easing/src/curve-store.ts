/**
 * curve-store.ts — mutable holder around the immutable EasingCurve.
 *
 * The curve, the cursor readout, the canvas rendering and the exported data
 * all read through this store, so they share the exact same evaluation
 * results. Threshold solutions (the expensive inverse lookups) are memoized
 * per revision; every edit bumps the revision and clears the cache, so stale
 * inverse results are invalidated immediately and can never be served again.
 */

import {
  CONTROL_X_MAX,
  CONTROL_X_MIN,
  CONTROL_Y_MAX,
  CONTROL_Y_MIN,
  ControlPair,
  CurveSpec,
  EasingCurve,
  invertX,
  ThresholdSolution,
} from './easing-core.js';

export type StoreListener = () => void;

export class CurveStore {
  private curve: EasingCurve;
  private revision = 0;
  private thresholdCache = new Map<number, ThresholdSolution>();
  private listeners = new Set<StoreListener>();

  constructor(spec: CurveSpec) {
    this.curve = new EasingCurve(spec);
  }

  get current(): EasingCurve {
    return this.curve;
  }

  get currentRevision(): number {
    return this.revision;
  }

  get spec(): CurveSpec {
    return this.curve.spec;
  }

  /** Shared evaluation path used by cursor, canvas and export alike. */
  evaluate(t: number): number {
    return this.curve.evaluate(t);
  }

  /** Memoized inverse lookup; the cache lives only as long as the revision. */
  solveThreshold(threshold: number): ThresholdSolution {
    const cached = this.thresholdCache.get(threshold);
    if (cached) return cached;
    const solution = this.curve.solveThreshold(threshold);
    this.thresholdCache.set(threshold, solution);
    return solution;
  }

  /** n+1 samples over [t0, t1] through the shared evaluation path. */
  sample(n: number): Array<{ t: number; v: number }> {
    const { t0, t1 } = this.curve;
    const out: Array<{ t: number; v: number }> = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      out.push({ t, v: this.curve.evaluate(t) });
    }
    return out;
  }

  /** Replace the whole curve; invalidates every cached inverse result. */
  update(spec: CurveSpec): void {
    this.curve = new EasingCurve(spec);
    this.revision++;
    this.thresholdCache.clear();
    this.emit();
  }

  /** Convenience edit helpers — each one is a full invalidating update. */
  updateKeyframe(index: number, kf: { t: number; v: number }): void {
    const spec = this.curve.spec;
    const keyframes = spec.keyframes.map((k, i) => (i === index ? { ...kf } : { ...k }));
    this.update({ keyframes, controls: spec.controls.map((c) => ({ ...c })) });
  }

  updateControl(segment: number, control: { x1: number; y1: number; x2: number; y2: number }): void {
    const spec = this.curve.spec;
    const controls = spec.controls.map((c, i) => (i === segment ? { ...control } : { ...c }));
    this.update({ keyframes: spec.keyframes.map((k) => ({ ...k })), controls });
  }

  /**
   * Insert a keyframe. For an interior time the segment spanning `kf.t` is
   * subdivided (de Casteljau) at the parameter where the curve reaches
   * `kf.t`, so the two new segments retrace the original curve and cursor,
   * threshold and export results are left unchanged. `kf.v` is expected to
   * be the on-curve value (see `evaluate`); an off-curve value instead
   * shears the two halves smoothly toward the keyframe.
   */
  insertKeyframe(kf: { t: number; v: number }): void {
    const spec = this.curve.spec;
    const keyframes = [...spec.keyframes.map((k) => ({ ...k })), { ...kf }].sort(
      (a, b) => a.t - b.t,
    );
    const at = keyframes.findIndex((k) => k.t === kf.t);
    const controls = spec.controls.map((c) => ({ ...c }));
    if (at === 0 || at === keyframes.length - 1) {
      // outside the existing time range: nothing to preserve, extend linearly
      controls.splice(at === 0 ? 0 : controls.length, 0, identityControl());
    } else {
      const a = keyframes[at - 1];
      const b = keyframes[at + 1];
      const c = controls[at - 1];
      const u = invertX(c.x1, c.x2, (kf.t - a.t) / (b.t - a.t));
      const dv = b.v - a.v;
      const yLeft = dv === 0 ? 0 : (kf.v - a.v) / dv;
      const { left, right } = splitControlPair(c, u, yLeft);
      controls.splice(at - 1, 1, left, right);
    }
    this.update({ keyframes, controls });
  }

  removeKeyframe(index: number): void {
    const spec = this.curve.spec;
    const keyframes = spec.keyframes.filter((_, i) => i !== index).map((k) => ({ ...k }));
    const dropSegment = Math.min(index, spec.controls.length - 1);
    const controls = spec.controls.filter((_, i) => i !== dropSegment).map((c) => ({ ...c }));
    this.update({ keyframes, controls });
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

/** (1/3, 1/3) / (2/3, 2/3) makes both x(u) = u and y(u) = u: a linear segment. */
export function identityControl(): { x1: number; y1: number; x2: number; y2: number } {
  return { x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3 };
}

/**
 * Subdivide one segment's control pair at parameter `u` (de Casteljau) and
 * renormalize each half to its own endpoint box, so the two halves retrace
 * the original segment exactly. `yLeft` is the split point's position in the
 * original segment's normalized value axis, `(v - v0) / (v1 - v0)`; when it
 * is 0 or 1 the corresponding half is value-constant, its y controls are
 * irrelevant, and identity controls are used to keep that half editable.
 *
 * Exact halves of an in-box segment can need handles outside the control box
 * (e.g. an overshoot segment split near an endpoint, where the half's value
 * excursion dwarfs its net change). Those handles are clamped to keep the
 * spec valid — the closest shape the model can represent.
 */
export function splitControlPair(
  c: ControlPair,
  u: number,
  yLeft: number,
): { left: ControlPair; right: ControlPair } {
  const w = 1 - u;
  // de Casteljau intermediates for one axis with endpoints 0 and 1:
  // control points (0, p1, p2, 1) split at u into (0, q0, r0, s) and (s, r1, q2, 1)
  const axis = (p1: number, p2: number) => {
    const q0 = u * p1;
    const q1 = w * p1 + u * p2;
    const q2 = w * p2 + u;
    const r0 = w * q0 + u * q1;
    const r1 = w * q1 + u * q2;
    const s = w * r0 + u * r1; // == cubic(p1, p2, u)
    return { q0, q2, r0, r1, s };
  };
  const X = axis(c.x1, c.x2);
  const Y = axis(c.y1, c.y2);
  const id = identityControl();
  const cx = (v: number) => Math.min(CONTROL_X_MAX, Math.max(CONTROL_X_MIN, v));
  const cy = (v: number) => Math.min(CONTROL_Y_MAX, Math.max(CONTROL_Y_MIN, v));
  // x(u) is strictly increasing, so 0 < X.s < 1 and both divisions are safe
  const left: ControlPair = {
    x1: cx(X.q0 / X.s),
    y1: yLeft === 0 ? id.y1 : cy(Y.q0 / yLeft),
    x2: cx(X.r0 / X.s),
    y2: yLeft === 0 ? id.y2 : cy(Y.r0 / yLeft),
  };
  const right: ControlPair = {
    x1: cx((X.r1 - X.s) / (1 - X.s)),
    y1: yLeft === 1 ? id.y1 : cy((Y.r1 - yLeft) / (1 - yLeft)),
    x2: cx((X.q2 - X.s) / (1 - X.s)),
    y2: yLeft === 1 ? id.y2 : cy((Y.q2 - yLeft) / (1 - yLeft)),
  };
  return { left, right };
}
