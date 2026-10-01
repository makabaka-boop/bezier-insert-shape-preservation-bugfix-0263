import { describe, expect, it } from 'vitest';
import {
  cubic,
  cubicAxis,
  cubicDerivative,
  derivativeRoots,
  EasingCurve,
  invertX,
  solveCubicAxisSegment,
  solveUnitSegment,
  splitCubicAxis,
  validateSpec,
} from '../src/easing-core.js';

const ID = () => ({ x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3 });

/** Build a valid curve from [t, v] keyframes and explicit/per-segment controls. */
function makeCurve(
  kfs: Array<[number, number]>,
  controls?: Array<Partial<{ x1: number; y1: number; x2: number; y2: number }>>,
): EasingCurve {
  return new EasingCurve({
    keyframes: kfs.map(([t, v]) => ({ t, v })),
    controls: kfs.slice(0, -1).map((_, i) => ({ ...ID(), ...(controls?.[i] ?? {}) })),
  });
}

describe('validation', () => {
  it('rejects too few / too many keyframes', () => {
    expect(() => validateSpec({ keyframes: [{ t: 0, v: 0 }], controls: [] })).toThrow();
    const keyframes = Array.from({ length: 21 }, (_, i) => ({ t: i, v: 0 }));
    expect(() =>
      validateSpec({ keyframes, controls: keyframes.slice(0, -1).map(ID) }),
    ).toThrow();
  });

  it('rejects non-integer or non-strictly-increasing times', () => {
    expect(() => makeCurve([[0, 0], [1.5, 1]])).toThrow();
    expect(() => makeCurve([[0, 0], [0, 1]])).toThrow();
    expect(() => makeCurve([[1, 0], [0, 1]])).toThrow();
  });

  it('rejects out-of-range control points and mismatched control count', () => {
    expect(() => makeCurve([[0, 0], [1, 1]], [{ x1: 1.1 }])).toThrow();
    expect(() => makeCurve([[0, 0], [1, 1]], [{ x2: -0.01 }])).toThrow();
    expect(() => makeCurve([[0, 0], [1, 1]], [{ y1: 2.01 }])).toThrow();
    expect(() => makeCurve([[0, 0], [1, 1]], [{ y2: -2.01 }])).toThrow();
    expect(
      () =>
        new EasingCurve({
          keyframes: [{ t: 0, v: 0 }, { t: 1, v: 1 }],
          controls: [],
        }),
    ).toThrow();
  });

  it('accepts boundary control values', () => {
    expect(() => makeCurve([[0, 0], [1, 1]], [{ x1: 0, x2: 1, y1: -2, y2: 2 }])).not.toThrow();
  });
});

describe('bezier primitives', () => {
  it('identity controls make B(u)=u', () => {
    for (const u of [0, 0.123, 0.5, 0.987, 1]) {
      expect(cubic(1 / 3, 2 / 3, u)).toBeCloseTo(u, 12);
    }
  });

  it('inverts the monotone x(u)', () => {
    // ease-out-ish: starts flat x'(0)=0
    const cx1 = 0;
    const cx2 = 0.33;
    for (const x of [0, 0.01, 0.4, 0.99, 1]) {
      const u = invertX(cx1, cx2, x);
      expect(cubic(cx1, cx2, u)).toBeCloseTo(x, 10);
    }
    expect(invertX(0, 0, 0.125)).toBeCloseTo(0.5, 10); // x(u)=u^3
  });
});

describe('endpoints （端点）', () => {
  it('evaluate returns exact endpoint values', () => {
    const c = makeCurve([[0, 0], [3, 1], [7, -2]]);
    expect(c.evaluate(0)).toBe(0);
    expect(c.evaluate(7)).toBe(-2);
    // at an interior keyframe both adjacent segments must agree
    expect(c.evaluate(3)).toBe(1);
    // clamps outside the range
    expect(c.evaluate(-5)).toBe(0);
    expect(c.evaluate(42)).toBe(-2);
  });

  it('threshold at endpoint values yields the keyframe times exactly once', () => {
    const c = makeCurve([[2, 0], [5, 1], [8, 0]]);
    expect(c.solveThreshold(0).times).toEqual([2, 8]);
    expect(c.solveThreshold(1).times).toEqual([5]);
  });
});

