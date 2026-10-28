import { describe, expect, it } from 'vitest';

import { findPage, type VitedPage } from './index';

const pages: VitedPage[] = [
  { path: '/', locale: 'en', title: 'Home', frontmatter: {}, component: () => null },
  { path: '/', locale: 'zh', title: '首页', frontmatter: {}, component: () => null },
  { path: '/guide', locale: 'en', title: 'Guide', frontmatter: {}, component: () => null },
];

describe('findPage()', () => {
  it('resolves a route in the requested language', () => {
    expect(findPage(pages, '/', 'zh')?.title).toBe('首页');
  });

  it('falls back to the same route when a translation is missing', () => {
    expect(findPage(pages, '/guide', 'zh')?.title).toBe('Guide');
  });
});
