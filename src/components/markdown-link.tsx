import { Link, useLocation } from 'wouter';

import type { MarkdownElementProps } from '../types';

export function MarkdownLink({ href, children, download, target, ...props }: MarkdownElementProps) {
  const [pathname] = useLocation();
  const to =
    download === undefined && (!target || target.toLowerCase() === '_self') && href
      ? resolveInternalPageLink(href, pathname)
      : undefined;

  if (!to) {
    return (
      <a href={href} download={download} target={target} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} asChild>
      <a href={to} download={download} target={target} {...props}>
        {children}
      </a>
    </Link>
  );
}

export function resolveInternalPageLink(href: string, pathname: string): string | undefined {
  if (href.startsWith('#') || href.startsWith('?')) return undefined;

  const origin = 'http://vited.local';
  let url: URL;

  try {
    url = new URL(href, `${origin}${pathname}`);
  } catch {
    return undefined;
  }

  if (url.origin !== origin || !url.pathname || /\.[^/]+$/.test(url.pathname)) return undefined;
  return `${url.pathname}${url.search}${url.hash}`;
}
