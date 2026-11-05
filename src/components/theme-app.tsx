import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  Drawer,
  Group,
  Image,
  Kbd,
  ScrollArea,
  Select,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Spotlight, type SpotlightActionData } from '@mantine/spotlight';
import {
  GithubLogo,
  Heart,
  List,
  ListBullets,
  MagnifyingGlass,
  Moon,
  Sun,
  X,
} from '@phosphor-icons/react';
import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

import { getProjectLinks } from '../project-links';
import { createPageSearch } from '../search';
import { collectTocHeadings, useActiveHeading } from '../toc';
import type { MarkdownComponents, VitedThemeProps } from '../types';
import { MarkdownCodeBlock } from './markdown-code-block';
import { MarkdownHtml } from './markdown-html';
import { MenuItems } from './menu-items';
import { PageNavigation } from './page-navigation';
import { TocTree } from './toc-tree';

const emptyLocales: string[] = [];

export function ThemeApp({
  pages,
  routes,
  routeIndex,
  title = '',
  description = '',
  favicon = '',
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
  const route = routes[routeIndex[pathname] ?? -1];
  const locale = route?.locale ?? locales[0] ?? 'en';
  const Content = route ? pages[route.page].component : undefined;
  const { t, i18n } = useTranslation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const [tocOpened, setTocOpened] = useState(false);
  const [tocHeadings, setTocHeadings] = useState<ReturnType<typeof collectTocHeadings>>([]);
  const activeHeadingId = useActiveHeading(tocHeadings);
  const attachContent = useCallback((element: HTMLDivElement | null) => {
    setTocHeadings(element ? collectTocHeadings(element) : []);
    if (element) setTocOpened(false);
  }, []);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const projectLinks = useMemo(() => getProjectLinks(packageJSON), [packageJSON]);
  const navigationPages = useMemo(
    () => pages.filter((item) => item.locale === locale),
    [pages, locale],
  );
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
        id: `${item.locale}:${item.pathname}`,
        label: item.title,
        description: item.content.slice(0, 140),
        keywords: item.content,
        onClick: () => {
          navigate(item.pathname);
          setMobileOpened(false);
        },
      })),
    [searchPages, navigate],
  );
  const searchActionsById = useMemo(
    () => new Map(searchActions.map((action) => [action.id, action])),
    [searchActions],
  );
  const navigation = menu?.length ? (
    <MenuItems
      entries={menu}
      locale={locale}
      activePath={route?.path}
      onNavigate={() => setMobileOpened(false)}
    />
  ) : (
    <PageNavigation
      pages={navigationPages}
      activePath={route?.path}
      onNavigate={() => setMobileOpened(false)}
    />
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  function changeLocale(nextLocale: string | null) {
    if (!nextLocale) return;
    const nextRoute =
      routes.find((item) => item.path === route?.path && item.locale === nextLocale) ??
      routes.find((item) => item.locale === nextLocale);
    if (!nextRoute) return;
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    navigate(`${nextRoute.pathname}${url.search}${url.hash}`);
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={
        showNavigation
          ? { width: 280, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }
          : undefined
      }
      aside={{ width: 280, breakpoint: 'lg', collapsed: { mobile: true } }}
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
            {favicon ? <Image src={favicon} alt='' w={24} h={24} fit='contain' /> : undefined}
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
      <AppShell.Aside
        p='md'
        style={{ overflowY: 'auto' }}
        aria-hidden={tocHeadings.length > 0 ? undefined : true}
      >
        {tocHeadings.length > 0 ? (
          <>
            <Text size='sm' fw={600} c='dimmed' mb='sm'>
              {t('tableOfContents')}
            </Text>
            <TocTree
              headings={tocHeadings}
              activeId={activeHeadingId}
              ariaLabel={t('tableOfContents')}
            />
          </>
        ) : undefined}
      </AppShell.Aside>
      <AppShell.Main>
        <Container size='lg' py='md'>
          {Content ? (
            <div className='vited-mantine-content' key={pathname} ref={attachContent}>
              <Content components={markdownComponents} />
            </div>
          ) : (
            <Text c='dimmed'>{t('noDocuments')}</Text>
          )}
        </Container>
      </AppShell.Main>
      {tocHeadings.length > 0 ? (
        <>
          <ActionIcon
            className='vited-mantine-toc-toggle'
            hiddenFrom='lg'
            size={48}
            radius='xl'
            style={{ position: 'fixed', right: '1rem', bottom: '1rem' }}
            aria-label={tocOpened ? t('closeTableOfContents') : t('openTableOfContents')}
            aria-expanded={tocOpened}
            onClick={() => setTocOpened((opened) => !opened)}
          >
            {tocOpened ? <X size={22} /> : <ListBullets size={22} />}
          </ActionIcon>
          <Drawer
            opened={tocOpened}
            onClose={() => setTocOpened(false)}
            position='right'
            size={300}
            title={t('tableOfContents')}
            transitionProps={{ duration: 0 }}
          >
            <TocTree
              headings={tocHeadings}
              activeId={activeHeadingId}
              ariaLabel={t('tableOfContents')}
              onNavigate={() => setTocOpened(false)}
            />
          </Drawer>
        </>
      ) : undefined}
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

function getSearchShortcut(): string {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl+K';
}
