import { describe, expect, test } from 'vitest';
import applyStyle from '../src/apply_style.js';

describe('Apply Style Tests', () => {
  test('should apply given styles ', () => {
    let out;

    const data = {
      styles: {
        hello: { color: 'gold', dir: 'none' },
        world: { style: 'filled', color: 'blue' }
      }
    };

    // single class
    out = applyStyle(data, ['hello']);
    expect(out).toStrictEqual(['color="gold"', 'dir="none"']);

    // single class
    out = applyStyle(data, ['world']);
    expect(out).toStrictEqual(['style="filled"', 'color="blue"']);

    // multiple classes
    out = applyStyle(data, ['hello', 'world']);
    expect(out).toStrictEqual(['color="blue"', 'dir="none"', 'style="filled"']);

    // multiple classes, reordered
    out = applyStyle(data, ['world', 'hello']);
    expect(out).toStrictEqual(['color="blue"', 'dir="none"', 'style="filled"']);

    // before
    out = applyStyle(data, ['hello'], { before: { color: 'red' } });
    expect(out).toStrictEqual(['color="gold"', 'dir="none"']);

    // after
    out = applyStyle(data, ['hello'], { after: { color: 'red' } });
    expect(out).toStrictEqual(['color="red"', 'dir="none"']);
  });
});