describe('horizontal tangency （水平切触）', () => {
  // cy1 = cy2 = 4/3: y(u) = 4u(1-u) + u^3, unique interior extremum at
  // u = 2/3 with y = 32/27 ≈ 1.185185 — a horizontal tangent touch.
  const tangentY = 32 / 27;
  const c = () => makeCurve([[0, 0], [3, 1]], [{ y1: 4 / 3, y2: 4 / 3 }]);

  it('reports the touch point exactly once at the analytic time', () => {
    const sol = c().solveThreshold(tangentY);
    expect(sol.times).toHaveLength(1);
    // identity x controls => x(u)=u => t = 0 + (2/3)*3 = 2
    expect(sol.times[0]).toBeCloseTo(2, 6);
    // the reported time really is a value match
    expect(c().evaluate(sol.times[0])).toBeCloseTo(tangentY, 6);
  });

  it('threshold just above the extremum has zero crossings, just below has two', () => {
    expect(c().solveThreshold(tangentY + 1e-4).times).toHaveLength(0);
    const below = c().solveThreshold(tangentY - 1e-4);
    expect(below.times).toHaveLength(2);
    expect(below.times[0]).toBeLessThan(2);
    expect(below.times[1]).toBeGreaterThan(2);
    for (const t of below.times) {
      expect(Math.abs(c().evaluate(t) - (tangentY - 1e-4))).toBeLessThanOrEqual(1e-6);
    }
  });

  it('derivative roots include the analytic extremum', () => {
    const roots = derivativeRoots(4 / 3, 4 / 3);
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(2 / 3, 10);
    expect(Math.abs(cubicDerivative(4 / 3, 4 / 3, roots[0]))).toBeLessThan(1e-12);
  });
});

describe('overshoot triple intersection （超调三交点）', () => {
  // cy1 = 2, cy2 = -1: y rises past 0.5, dips below 0.5, rises to 1.
  // extrema at u = (5 ± sqrt(5))/10, values ≈ 0.7236 / 0.2764.
  const c = () => makeCurve([[0, 0], [10, 1]], [{ y1: 2, y2: -1 }]);

  it('finds three distinct sorted crossings in a single segment', () => {
    const sol = c().solveThreshold(0.5);
    expect(sol.times).toHaveLength(3);
    const [t1, t2, t3] = sol.times;
    expect(t1).toBeLessThan(t2);
    expect(t2).toBeLessThan(t3);
    for (const t of sol.times) {
      expect(Math.abs(c().evaluate(t) - 0.5)).toBeLessThanOrEqual(1e-6);
    }
    // analytic positions in u
    const uLo = (5 - Math.sqrt(5)) / 10;
    const uHi = (5 + Math.sqrt(5)) / 10;
    expect(t1).toBeGreaterThan(0);
    expect(t1).toBeLessThan(10 * uLo);
    expect(t2).toBeGreaterThan(10 * uLo);
    expect(t2).toBeLessThan(10 * uHi);
    expect(t3).toBeGreaterThan(10 * uHi);
    expect(t3).toBeLessThan(10);
  });

  it('three roots lie inside the required time error', () => {
    for (const u of solveUnitSegment(2, -1, 0.5)) {
      expect(Math.abs(cubic(2, -1, u) - 0.5)).toBeLessThan(1e-9);
    }
  });

  it('overshoot values are reachable outside [0,1]', () => {
    const c = makeCurve([[0, 0], [1, 1]], [{ y1: 2, y2: 2 }]);
    // y(0.5) = 3*0.25*0.5*2 + 3*0.5*0.25*2 + 0.125 = 0.875 > ... check curve peak
    let max = -Infinity;
    for (let i = 0; i <= 1000; i++) max = Math.max(max, c.evaluate(i / 1000));
    expect(max).toBeGreaterThan(1);
  });
});

describe('different frame spacings （不同帧间距）', () => {
  it('handles uneven integer gaps (0,1,10) with identity interpolation', () => {
    const c = makeCurve([[0, 0], [1, 2], [10, 4]]);
    expect(c.evaluate(0.5)).toBeCloseTo(1, 9);
    expect(c.evaluate(5.5)).toBeCloseTo(3, 9);
    const sol = c.solveThreshold(3);
    expect(sol.times).toHaveLength(1);
    expect(sol.times[0]).toBeCloseTo(5.5, 6);
  });

  it('round-trips through non-trivial x(u) across a wide segment', () => {
    const c = makeCurve([[0, 0], [100, 10]], [
      { x1: 0, x2: 0.2, y1: 1.5, y2: -1.2 },
    ]);
    for (const u of [0.05, 0.3, 0.5, 0.8, 0.97]) {
      const t = cubic(0, 0.2, u) * 100;
      const vExpected = cubic(1.5, -1.2, u) * 10;
      expect(c.evaluate(t)).toBeCloseTo(vExpected, 6);
    }
  });

  it('non-monotone x-free time mapping preserves crossing order with dt=1', () => {
    const c = makeCurve([[0, 0], [1, 1], [2, -1], [3, 1]]);
    const sol = c.solveThreshold(0);
    // endpoints at value 0 plus one crossing inside each of segments 2 and 3
    expect(sol.times[0]).toBe(0);
    expect(sol.times.length).toBeGreaterThanOrEqual(3);
    expect(sol.times[sol.times.length - 1]).toBeCloseTo(2.5, 6);
  });
});

