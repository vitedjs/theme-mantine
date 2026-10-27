import {
  Anchor,
  Container,
  Group,
  MantineProvider,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import '@mantine/core/styles.css';

export interface VitedPage {
  path: string;
  locale: string;
  title: string;
  frontmatter: Record<string, unknown>;
  component: ComponentType;
}

export interface VitedThemeProps {
  pages: VitedPage[];
  title?: string;
  description?: string;
  supportedLocales?: string[];
  baseURL?: string;
  menu?: VitedMenuEntry[] | null;
}

export interface VitedMenuEntry {
  divider?: boolean;
  text?: string;
  path?: string;
  file?: string;
  link?: string;
  flag?: 'experimental' | 'new' | 'deprecated';
  children?: VitedMenuEntry[];
}

export function findPage(
  pages: VitedPage[],
  pathname: string,
  locale?: string,
): VitedPage | undefined {
  return pages.find((page) => page.path === pathname && page.locale === locale) ??
    pages.find((page) => page.path === pathname) ??
    pages[0];
}

export function VitedTheme({
  pages,
  title = '',
  description = '',
  supportedLocales = [],
  baseURL = '/',
  menu,
}: VitedThemeProps): ReactElement {
  const [pathname, setPathname] = useState(readPathname);
  const [locale, setLocale] = useState(readLocale(supportedLocales, pages));
  const page = findPage(pages, removeBase(pathname, baseURL), locale);
  const Content = page?.component;
  const locales = supportedLocales.length > 0
    ? supportedLocales
    : [...new Set(pages.map((item) => item.locale))];
  const navigation = menu?.length
    ? <MenuItems entries={menu} baseURL={baseURL} locale={locale} />
    : <PageNavigation pages={pages.filter((item) => item.locale === locale)} baseURL={baseURL} activePath={page?.path} locale={locale} />;

  useEffect(() => {
    const updateLocation = () => {
      setPathname(readPathname());
      setLocale(readLocale(supportedLocales, pages));
    };
    window.addEventListener('popstate', updateLocation);
    return () => window.removeEventListener('popstate', updateLocation);
  }, [pages, supportedLocales]);

  function changeLocale(nextLocale: string) {
    setLocale(nextLocale);
    const query = new URLSearchParams(window.location.search);
    query.set('lang', nextLocale);
    window.history.pushState(null, '', `${window.location.pathname}?${query}${window.location.hash}`);
  }

  return (
    <MantineProvider>
      <Container size="xl" py="xl">
        <Group justify="space-between" align="flex-start" mb="xl">
          <div>
            <Title order={1}>{title || page?.title || 'Documentation'}</Title>
            {description ? <Text c="dimmed">{description}</Text> : null}
          </div>
          {locales.length > 1 ? (
            <select
              aria-label="Language"
              value={locale}
              onChange={(event) => changeLocale(event.currentTarget.value)}
            >
              {locales.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          ) : null}
        </Group>
        <Group align="flex-start" wrap="nowrap">
          <Stack component="nav" gap="xs" miw={220}>{navigation}</Stack>
          <main>
            {Content
              ? <Content />
              : <Text c="dimmed">No documents were found in the configured docs directory.</Text>}
          </main>
        </Group>
      </Container>
    </MantineProvider>
  );
}

export default VitedTheme;

interface PageNavigationNode {
  key: string;
  title: string;
  page?: VitedPage;
  children: PageNavigationNode[];
}

function PageNavigation({
  pages,
  baseURL,
  activePath,
  locale,
}: {
  pages: VitedPage[];
  baseURL: string;
  activePath?: string;
  locale: string;
}): ReactElement {
  const nodes: PageNavigationNode[] = [];

  for (const page of pages) {
    let level = nodes;
    const segments = page.path.split('/').filter(Boolean).map(decodeURIComponent);
    if (segments.length === 0) {
      level.push({ key: `${page.locale}:${page.path}`, title: page.title, page, children: [] });
      continue;
    }

    let route = '';
    for (const segment of segments) {
      route += `/${encodeURIComponent(segment)}`;
      let node = level.find((item) => item.key === route);
      if (!node) {
        node = { key: route, title: humanize(segment), children: [] };
        level.push(node);
      }
      level = node.children;
      if (route === page.path) {
        node.title = page.title;
        node.page = page;
      }
    }
  }

  return <>{renderPageNavigationNodes(nodes, baseURL, activePath, locale)}</>;
}

function renderPageNavigationNodes(
  nodes: PageNavigationNode[],
  baseURL: string,
  activePath: string | undefined,
  locale: string,
): ReactNode {
  return nodes.map((node) => (
        <div key={node.key}>
          {node.page ? (
            <Anchor
              href={makeHref(baseURL, node.page.path, locale)}
              fw={node.page.path === activePath ? 700 : 400}
            >
              {node.title}
            </Anchor>
          ) : <Text fw={600}>{node.title}</Text>}
          {node.children.length > 0
            ? <Stack gap="xs" pl="md">
                {renderPageNavigationNodes(node.children, baseURL, activePath, locale)}
              </Stack>
            : null}
        </div>
  ));
}

function MenuItems({
  entries,
  baseURL,
  locale,
}: {
  entries: VitedMenuEntry[];
  baseURL: string;
  locale: string;
}): ReactElement {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.divider) return <hr key={`divider-${index}`} />;
        const href = entry.path
          ? makeHref(baseURL, entry.path, locale)
          : entry.link ?? '#';
        return (
          <div key={`${href}:${index}`}>
            <Anchor href={href}>{entry.text ?? entry.file ?? entry.path ?? entry.link}</Anchor>
            {entry.children?.length
              ? <Stack gap="xs" pl="md"><MenuItems entries={entry.children} baseURL={baseURL} locale={locale} /></Stack>
              : null}
          </div>
        );
      })}
    </>
  );
}

function readPathname(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname;
}

function readLocale(locales: string[], pages: VitedPage[]): string {
  if (typeof window !== 'undefined') {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested && (locales.length === 0 || locales.includes(requested))) return requested;
  }
  return locales[0] ?? pages[0]?.locale ?? 'en';
}

function removeBase(pathname: string, baseURL: string): string {
  const base = `/${baseURL.split('/').filter(Boolean).join('/')}`;
  if (base === '/') return pathname;
  if (pathname === base) return '/';
  if (!pathname.startsWith(`${base}/`)) return pathname;
  return pathname.slice(base.length) || '/';
}

function makeHref(baseURL: string, route: string, locale: string): string {
  const base = `/${baseURL.split('/').filter(Boolean).join('/')}`;
  const prefix = base === '/' ? '' : base;
  return `${prefix}${route === '/' ? '/' : route}?lang=${encodeURIComponent(locale)}`;
}

function humanize(value: string): string {
  return decodeURIComponent(value).replace(/[-_]/g, ' ');
}
