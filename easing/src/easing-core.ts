/**
 * easing-core.ts — pure math for a multi-segment cubic-bezier easing curve.
 *
 * A curve is N (2..20) keyframes with strictly increasing integer times and
 * N-1 segments. Segment i between keyframes (t0,v0)->(t1,v1) is parameterized
 * by u in [0,1] as a standard cubic bezier in both axes:
 *
 *   x(u) = 3(1-u)^2 u cx1 + 3(1-u) u^2 cx2 + u^3        (cx in [0,1] => monotone)
 *   y(u) = 3(1-u)^2 u cy1 + 3(1-u) u^2 cy2 + u^3        (cy in [-2,2] => may overshoot)
 *
 *   t(u) = t0 + x(u) * (t1 - t0)
 *   v(u) = v0 + y(u) * (v1 - v0)
 *
 * Segments produced by shape-preserving subdivision (see splitSegment) carry
 * optional absolute control coordinates yAbs1/yAbs2 which replace the
 * normalized cy values: that representation is required once a split lands at
 * an endpoint value, where the normalized form (multiplied by v1-v0 = 0) can
 * no longer express the inherited overshoot.
 *
 * Evaluation at time t inverts the monotone x(u) first, then evaluates y.
 * Threshold solving splits each segment at the extrema of y'(u) so every piece
 * is monotone, then finds every crossing or tangency. A segment whose four y
 * points are identical is constant over its whole time range; if that constant
 * equals the threshold the solution is a time *interval*, not points.
 */

export const MIN_KEYFRAMES = 2;
export const MAX_KEYFRAMES = 20;
export const CONTROL_X_MIN = 0;
export const CONTROL_X_MAX = 1;
export const CONTROL_Y_MIN = -2;
export const CONTROL_Y_MAX = 2;

/** Tolerance for reporting/deduping results: well under the required 1e-6. */
export const RESULT_TOLERANCE = 1e-6;
const DEDUP_TOL = 1e-7;
const ZERO_EPS = 1e-10;
const PARAM_EPS = 1e-12;

export interface Keyframe {
  /** integer time, strictly increasing across keyframes */
  t: number;
  /** value at the keyframe */
  v: number;
}

/** The two bezier control points of one segment, normalized to the segment. */
export interface ControlPair {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /**
   * Optional absolute value-space y coordinates of the two controls. When
   * present they override the normalized y1/y2 values; subdividing a segment
   * at a keyframe whose value equals an endpoint needs this representation,
   * because normalized controls cannot describe an overshoot in that case.
   */
  yAbs1?: number;
  yAbs2?: number;
}

export interface CurveSpec {
  keyframes: Keyframe[];
  controls: ControlPair[]; // length === keyframes.length - 1
}

export interface ThresholdSolution {
  /** sorted, deduplicated times where the curve crosses or touches the threshold */
  times: number[];
  /** merged [start, end] time ranges where the curve is identically the threshold */
  intervals: Array<[number, number]>;
}

