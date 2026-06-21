import { describe, expect, it } from 'vitest';
import { add } from './sanity';

/**
 * Smoke test for the Vitest toolchain (spec REQ-BOOT-3 B3.a, B10.a).
 * Asserts real behavior on the first production helper, not a tautology.
 */
describe('lib/sanity', () => {
  it('adds two positive integers', () => {
    expect(add(1, 1)).toBe(2);
  });

  it('adds two negative integers', () => {
    expect(add(-3, -7)).toBe(-10);
  });

  it('returns the operand when adding zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});
