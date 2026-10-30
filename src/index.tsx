import {
  CodeHighlight,
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight';
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
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Spotlight, type SpotlightActionData } from '@mantine/spotlight';
import { GithubLogo, Heart, List, MagnifyingGlass, Moon, Sun, X } from '@phosphor-icons/react';
import parse, { Element as HtmlElement, type DOMNode } from 'html-react-parser';
import React, { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { Children, Fragment, isValidElement, useEffect, useMemo, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki';
import { Link, Route, Router, Switch, useLocation } from 'wouter';

import { themeI18n } from './i18n';
import { getProjectLinks } from './project-links';
import { makeLocalizedPath, normalizeBaseURL, resolveLocalizedRoute } from './routing';
import { createPageSearch, type SearchDocument } from './search';

import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/spotlight/styles.css';

const codeHighlightAdapter = createShikiAdapter(
  () =>
    createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'bash',
        'css',
        'diff',
        'html',
        'javascript',
        'json',
        'jsx',
        'markdown',
        'mdx',
        'shellscript',
        'typescript',
        'tsx',
        'yaml',
      ],
    }),
  {
    resolveLanguage: (language) => {
      const normalizedLanguage = language.toLowerCase();
      return normalizedLanguage in bundledLanguages
        ? bundledLanguages[normalizedLanguage as BundledLanguage]
        : undefined;
    },
  },
);

const emptyLocales: string[] = [];

interface MarkdownElementProps {
  children?: ReactNode;
  html?: string;
}

type MarkdownComponents = Record<string, ComponentType<MarkdownElementProps>>;

export interface VitedPage {
  path: string;
  locale: string;
  title: string;
  frontmatter: Record<string, unknown>;
  component: ComponentType<{ components?: MarkdownComponents }>;
}

export interface VitedThemeProps {
  pages: VitedPage[];
  title?: string;
  description?: string;
  supportedLocales?: string[];
  baseURL?: string;
  menu?: VitedMenuEntry[] | null;
  searchIndex?: SearchDocument[];
  packageJSON?: Record<string, unknown>;
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
  return (
    pages.find((page) => page.path === pathname && page.locale === locale) ??
    pages.find((page) => page.path === pathname) ??
    pages[0]
  );
}

