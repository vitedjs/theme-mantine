import { describe, expect, it } from 'vitest';
import { makeLocalizedPath, resolveLocalizedRoute } from './routing';

describe('localized routes', () => {
  const locales = ['en', 'zh'];

  it('uses the default locale without a prefix and prefixes other locales', () => {
    expect(makeLocalizedPath('/', '/', 'en', locales)).toBe('/');
    expect(makeLocalizedPath('/', '/', 'zh', locales)).toBe('/zh/');
    expect(makeLocalizedPath('/', '/guide/start', 'zh', locales)).toBe('/zh/guide/start');
  });

  it('resolves a locale prefix into the document route', () => {
    expect(resolveLocalizedRoute('/zh/guide/start', locales)).toEqual({
      pathname: '/guide/start',
      locale: 'zh',
    });
    expect(resolveLocalizedRoute('/guide/start', locales)).toEqual({
      pathname: '/guide/start',
      locale: 'en',
    });
  });

  it('places locale prefixes after the configured base URL', () => {
    expect(makeLocalizedPath('/docs/', '/guide', 'zh', locales)).toBe('/docs/zh/guide');
    expect(resolveLocalizedRoute('/docs/zh/guide', locales, '/docs')).toEqual({
      pathname: '/guide',
      locale: 'zh',
    });
  });
});