describe('constant segment => interval, not points', () => {
  it('returns the time range when a whole segment equals the threshold', () => {
    const c = makeCurve([[0, 1], [5, 1], [10, 2]]);
    const sol = c.solveThreshold(1);
    expect(sol.intervals).toEqual([[0, 5]]);
    // the crossing at t=5 from the second segment is absorbed into the interval
    expect(sol.times).toEqual([]);
  });

  it('merges adjacent constant segments and keeps separate crossings', () => {
    const c = makeCurve([[0, 3], [2, 3], [4, 3], [8, 0]]);
    const sol = c.solveThreshold(3);
    expect(sol.intervals).toEqual([[0, 4]]);
    expect(sol.times).toEqual([]);
    const other = c.solveThreshold(1.5);
    expect(other.intervals).toEqual([]);
    expect(other.times).toHaveLength(1);
    expect(c.evaluate(other.times[0])).toBeCloseTo(1.5, 6);
  });

  it('a constant segment with a different threshold yields nothing', () => {
    const c = makeCurve([[0, 5], [4, 5]]);
    expect(c.solveThreshold(5).intervals).toEqual([[0, 4]]);
    expect(c.solveThreshold(5).times).toEqual([]);
    expect(c.solveThreshold(6).times).toEqual([]);
  });
});

