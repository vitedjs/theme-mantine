# @vited/theme-mantine

The default Mantine theme for Vited. It renders generated document pages,
provides responsive navigation in a Mantine AppShell, and includes a persisted
light/dark theme toggle with Phosphor icons. Interface labels are available in
English and Simplified Chinese; the language selector appears when multiple
locales are configured. These labels use `react-i18next` resources in
[`src/i18n.ts`](./src/i18n.ts). When supplied with Vited's generated search index, it
provides locale-aware fuzzy search in a Mantine Spotlight, opened with the
Search button or `Ctrl+K` / `⌘K`. GitHub and Donate links are shown in the
header when the supplied `packageJSON` includes valid `repository` and
`funding` URLs. The documentation favicon discovered by Vited is displayed to
the left of the header title. Markdown and MDX fenced code blocks use Mantine CodeHighlight
with Shiki syntax highlighting, copy controls, and translated copy labels.

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-mantine',
  },
});
```

The theme is loaded by Vited's generated client; applications don't need to
render it manually. Mantine follows the system color scheme by default and
remembers the user's theme selection.
