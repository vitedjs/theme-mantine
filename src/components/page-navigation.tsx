import { Badge, Group, NavLink } from '@mantine/core';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Link } from 'wouter';

import type { VitedPage } from '../types';
import type { NavigationProps } from './navigation-types';

interface PageNavigationNode {
  key: string;
  title: string;
  badge?: 'new' | 'deprecated';
  page?: VitedPage;
  children: PageNavigationNode[];
}

const pageBadgeColors = { new: 'green', deprecated: 'orange' } as const;

export function PageNavigation({
  pages,
  activePath,
  onNavigate,
}: Pick<NavigationProps, 'activePath' | 'onNavigate'> & { pages: VitedPage[] }): ReactElement {
  const nodes: PageNavigationNode[] = [];

  for (const page of pages) {
    let level = nodes;
    const segments = page.path
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
    if (segments.length === 0) {
      level.push({
        key: `${page.locale}:${page.path}`,
        title: page.title,
        badge: getPageBadge(page),
        page,
        children: [],
      });
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
        node.badge = getPageBadge(page);
        node.page = page;
      }
    }
  }

  return <>{renderPageNavigationNodes(nodes, { activePath, onNavigate })}</>;
}

function renderPageNavigationNodes(
  nodes: PageNavigationNode[],
  props: Pick<NavigationProps, 'activePath' | 'onNavigate'>,
): ReactNode {
  return nodes.map((node) => {
    const navLink = (
      <NavLink
        label={
          <Group justify='space-between' wrap='nowrap' w='100%'>
            <span>{node.title}</span>
            {node.badge && (
              <Badge color={pageBadgeColors[node.badge]} size='xs' variant='light'>
                {node.badge}
              </Badge>
            )}
          </Group>
        }
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
      <Link key={node.key} to={node.page.pathname} asChild onClick={props.onNavigate}>
        {navLink}
      </Link>
    ) : (
      <Fragment key={node.key}>{navLink}</Fragment>
    );
  });
}

function getPageBadge(page: VitedPage): 'new' | 'deprecated' | undefined {
  const badge = page.frontmatter.badge;
  return badge === 'new' || badge === 'deprecated' ? badge : undefined;
}

function humanize(value: string): string {
  return decodeURIComponent(value).replaceAll(/[-_]/g, ' ');
}
