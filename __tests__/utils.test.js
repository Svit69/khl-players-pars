import { foClass, ageSuffix, resolveFlagSrc } from '../public/js/utils.js';

describe('utils', () => {
  test('foClass ranges', () => {
    expect(foClass(10)).toBe('stats-digest__value--low');
    expect(foClass(25)).toBe('stats-digest__value--orange');
    expect(foClass(35)).toBe('stats-digest__value--yellow');
    expect(foClass(45)).toBe('stats-digest__value--mid');
    expect(foClass(55)).toBe('stats-digest__value--emerald');
    expect(foClass(65)).toBe('stats-digest__value--aqua');
    expect(foClass(90)).toBe('stats-digest__value--ultra');
  });

  test('ageSuffix cases', () => {
    expect(ageSuffix(1)).toBe('год');
    expect(ageSuffix(2)).toBe('года');
    expect(ageSuffix(5)).toBe('лет');
    expect(ageSuffix(21)).toBe('год');
    expect(ageSuffix(24)).toBe('года');
    expect(ageSuffix(12)).toBe('лет');
  });

  test('resolveFlagSrc defaults', () => {
    expect(resolveFlagSrc('Россия')).toContain('icon-russia');
    expect(resolveFlagSrc('USA')).toContain('icon-usa');
    expect(resolveFlagSrc(null)).toContain('default');
  });
});