export function validateSpec(spec: CurveSpec): void {
  if (!spec || !Array.isArray(spec.keyframes) || !Array.isArray(spec.controls)) {
    throw new Error('spec must contain keyframes and controls arrays');
  }
  const { keyframes, controls } = spec;
  if (keyframes.length < MIN_KEYFRAMES || keyframes.length > MAX_KEYFRAMES) {
    throw new Error(`keyframe count must be ${MIN_KEYFRAMES}..${MAX_KEYFRAMES}, got ${keyframes.length}`);
  }
  if (controls.length !== keyframes.length - 1) {
    throw new Error(`expected ${keyframes.length - 1} control pairs, got ${controls.length}`);
  }
  for (const kf of keyframes) {
    if (!Number.isFinite(kf.t) || !Number.isInteger(kf.t)) {
      throw new Error(`keyframe time must be an integer, got ${kf.t}`);
    }
    if (!Number.isFinite(kf.v)) {
      throw new Error(`keyframe value must be finite, got ${kf.v}`);
    }
  }
  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].t <= keyframes[i - 1].t) {
      throw new Error(
        `keyframe times must be strictly increasing: t[${i - 1}]=${keyframes[i - 1].t}, t[${i}]=${keyframes[i].t}`,
      );
    }
  }
  for (let i = 0; i < controls.length; i++) {
    const c = controls[i];
    for (const [name, value, lo, hi] of [
      ['x1', c.x1, CONTROL_X_MIN, CONTROL_X_MAX],
      ['x2', c.x2, CONTROL_X_MIN, CONTROL_X_MAX],
      ['y1', c.y1, CONTROL_Y_MIN, CONTROL_Y_MAX],
      ['y2', c.y2, CONTROL_Y_MIN, CONTROL_Y_MAX],
    ] as const) {
      if (!Number.isFinite(value) || value < lo || value > hi) {
        throw new Error(`control ${name} of segment ${i} must be in [${lo}, ${hi}], got ${value}`);
      }
    }
    if (c.yAbs1 !== undefined && !Number.isFinite(c.yAbs1)) {
      throw new Error(`control yAbs1 of segment ${i} must be finite, got ${c.yAbs1}`);
    }
    if (c.yAbs2 !== undefined && !Number.isFinite(c.yAbs2)) {
      throw new Error(`control yAbs2 of segment ${i} must be finite, got ${c.yAbs2}`);
    }
  }
}

/** Absolute y coordinates of a segment's two control points. */
export function absoluteYControls(
  control: ControlPair,
  v0: number,
  v1: number,
): [number, number] {
  const dv = v1 - v0;
  return [
    control.yAbs1 ?? v0 + control.y1 * dv,
    control.yAbs2 ?? v0 + control.y2 * dv,
  ];
}

/**
 * Split a bezier axis at u with de Casteljau subdivision. A cubic split at
 * the point on the original curve produces exactly two cubic pieces, so the
 * geometric curve is unchanged.
 */
export function splitCubicAxis(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  u: number,
): {
  left: [number, number, number, number];
  right: [number, number, number, number];
} {
  const w = 1 - u;
  const q01 = w * p0 + u * p1;
  const q12 = w * p1 + u * p2;
  const q23 = w * p2 + u * p3;
  const r02 = w * q01 + u * q12;
  const r13 = w * q12 + u * q23;
  const s = w * r02 + u * r13;
  return {
    left: [p0, q01, r02, s],
    right: [s, r13, q23, p3],
  };
}

/** Normalized cubic bezier with endpoints 0 and 1: B(u) for control values c1, c2. */
export function cubic(c1: number, c2: number, u: number): number {
  const w = 1 - u;
  return 3 * w * w * u * c1 + 3 * w * u * u * c2 + u * u * u;
}

/** dB/du of the normalized cubic bezier. */
export function cubicDerivative(c1: number, c2: number, u: number): number {
  const w = 1 - u;
  return 3 * w * w * c1 + 6 * w * u * (c2 - c1) + 3 * u * u * (1 - c2);
}

/** Value of a general cubic bezier axis at u. */
export function cubicAxis(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  u: number,
): number {
  const w = 1 - u;
  return (
    w * w * w * p0 +
    3 * w * w * u * p1 +
    3 * w * u * u * p2 +
    u * u * u * p3
  );
}

/**
 * Interior extrema of a cubic bezier axis: u in (0,1) where B'(u) = 0.
 * B' is quadratic. Returns 0, 1 or 2 sorted distinct values.
 */
export function cubicDerivativeRoots(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
): number[] {
  const a = 3 * (p3 - 3 * p2 + 3 * p1 - p0);
  const b = 6 * (p2 - 2 * p1 + p0);
  const c = 3 * (p1 - p0);
  const roots: number[] = [];
  if (Math.abs(a) < PARAM_EPS) {
    if (Math.abs(b) > PARAM_EPS) roots.push(-c / b);
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      roots.push((-b - sq) / (2 * a), (-b + sq) / (2 * a));
    }
  }
  const interior = roots
    .filter((u) => u > PARAM_EPS && u < 1 - PARAM_EPS)
    .sort((p, q) => p - q);
  // dedupe (double root)
  return interior.filter((u, i) => i === 0 || u - interior[i - 1] > PARAM_EPS);
}

