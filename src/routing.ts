export interface LocalizedRoute {
  pathname: string;
  locale: string;
}

export function resolveLocalizedRoute(
  pathname: string,
  locales: string[],
  baseURL = '/',
): LocalizedRoute {
  const base = normalizeBaseURL(baseURL);
  const sitePath = removeBase(pathname, base);
  const [localeSegment, ...segments] = sitePath.split('/').filter(Boolean);
  const locale = locales.find((item) => item.toLowerCase() === localeSegment?.toLowerCase());

  if (locale) {
    return {
      pathname: segments.length > 0 ? `/${segments.join('/')}` : '/',
      locale,
    };
  }

  return { pathname: sitePath, locale: locales[0] ?? 'en' };
}

export function makeLocalizedPath(
  baseURL: string,
  pathname: string,
  locale: string,
  locales: string[],
): string {
  const base = normalizeBaseURL(baseURL);
  const defaultLocale = locales[0] ?? 'en';
  const localePrefix =
    locale.toLowerCase() === defaultLocale.toLowerCase() ? '' : `/${encodeURIComponent(locale)}`;
  const route = pathname === '/' ? '' : `/${pathname.split('/').filter(Boolean).join('/')}`;
  const localizedPath = `${base === '/' ? '' : base}${localePrefix}${route}`;
  if (!route && localizedPath) return `${localizedPath}/`;
  return localizedPath || '/';
}

export function normalizeBaseURL(baseURL: string): string {
  const segments = baseURL.split('/').filter(Boolean);
  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

function removeBase(pathname: string, base: string): string {
  if (base === '/') return pathname || '/';
  if (pathname === base) return '/';
  if (!pathname.startsWith(`${base}/`)) return pathname || '/';
  return pathname.slice(base.length) || '/';
}
