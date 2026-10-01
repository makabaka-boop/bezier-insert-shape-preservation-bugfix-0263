import { describe, expect, it } from 'vitest';
import {
  CONTROL_X_MAX,
  CONTROL_X_MIN,
  CONTROL_Y_MAX,
  CONTROL_Y_MIN,
} from '../src/easing-core.js';
import { CurveStore } from '../src/curve-store.js';

function spec() {
  return {
    keyframes: [
      { t: 0, v: 0 },
      { t: 4, v: 1 },
      { t: 8, v: 0 },
    ],
    controls: [
      { x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3 },
      { x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3 },
    ],
  };
}

describe('CurveStore caching and invalidation', () => {
  it('memoizes threshold solutions within a revision', () => {
    const store = new CurveStore(spec());
    const a = store.solveThreshold(0.5);
    const b = store.solveThreshold(0.5);
    expect(b).toBe(a); // same object => served from cache
  });

  it('invalidates old inverse results immediately after an edit', () => {
    const store = new CurveStore(spec());
    const before = store.solveThreshold(0.5);
    expect(before.times).toEqual([2, 6]);
    const revBefore = store.currentRevision;

    store.updateControl(0, { x1: 0.2, y1: 2, x2: 0.8, y2: -1 });

    expect(store.currentRevision).toBe(revBefore + 1);
    const after = store.solveThreshold(0.5);
    expect(after).not.toBe(before); // stale object never re-served
    expect(after.times).not.toEqual(before.times);
    // new curve really overshoots: three crossings in the first segment
    expect(after.times.length).toBeGreaterThanOrEqual(3);
    for (const t of after.times) {
      expect(Math.abs(store.evaluate(t) - 0.5)).toBeLessThanOrEqual(1e-6);
    }
  });

  it('keyframe edits also invalidate and re-validate', () => {
    const store = new CurveStore(spec());
    store.solveThreshold(0.5);
    store.updateKeyframe(1, { t: 4, v: 2 });
    expect(store.solveThreshold(0.5).times.length).toBeGreaterThan(0);
    expect(() => store.updateKeyframe(1, { t: 4.5, v: 2 })).toThrow(); // non-integer
    expect(() => store.updateKeyframe(1, { t: 8, v: 2 })).toThrow(); // not increasing
  });

  it('insert/remove keep the spec valid and notify listeners', () => {
    const store = new CurveStore(spec());
    let notified = 0;
    store.subscribe(() => notified++);

    store.insertKeyframe({ t: 6, v: store.evaluate(6) });
    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 4, 6, 8]);
    expect(store.spec.controls).toHaveLength(3);
    expect(notified).toBe(1);

    store.removeKeyframe(1);
    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 6, 8]);
    expect(store.spec.controls).toHaveLength(2);
    expect(notified).toBe(2);
  });

  it('sample() uses the shared evaluation path', () => {
    const store = new CurveStore(spec());
    const samples = store.sample(8);
    expect(samples).toHaveLength(9);
    expect(samples[0]).toEqual({ t: 0, v: 0 });
    expect(samples[8]).toEqual({ t: 8, v: 0 });
    expect(samples[4].v).toBeCloseTo(store.evaluate(4), 12);
  });
});

