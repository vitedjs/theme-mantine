import { describe, expect, it } from 'vitest';

import { resolveInternalPageLink } from './markdown-link';

describe('resolveInternalPageLink()', () => {
  it('resolves relative links against the current route', () => {
    expect(resolveInternalPageLink('../installation/?from=guide#setup', '/guide/start/')).toBe(
      '/guide/installation/?from=guide#setup',
    );
  });

  it('preserves absolute site paths for the client router', () => {
    expect(resolveInternalPageLink('/installation/', '/guide/')).toBe('/installation/');
  });

  it('leaves external links, anchors, and file links as regular anchors', () => {
    expect(resolveInternalPageLink('https://example.com/guide/', '/')).toBeUndefined();
    expect(resolveInternalPageLink('#setup', '/guide/')).toBeUndefined();
    expect(resolveInternalPageLink('./src/app.tsx', '/sample/')).toBeUndefined();
  });
});
