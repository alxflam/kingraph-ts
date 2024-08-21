import { describe, expect, test } from 'vitest';
import render from '../src/render.js';

describe('Should Render', () => {
  test('Should render DOT', async () => {
    const result = await render({ families: [], people: {}, styles: {} }, { format: 'dot', theme: 'dark', drawDirection: 'LR' });
    expect(result).toMatch(new RegExp('digraph G {.*}$', 's'));
  });

  test('Should render SVG', async () => {
    const result = await render({ families: [], people: {}, styles: {} }, { format: 'svg', theme: 'dark', drawDirection: 'LR' });
    expect(result).toMatch(new RegExp('^<svg.*</svg>$', 's'));
  });
});