function ThemeApp({
  pages,
  title = '',
  description = '',
  supportedLocales = emptyLocales,
  menu,
  searchIndex = [],
  packageJSON = {},
}: VitedThemeProps): ReactElement {
  const locales = useMemo(
    () =>
      supportedLocales.length > 0
        ? supportedLocales
        : [...new Set(pages.map((item) => item.locale))],
    [pages, supportedLocales],
  );
  const [pathname, navigate] = useLocation();
  const route = resolveLocalizedRoute(pathname, locales);
  const locale = route.locale;
  const { t, i18n } = useTranslation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const projectLinks = useMemo(() => getProjectLinks(packageJSON), [packageJSON]);
  const page =
    pages.find((item) => item.path === route.pathname && item.locale === locale) ??
    pages.find((item) => item.path === route.pathname);
  const localizedPages = getLocalizedPages(pages, locales);
  const navigationPages = useMemo(
    () => pages.filter((item) => item.locale === locale),
    [pages, locale],
  );
  // A single page needs no navigation, unless the site configures a menu of its own.
  const showNavigation = (menu?.length ?? 0) > 0 || navigationPages.length > 1;
  const markdownComponents = useMemo<MarkdownComponents>(
    () => ({ html: MarkdownHtml, pre: MarkdownCodeBlock }),
    [],
  );
  const searchPages = useMemo(
    () => searchIndex.filter((item) => item.locale.toLowerCase() === locale.toLowerCase()),
    [searchIndex, locale],
  );
  const search = useMemo(() => createPageSearch(searchPages), [searchPages]);
  const searchActions = useMemo<SpotlightActionData[]>(
    () =>
      searchPages.map((item) => ({
        id: `${item.locale}:${item.path}`,
        label: item.title,
        description: item.content.slice(0, 140),
        keywords: item.content,
        onClick: () => {
          navigate(makeLocalizedPath('/', item.path, locale, locales));
          setMobileOpened(false);
        },
      })),
    [searchPages, navigate, locale, locales],
  );
  const searchActionsById = useMemo(
    () => new Map(searchActions.map((action) => [action.id, action])),
    [searchActions],
  );
  const navigation = menu?.length ? (
    <MenuItems
      entries={menu}
      locales={locales}
      locale={locale}
      activePath={page?.path}
      onNavigate={() => setMobileOpened(false)}
    />
  ) : (
    <PageNavigation
      pages={navigationPages}
      locales={locales}
      activePath={page?.path}
      locale={locale}
      onNavigate={() => setMobileOpened(false)}
    />
  );

  useEffect(() => {
    globalThis.document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  function changeLocale(nextLocale: string | null) {
    if (!nextLocale) return;
    const localizedPath = makeLocalizedPath('/', route.pathname, nextLocale, locales);
    const url = new globalThis.URL(globalThis.location.href);
    url.searchParams.delete('lang');
    navigate(`${localizedPath}${url.search}${url.hash}`);
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={
        showNavigation
          ? { width: 280, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }
          : undefined
      }
      padding='md'
    >
      <AppShell.Header>
        <Group h='100%' px='md' justify='space-between' wrap='nowrap'>
          <Group gap='sm' wrap='nowrap'>
            {showNavigation ? (
              <ActionIcon
                variant='subtle'
                size='lg'
                hiddenFrom='sm'
                aria-label={mobileOpened ? t('closeNavigation') : t('openNavigation')}
                onClick={() => setMobileOpened((opened) => !opened)}
              >
                {mobileOpened ? <X size={20} /> : <List size={20} />}
              </ActionIcon>
            ) : undefined}
            <Stack gap={0}>
              <Text fw={700} lineClamp={1}>
                {title || 'Documentation'}
              </Text>
              {description ? (
                <Text c='dimmed' size='xs' lineClamp={1} visibleFrom='sm'>
                  {description}
                </Text>
              ) : undefined}
            </Stack>
          </Group>
          <Group gap='xs' wrap='nowrap'>
            {searchIndex.length > 0 ? (
              <Button
                variant='default'
                size='sm'
                leftSection={<MagnifyingGlass size={16} />}
                rightSection={<Kbd size='xs'>{getSearchShortcut()}</Kbd>}
                justify='space-between'
                w={{ base: 180, sm: 250 }}
                c='dimmed'
                fw={400}
                aria-label={`${t('search')} ${getSearchShortcut()}`}
                onClick={() => Spotlight.open()}
              >
                <Text size='sm'>{t('search')}</Text>
              </Button>
            ) : undefined}
            {projectLinks.github ? (
              <Tooltip label={t('github')} withArrow>
                <ActionIcon
                  component='a'
                  href={projectLinks.github}
                  target='_blank'
                  rel='noreferrer'
                  variant='default'
                  size='lg'
                  aria-label={t('github')}
                >
                  <GithubLogo size={20} />
                </ActionIcon>
              </Tooltip>
            ) : undefined}
            {projectLinks.funding ? (
              <Tooltip label={t('donate')} withArrow>
                <ActionIcon
                  component='a'
                  href={projectLinks.funding}
                  target='_blank'
                  rel='noreferrer'
                  variant='default'
                  size='lg'
                  aria-label={t('donate')}
                >
                  <Heart size={20} color='red' />
                </ActionIcon>
              </Tooltip>
            ) : undefined}
            {locales.length > 1 ? (
              <Select
                aria-label={t('language')}
                data={locales.map((item) => ({
                  value: item,
                  label: new Intl.DisplayNames([item], { type: 'language' }).of(item) ?? item,
                }))}
                value={locale}
                onChange={changeLocale}
                allowDeselect={false}
                w={120}
                size='sm'
              />
            ) : undefined}
            <ActionIcon
              variant='default'
              size='lg'
              aria-label={colorScheme === 'dark' ? t('switchToLight') : t('switchToDark')}
              onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            >
              {colorScheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      {showNavigation ? (
        <AppShell.Navbar p='md'>
          <AppShell.Section mb='sm'>
            <Text size='sm' fw={600} c='dimmed'>
              {t('navigation')}
            </Text>
          </AppShell.Section>
          <AppShell.Section grow component={ScrollArea}>
            <Stack component='nav' gap={4} aria-label={t('navigation')}>
              {navigation}
            </Stack>
          </AppShell.Section>
        </AppShell.Navbar>
      ) : undefined}
      <AppShell.Main>
        <Container size='lg' py='md'>
          <Switch location={pathname}>
            {localizedPages.map(({ pathname: localizedPath, page: localizedPage }) => {
              const Content = localizedPage.component;
              return (
                <Route key={`${localizedPath}:${localizedPage.locale}`} path={localizedPath}>
                  <Content components={markdownComponents} />
                </Route>
              );
            })}
            <Route>
              <Text c='dimmed'>{t('noDocuments')}</Text>
            </Route>
          </Switch>
        </Container>
      </AppShell.Main>
      {searchIndex.length > 0 ? (
        <Spotlight
          actions={searchActions}
          filter={(query) =>
            search(query).flatMap((item) => {
              const action = searchActionsById.get(`${item.locale}:${item.path}`);
              return action ? [action] : [];
            })
          }
          nothingFound={t('noSearchResults')}
          searchProps={{ placeholder: t('searchPlaceholder') }}
          shortcut='mod + K'
          highlightQuery
          limit={8}
        />
      ) : undefined}
    </AppShell>
  );
}

export function VitedTheme(props: VitedThemeProps): ReactElement {
  const normalizedBaseURL = normalizeBaseURL(props.baseURL ?? '/');
  return (
    <MantineProvider defaultColorScheme='auto'>
      <CodeHighlightAdapterProvider adapter={codeHighlightAdapter}>
        <I18nextProvider i18n={themeI18n}>
          <Router base={normalizedBaseURL === '/' ? '' : normalizedBaseURL}>
            <ThemeApp {...props} />
          </Router>
        </I18nextProvider>
      </CodeHighlightAdapterProvider>
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
    const segments = page.path
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
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

function renderPageNavigationNodes(nodes: PageNavigationNode[], props: NavigationProps): ReactNode {
  return nodes.map((node) => {
    const navLink = (
      <NavLink
        label={node.title}
        active={node.page?.path === props.activePath}
        defaultOpened={node.children.some(
          (child) =>
            child.page?.path === props.activePath || props.activePath?.startsWith(`${child.key}/`),
        )}
        component={node.page ? 'a' : 'button'}
      >
        {node.children.length > 0 ? renderPageNavigationNodes(node.children, props) : undefined}
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
        if (entry.divider) return <Divider key={`divider-${index}`} my='xs' />;
        const href = entry.path
          ? makeLocalizedPath('/', entry.path, locale, locales)
          : (entry.link ?? '#');
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
            {entry.children?.length ? (
              <MenuItems
                entries={entry.children}
                locales={locales}
                locale={locale}
                activePath={activePath}
                onNavigate={onNavigate}
              />
            ) : undefined}
          </NavLink>
        );
        return entry.path ? (
          <Link key={`${href}:${index}`} to={href} asChild onClick={onNavigate}>
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
      const page =
        pages.find((item) => item.path === pagePath && item.locale === locale) ??
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
  return globalThis.navigator !== undefined &&
    /Mac|iPhone|iPad|iPod/.test(globalThis.navigator.platform)
    ? '⌘ K'
    : 'Ctrl + K';
}

function humanize(value: string): string {
  return decodeURIComponent(value).replaceAll(/[-_]/g, ' ');
}

function MarkdownHtml({ html = '' }: MarkdownElementProps): ReactElement {
  return <>{parse(html, { replace: replaceMarkdownHtmlNode })}</>;
}

function replaceMarkdownHtmlNode(node: DOMNode) {
  if (!(node instanceof HtmlElement) || node.name !== 'pre') return;
  const codeNode = node.children.find(
    (child): child is HtmlElement => child instanceof HtmlElement && child.name === 'code',
  );
  if (!codeNode) return;
  const code = codeNode.children.map(getHtmlText).join('');
  return (
    <MarkdownCodeBlock>
      <code className={codeNode.attribs.class}>{code}</code>
    </MarkdownCodeBlock>
  );
}

function MarkdownCodeBlock({ children }: MarkdownElementProps): ReactElement {
  const { t } = useTranslation();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const codeElement = Children.toArray(children).find(
    (child): child is ReactElement<{ className?: string; children?: ReactNode }> =>
      isValidElement(child) && child.type === 'code',
  );
  if (!codeElement) return <pre>{children}</pre>;

  const language = codeElement.props.className?.match(/(?:^|\s)language-([\w+#.-]+)/)?.[1];
  return (
    <CodeHighlight
      code={getReactText(codeElement.props.children)}
      language={language}
      codeColorScheme={colorScheme === 'dark' ? 'github-dark' : 'github-light'}
      withBorder
      radius='sm'
      copyLabel={t('copy')}
      copiedLabel={t('copied')}
    />
  );
}

function getHtmlText(node: DOMNode): string {
  if (node.type === 'text') return node.data;
  if (node instanceof HtmlElement) return node.children.map(getHtmlText).join('');
  return '';
}

function getReactText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => getReactText(child)).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return getReactText(node.props.children);
  return '';
}
