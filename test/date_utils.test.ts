import { describe, expect, test } from 'vitest';
import { formatDate, getAge } from '../src/date_utils.js';

describe('Date Util Tests', () => {
  test('formatDate for Year', () => {
    const formattedDate = formatDate(2000);
    expect(formattedDate).toBe('2000');
  });

  test('formatDate for Date', () => {
    const formattedDate = formatDate('21.06.2000');
    expect(formattedDate).toBe('21.06.2000');
  });

  test('getAge for Years', () => {
    const age = getAge(1902, 1995);
    expect(age).toBe(93);
  });

  test('getAge for Date', () => {
    const age = getAge('30.06.1902', '29.06.1995');
    expect(age).toBe(92);
  });
});
