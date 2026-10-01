/**
 * curve-store.ts — mutable holder around the immutable EasingCurve.
 *
 * The curve, the cursor readout, the canvas rendering and the exported data
 * all read through this store, so they share the exact same evaluation
 * results. Threshold solutions (the expensive inverse lookups) are memoized
 * per revision; every edit bumps the revision and clears the cache, so stale
 * inverse results are invalidated immediately and can never be served again.
 */

import { CurveSpec, EasingCurve, ThresholdSolution } from './easing-core.js';

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
   * Insert a keyframe at an integer time strictly between two existing ones.
   * The segment is split with de Casteljau subdivision, so the new keyframe
   * lands on the curve and the geometric shape is preserved exactly; the value
   * is computed from the curve, never supplied by the caller.
   */
  insertKeyframe(kf: { t: number }): void {
    const spec = this.curve.spec;
    let segment = -1;
    for (let i = 0; i < spec.keyframes.length - 1; i++) {
      if (kf.t > spec.keyframes[i].t && kf.t < spec.keyframes[i + 1].t) {
        segment = i;
        break;
      }
    }
    if (segment < 0) {
      throw new Error(`insertion time ${kf.t} must lie strictly between existing keyframes`);
    }
    const split = this.curve.splitSegment(segment, kf.t);
    const keyframes = [
      ...spec.keyframes.slice(0, segment + 1).map((k) => ({ ...k })),
      { ...split.keyframe },
      ...spec.keyframes.slice(segment + 1).map((k) => ({ ...k })),
    ];
    const controls = [
      ...spec.controls.slice(0, segment).map((c) => ({ ...c })),
      { ...split.controls[0] },
      { ...split.controls[1] },
      ...spec.controls.slice(segment + 1).map((c) => ({ ...c })),
    ];
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
