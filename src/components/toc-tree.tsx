import { Anchor, Stack } from '@mantine/core';
import { Fragment, type ReactElement } from 'react';

import type { TocHeading } from '../toc';

interface TocTreeProps {
  headings: TocHeading[];
  activeId?: string;
  ariaLabel: string;
  onNavigate?: () => void;
  level?: number;
}

export function TocTree({
  headings,
  activeId,
  ariaLabel,
  onNavigate,
  level = 0,
}: TocTreeProps): ReactElement {
  return (
    <Stack
      component={level === 0 ? 'nav' : 'div'}
      aria-label={level === 0 ? ariaLabel : undefined}
      gap={2}
    >
      {headings.map((heading) => (
        <Fragment key={heading.id}>
          <Anchor
            href={`#${heading.id}`}
            size='sm'
            c={heading.id === activeId ? undefined : 'dimmed'}
            fw={heading.id === activeId ? 600 : 400}
            underline='hover'
            truncate
            style={{ paddingInlineStart: (heading.level - 2) * 12 }}
            onClick={onNavigate}
          >
            {heading.text}
          </Anchor>
          {heading.children.length > 0 ? (
            <TocTree
              headings={heading.children}
              activeId={activeId}
              ariaLabel={ariaLabel}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ) : undefined}
        </Fragment>
      ))}
    </Stack>
  );
}