/** Interior extrema of the normalized bezier: u in (0,1) where B'(u) = 0. */
export function derivativeRoots(c1: number, c2: number): number[] {
  return cubicDerivativeRoots(0, c1, c2, 1);
}

/** Bisection on a monotone function; 80 iterations => ~1e-24 interval width. */
function bisect(f: (u: number) => number, lo: number, hi: number): number {
  let fLo = f(lo);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (fMid === 0) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Invert the monotone x(u): find u in [0,1] with cubic(cx1, cx2, u) = x.
 * x is clamped to [0,1].
 */
export function invertX(cx1: number, cx2: number, x: number): number {
  const target = Math.min(1, Math.max(0, x));
  if (target === 0) return 0;
  if (target === 1) return 1;
  return bisect((u) => cubic(cx1, cx2, u) - target, 0, 1);
}

/**
 * All u in [0,1] where the cubic bezier axis equals target. The axis is split
 * at derivative extrema into monotone pieces; crossings and tangent touches
 * are both reported, and duplicates at shared split points are merged.
 * A constant axis returns no roots; the caller is responsible for intervals.
 */
export function solveCubicAxisSegment(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  target: number,
): number[] {
  if (p0 === p1 && p1 === p2 && p2 === p3) return [];
  const f = (u: number) => cubicAxis(p0, p1, p2, p3, u) - target;
  const bounds = [0, ...cubicDerivativeRoots(p0, p1, p2, p3), 1];
  const roots: number[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    const fLo = f(lo);
    if (Math.abs(fLo) <= ZERO_EPS) {
      roots.push(lo);
      continue; // monotone piece: no other root inside
    }
    const fHi = f(hi);
    if (Math.abs(fHi) <= ZERO_EPS) {
      continue; // will be reported as the next piece's lo (or the final check)
    }
    if (fLo * fHi < 0) {
      roots.push(bisect(f, lo, hi));
    }
  }
  if (Math.abs(f(1)) <= ZERO_EPS) roots.push(1);
  roots.sort((p, q) => p - q);
  return roots.filter((u, i) => i === 0 || u - roots[i - 1] > DEDUP_TOL);
}

/**
 * All u in [0,1] where cubic(cy1, cy2, u) = yHat, found by splitting the unit
 * segment at the extrema of y'(u) into monotone pieces. Crossings and tangent
 * touches are both reported; duplicates at shared split points are merged.
 */
export function solveUnitSegment(cy1: number, cy2: number, yHat: number): number[] {
  return solveCubicAxisSegment(0, cy1, cy2, 1, yHat);
}

export class EasingCurve {
  readonly spec: CurveSpec;

  constructor(spec: CurveSpec) {
    validateSpec(spec);
    // defensive copy: the curve is immutable once constructed
    this.spec = {
      keyframes: spec.keyframes.map((k) => ({ ...k })),
      controls: spec.controls.map((c) => ({ ...c })),
    };
  }

  get keyframes(): readonly Keyframe[] {
    return this.spec.keyframes;
  }

  get controls(): readonly ControlPair[] {
    return this.spec.controls;
  }

  get t0(): number {
    return this.spec.keyframes[0].t;
  }

  get t1(): number {
    return this.spec.keyframes[this.spec.keyframes.length - 1].t;
  }

  /** Segment index i with t_i <= t <= t_{i+1}; t is clamped to [t0, t1] first. */
  private segmentIndex(t: number): number {
    const kfs = this.spec.keyframes;
    const clamped = Math.min(Math.max(t, this.t0), this.t1);
    let lo = 0;
    let hi = kfs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (kfs[mid + 1].t < clamped) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Absolute y controls for a segment, resolving normalized controls. */
  private yControls(i: number): [number, number] {
    return absoluteYControls(
      this.spec.controls[i],
      this.spec.keyframes[i].v,
      this.spec.keyframes[i + 1].v,
    );
  }

  /**
   * Subdivide segment i at a new keyframe time. The split is done in parameter
   * space (de Casteljau) at the u that maps to the requested time, which keeps
   * both halves on exactly the old cubic curve.
   */
  splitSegment(segment: number, t: number): {
    keyframe: Keyframe;
    controls: [ControlPair, ControlPair];
  } {
    const kfs = this.spec.keyframes;
    const a = kfs[segment];
    const b = kfs[segment + 1];
    if (!Number.isInteger(t) || t <= a.t || t >= b.t) {
      throw new Error(`split time must be an integer strictly between ${a.t} and ${b.t}, got ${t}`);
    }
    const c = this.spec.controls[segment];
    const s = (t - a.t) / (b.t - a.t);
    const u = invertX(c.x1, c.x2, s);
    const xSplit = splitCubicAxis(0, c.x1, c.x2, 1, u);
    const [ay1, ay2] = this.yControls(segment);
    const ySplit = splitCubicAxis(a.v, ay1, ay2, b.v, u);
    const v = ySplit.left[3];

    // X controls are normalized within each new segment. Clamp subdivision
    // round-off so validation accepts exact endpoints.
    const norm = (value: number) => Math.min(1, Math.max(0, value));
    const left: ControlPair = {
      x1: norm(xSplit.left[1] / s),
      x2: norm(xSplit.left[2] / s),
      y1: 1 / 3,
      y2: 2 / 3,
      yAbs1: ySplit.left[1],
      yAbs2: ySplit.left[2],
    };
    const r = 1 - s;
    const right: ControlPair = {
      x1: norm((xSplit.right[1] - s) / r),
      x2: norm((xSplit.right[2] - s) / r),
      y1: 1 / 3,
      y2: 2 / 3,
      yAbs1: ySplit.right[1],
      yAbs2: ySplit.right[2],
    };
    return { keyframe: { t, v }, controls: [left, right] };
  }

  /**
   * Value at time t: locate the segment, invert the monotone x(u) to get the
   * parameter u, then evaluate y(u) mapped to the endpoint values.
   * Outside [t0, t1] the endpoint values are returned.
   */
  evaluate(t: number): number {
    const kfs = this.spec.keyframes;
    if (t <= this.t0) return kfs[0].v;
    if (t >= this.t1) return kfs[kfs.length - 1].v;
    const i = this.segmentIndex(t);
    const a = kfs[i];
    const b = kfs[i + 1];
    const c = this.spec.controls[i];
    const u = invertX(c.x1, c.x2, (t - a.t) / (b.t - a.t));
    const [y1, y2] = this.yControls(i);
    return cubicAxis(a.v, y1, y2, b.v, u);
  }

  /**
   * Every time the curve crosses or touches `threshold`, plus the time
   * intervals over which the curve is identically `threshold`.
   * Times are sorted and deduplicated; points inside an interval are absorbed.
   */
  solveThreshold(threshold: number): ThresholdSolution {
    const kfs = this.spec.keyframes;
    const times: number[] = [];
    const intervals: Array<[number, number]> = [];
    for (let i = 0; i < kfs.length - 1; i++) {
      const a = kfs[i];
      const b = kfs[i + 1];
      const c = this.spec.controls[i];
      const [y1, y2] = this.yControls(i);
      if (a.v === b.v && a.v === y1 && y1 === y2) {
        // the whole segment is constant, regardless of its normalized fields
        if (a.v === threshold) {
          const last = intervals[intervals.length - 1];
          if (last && last[1] === a.t) last[1] = b.t;
          else intervals.push([a.t, b.t]);
        }
        continue;
      }
      for (const u of solveCubicAxisSegment(a.v, y1, y2, b.v, threshold)) {
        times.push(a.t + cubic(c.x1, c.x2, u) * (b.t - a.t));
      }
    }
    times.sort((p, q) => p - q);
    const deduped: number[] = [];
    for (const t of times) {
      const last = deduped[deduped.length - 1];
      if (last === undefined || t - last > DEDUP_TOL) deduped.push(t);
      else deduped[deduped.length - 1] = (last + t) / 2; // merge duplicates (e.g. tangency)
    }
    const absorbed = deduped.filter(
      (t) => !intervals.some(([lo, hi]) => t >= lo - DEDUP_TOL && t <= hi + DEDUP_TOL),
    );
    return { times: absorbed, intervals };
  }
}
