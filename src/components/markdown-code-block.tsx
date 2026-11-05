import { CodeHighlight } from '@mantine/code-highlight';
import { useComputedColorScheme } from '@mantine/core';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { MarkdownElementProps } from '../types';

export function MarkdownCodeBlock({ children }: MarkdownElementProps): ReactElement {
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

function getReactText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => getReactText(child)).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return getReactText(node.props.children);
  return '';
}