describe('insertKeyframe preserves the curve', () => {
  // the editor's default curve: overshoot in segment 0, dip in segment 1
  const overshootSpec = () => ({
    keyframes: [
      { t: 0, v: 0 },
      { t: 6, v: 1 },
      { t: 14, v: 0.2 },
    ],
    controls: [
      { x1: 0.25, y1: 1.6, x2: 0.6, y2: 1 },
      { x1: 0.4, y1: 0, x2: 0.7, y2: -0.8 },
    ],
  });

  it('keeps evaluate/solveThreshold/sample results identical for a mid-segment insert', () => {
    const store = new CurveStore(overshootSpec());
    const times: number[] = [];
    for (let i = 0; i <= 280; i++) times.push((14 * i) / 280); // 0 .. 14 step 0.05
    const valuesBefore = times.map((t) => store.evaluate(t));
    const thresholds = [0.5, 0.9, 1.05, store.evaluate(3)]; // last one hits the new keyframe
    const solvesBefore = thresholds.map((th) => store.solveThreshold(th));
    const samplesBefore = store.sample(200);
    const revBefore = store.currentRevision;

    store.insertKeyframe({ t: 3, v: store.evaluate(3) });

    expect(store.currentRevision).toBe(revBefore + 1);
    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 3, 6, 14]);
    expect(store.spec.controls).toHaveLength(3);
    times.forEach((t, i) => expect(store.evaluate(t)).toBeCloseTo(valuesBefore[i], 9));
    thresholds.forEach((th, i) => {
      const after = store.solveThreshold(th);
      expect(after.intervals).toEqual(solvesBefore[i].intervals);
      // same crossings, in particular exactly one at the new keyframe (not two)
      expect(after.times.length).toBe(solvesBefore[i].times.length);
      after.times.forEach((tt, j) => expect(tt).toBeCloseTo(solvesBefore[i].times[j], 6));
    });
    store.sample(200).forEach((s, i) => {
      expect(s.t).toBe(samplesBefore[i].t);
      expect(s.v).toBeCloseTo(samplesBefore[i].v, 9);
    });
  });

  it('stays exact for insertions one frame away from a keyframe', () => {
    const store = new CurveStore({
      keyframes: [
        { t: 0, v: 0 },
        { t: 10, v: 1 },
      ],
      controls: [{ x1: 0.1, y1: 0.8, x2: 0.3, y2: 0.2 }],
    });
    const times: number[] = [];
    for (let i = 0; i <= 200; i++) times.push(i / 20);
    const before = times.map((t) => store.evaluate(t));

    store.insertKeyframe({ t: 1, v: store.evaluate(1) });
    store.insertKeyframe({ t: 9, v: store.evaluate(9) });

    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 1, 9, 10]);
    times.forEach((t, i) => expect(store.evaluate(t)).toBeCloseTo(before[i], 9));
  });

  it('splits a value-constant segment without introducing drift', () => {
    const store = new CurveStore({
      keyframes: [
        { t: 0, v: 1 },
        { t: 5, v: 1 },
        { t: 10, v: 2 },
      ],
      controls: [
        { x1: 0.2, y1: 2, x2: 0.8, y2: -1 },
        { x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3 },
      ],
    });
    const before = store.sample(100);

    store.insertKeyframe({ t: 2, v: store.evaluate(2) });

    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 2, 5, 10]);
    store.sample(100).forEach((s, i) => expect(s.v).toBeCloseTo(before[i].v, 12));
    // the constant region still reports as one merged interval
    expect(store.solveThreshold(1).intervals).toEqual([[0, 5]]);
    expect(store.solveThreshold(1).times).toEqual([]);
  });

  it('clamps halves whose exact handles leave the control box instead of failing', () => {
    const store = new CurveStore(overshootSpec());
    // the exact split at t=1 needs a right-half y handle of ~2.41 (> CONTROL_Y_MAX)
    const v1 = store.evaluate(1);
    const leftProbe = store.evaluate(0.5);
    const otherSegmentProbe = store.evaluate(10);

    store.insertKeyframe({ t: 1, v: v1 });

    expect(store.spec.keyframes.map((k) => k.t)).toEqual([0, 1, 6, 14]);
    // the keyframe sits exactly on the original curve point
    expect(store.evaluate(1)).toBe(v1);
    // the representable parts of the curve are preserved exactly
    expect(store.evaluate(0.5)).toBeCloseTo(leftProbe, 9);
    expect(store.evaluate(10)).toBeCloseTo(otherSegmentProbe, 9);
    // and every derived handle is back inside the valid box
    for (const c of store.spec.controls) {
      for (const x of [c.x1, c.x2]) {
        expect(x).toBeGreaterThanOrEqual(CONTROL_X_MIN);
        expect(x).toBeLessThanOrEqual(CONTROL_X_MAX);
      }
      for (const y of [c.y1, c.y2]) {
        expect(y).toBeGreaterThanOrEqual(CONTROL_Y_MIN);
        expect(y).toBeLessThanOrEqual(CONTROL_Y_MAX);
      }
    }
  });
});
