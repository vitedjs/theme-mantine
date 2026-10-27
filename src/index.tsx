import {
  ActionIcon,
  AppShell,
  Burger,
  Container,
  Divider,
  Group,
  MantineProvider,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
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

function ThemeApp({
  pages,
  title = '',
  description = '',
  supportedLocales = [],
  baseURL = '/',
  menu,
}: VitedThemeProps): ReactElement {
  const [pathname, setPathname] = useState(readPathname);
  const [locale, setLocale] = useState(readLocale(supportedLocales, pages));
  const [mobileOpened, setMobileOpened] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const copy = getCopy(locale);
  const page = findPage(pages, removeBase(pathname, baseURL), locale);
  const Content = page?.component;
  const locales = supportedLocales.length > 0
    ? supportedLocales
    : [...new Set(pages.map((item) => item.locale))];
  const navigation = menu?.length
    ? (
      <MenuItems
        entries={menu}
        baseURL={baseURL}
        locale={locale}
        activePath={page?.path}
        onNavigate={() => setMobileOpened(false)}
      />
    )
    : (
      <PageNavigation
        pages={pages.filter((item) => item.locale === locale)}
        baseURL={baseURL}
        activePath={page?.path}
        locale={locale}
        onNavigate={() => setMobileOpened(false)}
      />
    );

  useEffect(() => {
    const updateLocation = () => {
      setPathname(readPathname());
      setLocale(readLocale(supportedLocales, pages));
    };
    window.addEventListener('popstate', updateLocation);
    return () => window.removeEventListener('popstate', updateLocation);
  }, [pages, supportedLocales]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function changeLocale(nextLocale: string | null) {
    if (!nextLocale) return;
    setLocale(nextLocale);
    const query = new URLSearchParams(window.location.search);
    query.set('lang', nextLocale);
    window.history.pushState(null, '', `${window.location.pathname}?${query}${window.location.hash}`);
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={() => setMobileOpened((opened) => !opened)}
              hiddenFrom="sm"
              size="sm"
              aria-label={mobileOpened ? copy.closeNavigation : copy.openNavigation}
            />
            <Stack gap={0}>
              <Text fw={700} lineClamp={1}>{title || 'Documentation'}</Text>
              {description ? (
                <Text c="dimmed" size="xs" lineClamp={1} visibleFrom="sm">{description}</Text>
              ) : null}
            </Stack>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {locales.length > 1 ? (
              <Select
                aria-label={copy.language}
                data={locales.map((item) => ({ value: item, label: getLocaleName(item) }))}
                value={locale}
                onChange={changeLocale}
                allowDeselect={false}
                w={120}
                size="sm"
              />
            ) : null}
            <ActionIcon
              variant="default"
              size="lg"
              aria-label={colorScheme === 'dark' ? copy.switchToLight : copy.switchToDark}
              onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            >
              <span aria-hidden="true">{colorScheme === 'dark' ? '☀' : '☾'}</span>
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section mb="sm">
          <Text size="sm" fw={600} c="dimmed">{copy.navigation}</Text>
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea}>
          <Stack component="nav" gap={4} aria-label={copy.navigation}>
            {navigation}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="lg" py="md">
          {Content
            ? <Content />
            : <Text c="dimmed">{copy.noDocuments}</Text>}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export function VitedTheme(props: VitedThemeProps): ReactElement {
  return (
    <MantineProvider defaultColorScheme="auto">
      <ThemeApp {...props} />
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

interface NavigationProps {
  baseURL: string;
  locale: string;
  activePath?: string;
  onNavigate: () => void;
}

function PageNavigation({
  pages,
  baseURL,
  activePath,
  locale,
  onNavigate,
}: NavigationProps & { pages: VitedPage[] }): ReactElement {
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

  return <>{renderPageNavigationNodes(nodes, { baseURL, locale, activePath, onNavigate })}</>;
}

function renderPageNavigationNodes(
  nodes: PageNavigationNode[],
  props: NavigationProps,
): ReactNode {
  return nodes.map((node) => (
    <NavLink
      key={node.key}
      label={node.title}
      href={node.page ? makeHref(props.baseURL, node.page.path, props.locale) : undefined}
      active={node.page?.path === props.activePath}
      defaultOpened={node.children.some((child) =>
        child.page?.path === props.activePath || props.activePath?.startsWith(`${child.key}/`)
      )}
      onClick={node.page ? props.onNavigate : undefined}
    >
      {node.children.length > 0
        ? renderPageNavigationNodes(node.children, props)
        : null}
    </NavLink>
  ));
}

function MenuItems({
  entries,
  baseURL,
  locale,
  activePath,
  onNavigate,
}: NavigationProps & { entries: VitedMenuEntry[] }): ReactElement {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.divider) return <Divider key={`divider-${index}`} my="xs" />;
        const href = entry.path
          ? makeHref(baseURL, entry.path, locale)
          : entry.link ?? '#';
        const label = entry.text ?? entry.file ?? entry.path ?? entry.link ?? '';
        return (
          <NavLink
            key={`${href}:${index}`}
            label={label}
            href={href}
            active={entry.path === activePath}
            defaultOpened={Boolean(entry.children?.length)}
            onClick={onNavigate}
          >
            {entry.children?.length
              ? <MenuItems
                  entries={entry.children}
                  baseURL={baseURL}
                  locale={locale}
                  activePath={activePath}
                  onNavigate={onNavigate}
                />
              : null}
          </NavLink>
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
    const match = requested && locales.find((locale) => locale.toLowerCase() === requested.toLowerCase());
    if (match) return match;
  }
  return locales[0] ?? pages[0]?.locale ?? 'en';
}

function getLocaleName(locale: string): string {
  if (locale.toLowerCase().startsWith('zh')) return '简体中文';
  if (locale.toLowerCase().startsWith('en')) return 'English';
  return locale;
}

function getCopy(locale: string): {
  language: string;
  navigation: string;
  noDocuments: string;
  openNavigation: string;
  closeNavigation: string;
  switchToLight: string;
  switchToDark: string;
} {
  if (locale.toLowerCase().startsWith('zh')) {
    return {
      language: '语言',
      navigation: '导航',
      noDocuments: '在配置的文档目录中没有找到文档。',
      openNavigation: '打开导航',
      closeNavigation: '关闭导航',
      switchToLight: '切换到浅色模式',
      switchToDark: '切换到深色模式',
    };
  }
  return {
    language: 'Language',
    navigation: 'Navigation',
    noDocuments: 'No documents were found in the configured docs directory.',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  };
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
