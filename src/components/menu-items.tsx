import { Divider, NavLink } from '@mantine/core';
import { Fragment, type ReactElement } from 'react';
import { Link } from 'wouter';

import type { VitedMenuEntry } from '../types';
import type { NavigationProps } from './navigation-types';

export function MenuItems({
  entries,
  locale,
  activePath,
  onNavigate,
}: NavigationProps & { entries: VitedMenuEntry[] }): ReactElement {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.divider) return <Divider key={`divider-${index}`} my='xs' />;
        const href = entry.path ? (entry.pathnames?.[locale] ?? '#') : (entry.link ?? '#');
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
