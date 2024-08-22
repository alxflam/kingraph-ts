import { describe, expect, test } from 'vitest';
import slugify from '../src/slugify.js';

describe('Slugify Tests', () => {
  test('should add slugs', () => {
    expect(slugify('CamelCase%%Content')).toBe('camelcase_content');
    expect(slugify('hi')).toBe('hi');
    expect(slugify(['hi', 'world'])).toBe('hi_world');
    expect(slugify(['hi', 0])).toBe('hi_0');
    expect(slugify(['hi', 'k'], { sep: '-' })).toBe('hi-k');
    expect(slugify(['hi', ['k']], { sep: '-' })).toBe('hi-k');
    expect(slugify('hi')).toBe('hi');
  });
});
