import { describe, test, expect, beforeAll } from 'vitest';

let isValidYear, daysInMonth, clampDay;

beforeAll(async () => {
  // Set up DOM elements required by main.js init()
  document.body.innerHTML = `
    <div id="stars"></div>
    <div id="loader"></div>
    <div id="main"></div>
  `;
  const mod = await import('../main.js');
  isValidYear = mod.isValidYear;
  daysInMonth = mod.daysInMonth;
  clampDay = mod.clampDay;
});

describe('isValidYear', () => {
  test('returns true for valid year strings', () => {
    expect(isValidYear('1')).toBe(true);
    expect(isValidYear('2025')).toBe(true);
    expect(isValidYear('9999')).toBe(true);
  });

  test('returns false for out-of-range integers', () => {
    expect(isValidYear('0')).toBe(false);
    expect(isValidYear('-1')).toBe(false);
    expect(isValidYear('10000')).toBe(false);
  });

  test('returns false for non-integer strings', () => {
    expect(isValidYear('3.14')).toBe(false);
    expect(isValidYear('abc')).toBe(false);
    expect(isValidYear('')).toBe(false);
    expect(isValidYear(' 2025')).toBe(false);
    expect(isValidYear('2025 ')).toBe(false);
  });

  test('returns false for non-string inputs', () => {
    expect(isValidYear(2025)).toBe(false);
    expect(isValidYear(null)).toBe(false);
    expect(isValidYear(undefined)).toBe(false);
  });
});

describe('daysInMonth', () => {
  test('returns correct days for standard months', () => {
    expect(daysInMonth(2025, 0)).toBe(31);  // January
    expect(daysInMonth(2025, 1)).toBe(28);  // February (non-leap)
    expect(daysInMonth(2025, 3)).toBe(30);  // April
    expect(daysInMonth(2025, 11)).toBe(31); // December
  });

  test('handles leap years correctly', () => {
    expect(daysInMonth(2024, 1)).toBe(29);  // 2024 is a leap year
    expect(daysInMonth(2000, 1)).toBe(29);  // century divisible by 400
    expect(daysInMonth(1900, 1)).toBe(28);  // century not divisible by 400
  });
});

describe('clampDay', () => {
  test('returns day unchanged when within range', () => {
    expect(clampDay(2025, 0, 15)).toBe(15);
    expect(clampDay(2025, 0, 31)).toBe(31);
  });

  test('clamps day to max when it exceeds month days', () => {
    expect(clampDay(2025, 1, 31)).toBe(28);  // Feb non-leap
    expect(clampDay(2024, 1, 31)).toBe(29);  // Feb leap
    expect(clampDay(2025, 3, 31)).toBe(30);  // April has 30 days
  });
});
