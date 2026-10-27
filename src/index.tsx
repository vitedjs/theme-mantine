import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  Divider,
  Group,
  Kbd,
  MantineProvider,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Spotlight, type SpotlightActionData } from '@mantine/spotlight';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { List, MagnifyingGlass, Moon, Sun, X } from '@phosphor-icons/react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, Route, Router, Switch, useLocation } from 'wouter';
import { makeLocalizedPath, normalizeBaseURL, resolveLocalizedRoute } from './routing';
import { createPageSearch, type SearchDocument } from './search';
import { themeI18n } from './i18n';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';

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
  searchIndex?: SearchDocument[];
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
  searchIndex = [],
}: VitedThemeProps): ReactElement {
  const locales = supportedLocales.length > 0
    ? supportedLocales
    : [...new Set(pages.map((item) => item.locale))];
  const [pathname, navigate] = useLocation();
  const route = resolveLocalizedRoute(pathname, locales);
  const locale = route.locale;
  const { t, i18n } = useTranslation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const page = pages.find((item) => item.path === route.pathname && item.locale === locale) ??
    pages.find((item) => item.path === route.pathname);
  const localizedPages = getLocalizedPages(pages, locales);
  const searchPages = useMemo(
    () => searchIndex.filter((item) => item.locale.toLowerCase() === locale.toLowerCase()),
    [searchIndex, locale],
  );
  const search = useMemo(() => createPageSearch(searchPages), [searchPages]);
  const searchActions = useMemo<SpotlightActionData[]>(() => searchPages.map((item) => ({
    id: `${item.locale}:${item.path}`,
    label: item.title,
    description: item.content.slice(0, 140),
    keywords: item.content,
    onClick: () => {
      navigate(makeLocalizedPath('/', item.path, locale, locales));
      setMobileOpened(false);
    },
  })), [searchPages, navigate, locale, locales]);
  const searchActionsById = useMemo(
    () => new Map(searchActions.map((action) => [action.id, action])),
    [searchActions],
  );
  const navigation = menu?.length
    ? (
      <MenuItems
        entries={menu}
        locales={locales}
        locale={locale}
        activePath={page?.path}
        onNavigate={() => setMobileOpened(false)}
      />
    )
    : (
      <PageNavigation
        pages={pages.filter((item) => item.locale === locale)}
        locales={locales}
        activePath={page?.path}
        locale={locale}
        onNavigate={() => setMobileOpened(false)}
      />
    );

  useEffect(() => {
    document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  function changeLocale(nextLocale: string | null) {
    if (!nextLocale) return;
    const localizedPath = makeLocalizedPath('/', route.pathname, nextLocale, locales);
    const url = new URL(window.location.href);
    url.searchParams.delete('lang');
    navigate(`${localizedPath}${url.search}${url.hash}`);
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
            <ActionIcon
              variant="subtle"
              size="lg"
              hiddenFrom="sm"
              aria-label={mobileOpened ? t('closeNavigation') : t('openNavigation')}
              onClick={() => setMobileOpened((opened) => !opened)}
            >
              {mobileOpened ? <X size={20} /> : <List size={20} />}
            </ActionIcon>
            <Stack gap={0}>
              <Text fw={700} lineClamp={1}>{title || 'Documentation'}</Text>
              {description ? (
                <Text c="dimmed" size="xs" lineClamp={1} visibleFrom="sm">{description}</Text>
              ) : null}
            </Stack>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {searchIndex.length > 0 ? (
              <Button
                variant="default"
                size="sm"
                leftSection={<MagnifyingGlass size={16} />}
                rightSection={<Kbd size="xs">{getSearchShortcut()}</Kbd>}
                justify="space-between"
                w={{ base: 180, sm: 250 }}
                c="dimmed"
                fw={400}
                aria-label={`${t('search')} ${getSearchShortcut()}`}
                onClick={() => Spotlight.open()}
              >
                <Text size="sm">{t('search')}</Text>
              </Button>
            ) : null}
            {locales.length > 1 ? (
              <Select
                aria-label={t('language')}
                data={locales.map((item) => ({
                  value: item,
                  label: t(`locales.${item}`, { defaultValue: item }),
                }))}
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
              aria-label={colorScheme === 'dark' ? t('switchToLight') : t('switchToDark')}
              onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            >
              {colorScheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section mb="sm">
          <Text size="sm" fw={600} c="dimmed">{t('navigation')}</Text>
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea}>
          <Stack component="nav" gap={4} aria-label={t('navigation')}>
            {navigation}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="lg" py="md">
          <Switch location={pathname}>
            {localizedPages.map(({ pathname: localizedPath, page: localizedPage }) => {
              const Content = localizedPage.component;
              return (
                <Route key={`${localizedPath}:${localizedPage.locale}`} path={localizedPath}>
                  <Content />
                </Route>
              );
            })}
            <Route>
              <Text c="dimmed">{t('noDocuments')}</Text>
            </Route>
          </Switch>
        </Container>
      </AppShell.Main>
      {searchIndex.length > 0 ? (
        <Spotlight
          actions={searchActions}
          filter={(query) => search(query).flatMap((item) => {
            const action = searchActionsById.get(`${item.locale}:${item.path}`);
            return action ? [action] : [];
          })}
          nothingFound={t('noSearchResults')}
          searchProps={{ placeholder: t('searchPlaceholder') }}
          shortcut="mod + K"
          highlightQuery
          limit={8}
        />
      ) : null}
    </AppShell>
  );
}

export function VitedTheme(props: VitedThemeProps): ReactElement {
  const normalizedBaseURL = normalizeBaseURL(props.baseURL ?? '/');
  return (
    <MantineProvider defaultColorScheme="auto">
      <I18nextProvider i18n={themeI18n}>
        <Router base={normalizedBaseURL === '/' ? '' : normalizedBaseURL}>
          <ThemeApp {...props} />
        </Router>
      </I18nextProvider>
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
  locales: string[];
  locale: string;
  activePath?: string;
  onNavigate: () => void;
}

function PageNavigation({
  pages,
  locales,
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

  return <>{renderPageNavigationNodes(nodes, { locales, locale, activePath, onNavigate })}</>;
}

function renderPageNavigationNodes(
  nodes: PageNavigationNode[],
  props: NavigationProps,
): ReactNode {
  return nodes.map((node) => {
    const navLink = (
      <NavLink
        label={node.title}
        active={node.page?.path === props.activePath}
        defaultOpened={node.children.some((child) =>
          child.page?.path === props.activePath || props.activePath?.startsWith(`${child.key}/`)
        )}
        component={node.page ? 'a' : 'button'}
      >
        {node.children.length > 0 ? renderPageNavigationNodes(node.children, props) : null}
      </NavLink>
    );

    return node.page ? (
      <Link
        key={node.key}
        to={makeLocalizedPath('/', node.page.path, props.locale, props.locales)}
        asChild
        onClick={props.onNavigate}
      >
        {navLink}
      </Link>
    ) : (
      <Fragment key={node.key}>{navLink}</Fragment>
    );
  });
}

function MenuItems({
  entries,
  locales,
  locale,
  activePath,
  onNavigate,
}: NavigationProps & { entries: VitedMenuEntry[] }): ReactElement {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.divider) return <Divider key={`divider-${index}`} my="xs" />;
        const href = entry.path
          ? makeLocalizedPath('/', entry.path, locale, locales)
          : entry.link ?? '#';
        const label = entry.text ?? entry.file ?? entry.path ?? entry.link ?? '';
        const navLink = (
          <NavLink
            label={label}
            href={entry.path ? undefined : href}
            active={entry.path === activePath}
            defaultOpened={Boolean(entry.children?.length)}
            component={entry.path || entry.link ? 'a' : 'button'}
            onClick={entry.path ? undefined : onNavigate}
          >
            {entry.children?.length
              ? <MenuItems
                  entries={entry.children}
                  locales={locales}
                  locale={locale}
                  activePath={activePath}
                  onNavigate={onNavigate}
                />
              : null}
          </NavLink>
        );
        return entry.path ? (
          <Link
            key={`${href}:${index}`}
            to={href}
            asChild
            onClick={onNavigate}
          >
            {navLink}
          </Link>
        ) : (
          <Fragment key={`${href}:${index}`}>{navLink}</Fragment>
        );
      })}
    </>
  );
}

function getLocalizedPages(
  pages: VitedPage[],
  locales: string[],
): Array<{ pathname: string; page: VitedPage }> {
  const pagePaths = [...new Set(pages.map((page) => page.path))];
  const routes: Array<{ pathname: string; page: VitedPage }> = [];
  const seen = new Set<string>();

  for (const locale of locales) {
    for (const pagePath of pagePaths) {
      const page = pages.find((item) => item.path === pagePath && item.locale === locale) ??
        pages.find((item) => item.path === pagePath);
      if (!page) continue;

      const pathname = makeLocalizedPath('/', pagePath, locale, locales);
      if (seen.has(pathname)) continue;
      seen.add(pathname);
      routes.push({ pathname, page });
    }
  }

  return routes;
}

function getSearchShortcut(): string {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    ? '⌘ K'
    : 'Ctrl + K';
}

function humanize(value: string): string {
  return decodeURIComponent(value).replace(/[-_]/g, ' ');
}
