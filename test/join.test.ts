import { describe, expect, test } from 'vitest';
import join from '../src/join.js';

describe('Join Tests', () => {
  test('should join given array elements with given separator', () => {
    expect(join(['a', 'b'], { sep: ',' })).toBe('a,b');
    expect(join(['a', ['b']], { sep: ',' })).toBe('a,b');
    expect(join(['a', ['b', 'c']], { sep: ',' })).toBe('a,b,c');
    expect(join(['a', ['b', null, 'c']], { sep: ',' })).toBe('a,b,c');
    expect(join(['a', '', 'b'], { sep: ',' })).toBe('a,,b');
    expect(join(['a', false, 'b'], { sep: ',' })).toBe('a,b');
    expect(join(['a {', { indent: ['hello'] }, '}'], { sep: '\n', indent: '  ' })).toBe('a {\n  hello\n}');
    expect(join(['a {', { indent: ['hello'] }, '}'])).toBe('a {\n\thello\n}');
    expect(join(['a {', { indent: ['hello {', { indent: ['world'] }, '}'] }, '}'])).toBe('a {\n\thello {\n\t\tworld\n\t}\n}');

    expect(join([undefined, undefined])).toBe('');
    expect(join([null, null])).toBe('');
    expect(join([false, false])).toBe('');
  });
});