describe('shape-preserving segment split （保形切分）', () => {
  it('subdivision reproduces the original axis exactly on both pieces', () => {
    const u = 0.388;
    const { left, right } = splitCubicAxis(0, 1.6, 1, 1.1, u);
    // shared junction point, in both position and parameter
    expect(left[3]).toBeCloseTo(right[0], 12);
    expect(left[3]).toBeCloseTo(cubicAxis(0, 1.6, 1, 1.1, u), 12);
    // the two pieces reparameterized at the junction meet the original
    expect(cubicAxis(...left, 1)).toBeCloseTo(cubicAxis(0, 1.6, 1, 1.1, u), 12);
    expect(cubicAxis(...right, 0)).toBeCloseTo(cubicAxis(0, 1.6, 1, 1.1, u), 12);
  });

  it('keeps every evaluation unchanged after splitting an overshoot segment', () => {
    const c = makeCurve([[0, 0], [6, 1]], [{ x1: 0.25, y1: 1.6, x2: 0.6, y2: 1 }]);
    const { keyframe, controls } = c.splitSegment(0, 2);
    const split = new EasingCurve({
      keyframes: [
        { t: 0, v: 0 },
        keyframe,
        { t: 6, v: 1 },
      ],
      controls,
    });
    expect(keyframe.v).toBeCloseTo(c.evaluate(2), 12);
    for (let i = 0; i <= 600; i++) {
      const t = (6 * i) / 600;
      expect(split.evaluate(t)).toBeCloseTo(c.evaluate(t), 10);
    }
    // the overshoot peak must still exist
    let max = -Infinity;
    for (let i = 0; i <= 600; i++) max = Math.max(max, split.evaluate((6 * i) / 600));
    expect(max).toBeGreaterThan(1);
  });

  it('keeps the triple threshold intersections after a split near an endpoint', () => {
    const c = makeCurve([[0, 0], [10, 1]], [{ x1: 0.1, y1: 2, x2: 0.9, y2: -1 }]);
    const { keyframe, controls } = c.splitSegment(0, 1);
    const split = new EasingCurve({
      keyframes: [{ t: 0, v: 0 }, keyframe, { t: 10, v: 1 }],
      controls,
    });
    const before = c.solveThreshold(0.5);
    const after = split.solveThreshold(0.5);
    expect(after.times).toHaveLength(before.times.length);
    for (let i = 0; i < before.times.length; i++) {
      expect(after.times[i]).toBeCloseTo(before.times[i], 8);
    }
  });

  it('uses absolute controls to retain an overshoot in a split piece whose ends are equal', () => {
    // Original hump between equal endpoints can only be authored directly in
    // absolute space (normalized y over a zero delta cannot leave the value).
    const split = new EasingCurve({
      keyframes: [
        { t: 0, v: 0 },
        { t: 2, v: 1 },
        { t: 4, v: 0 },
      ],
      controls: [
        { x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 0, yAbs1: 1.2, yAbs2: 2.0 },
        { x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 0, yAbs1: 1.3, yAbs2: 0.4 },
      ],
    });
    expect(split.evaluate(2)).toBeCloseTo(1, 12);
    let max = -Infinity;
    for (let i = 0; i <= 400; i++) max = Math.max(max, split.evaluate((4 * i) / 400));
    expect(max).toBeGreaterThan(1.2);
    // a threshold inside the hump is crossed on the way up and back down
    const sol = split.solveThreshold(1.1);
    expect(sol.times.length).toBeGreaterThanOrEqual(2);
  });

  it('splits a truly constant segment into two constant segments (interval)', () => {
    const c = makeCurve([[0, 1], [4, 1]], []);
    const { keyframe, controls } = c.splitSegment(0, 2);
    const split = new EasingCurve({
      keyframes: [{ t: 0, v: 1 }, keyframe, { t: 4, v: 1 }],
      controls,
    });
    expect(keyframe.v).toBe(1);
    const sol = split.solveThreshold(1);
    expect(sol.intervals).toEqual([[0, 4]]);
    expect(sol.times).toEqual([]);
    expect(split.solveThreshold(0).times).toEqual([]);
  });

  it('a second split keeps the curve unchanged as well', () => {
    const c = makeCurve([[0, 0], [6, 1], [14, 0.2]], [
      { x1: 0.25, y1: 1.6, x2: 0.6, y2: 1 },
      { x1: 0.4, y1: 0, x2: 0.7, y2: -0.8 },
    ]);
    const s1 = c.splitSegment(0, 2);
    const once = new EasingCurve({
      keyframes: [{ t: 0, v: 0 }, s1.keyframe, { t: 6, v: 1 }, { t: 14, v: 0.2 }],
      controls: [s1.controls[0], s1.controls[1], c.controls[1]],
    });
    const s2 = once.splitSegment(2, 10); // inside the second original segment
    const twice = new EasingCurve({
      keyframes: [
        { t: 0, v: 0 },
        s1.keyframe,
        { t: 6, v: 1 },
        s2.keyframe,
        { t: 14, v: 0.2 },
      ],
      controls: [s1.controls[0], s1.controls[1], s2.controls[0], s2.controls[1]],
    });
    for (let i = 0; i <= 1400; i++) {
      const t = (14 * i) / 1400;
      expect(twice.evaluate(t)).toBeCloseTo(c.evaluate(t), 10);
    }
  });

  it('rejects split times outside the segment', () => {
    const c = makeCurve([[0, 0], [4, 1]]);
    expect(() => c.splitSegment(0, 0)).toThrow();
    expect(() => c.splitSegment(0, 4)).toThrow();
    expect(() => c.splitSegment(0, 2.5)).toThrow();
  });

  it('general axis solver finds crossings of a non-normalized cubic', () => {
    const roots = solveCubicAxisSegment(0, 0.62, 1.22, 1, 1.03);
    expect(roots.length).toBeGreaterThanOrEqual(2);
    for (const u of roots) expect(cubicAxis(0, 0.62, 1.22, 1, u)).toBeCloseTo(1.03, 9);
  });
});

describe('dedup, ordering and accuracy', () => {
  it('shared keyframe threshold crossing is reported once, not twice', () => {
    const c = makeCurve([[0, 0], [5, 1], [10, 0]]);
    const sol = c.solveThreshold(1);
    expect(sol.times).toEqual([5]);
  });

  it('all reported times are sorted and within 1e-6 of an actual crossing', () => {
    const c = makeCurve([[0, 0], [4, 2], [9, -3], [12, 5]], [
      { y1: 2, y2: -1.5 },
      { y1: -2, y2: 2 },
      { y1: 1.8, y2: -0.4 },
    ]);
    for (const threshold of [-2.5, 0, 0.37, 1.4, 4.2]) {
      const { times } = c.solveThreshold(threshold);
      const sorted = [...times].sort((a, b) => a - b);
      expect(times).toEqual(sorted);
      for (const t of times) {
        expect(Math.abs(c.evaluate(t) - threshold)).toBeLessThanOrEqual(1e-6);
      }
    }
  });
});
