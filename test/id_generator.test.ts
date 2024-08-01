import { describe, expect, test } from 'vitest';
import idGen from '../src/id_generator.js';

describe('ID Generator Tests', () => {
  test('should generate incrementing ID per key', () => {
    const get = idGen();

    expect(get('family')).toBe(0);
    expect(get('family')).toBe(1);
    expect(get('family')).toBe(2);
    expect(get('other')).toBe(0);
    expect(get('other')).toBe(1);
    expect(get('other')).toBe(2);
  });
});
