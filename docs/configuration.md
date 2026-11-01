---
title: Configuration
order: 20
---

# Configuration

The theme is configured through the `docs` option of
[Vited Core](https://github.com/vitedjs/core); there are no theme-specific
options.

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    description: 'Documentation for My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-mantine',
  },
});
```

## Title, description and favicon

`title` and `description` appear in the header, next to the favicon that Vited
discovers from your docs directory.

## Locales

When `supportedLocales` lists more than one locale, a language selector appears
in the header and the interface labels (search, navigation, color mode toggle)
switch between the bundled English and Simplified Chinese translations.

## Search

The search Spotlight indexes the title and content of every page in the current
locale and supports fuzzy matching, including Chinese text. Open it with the
Search button or `Ctrl+K` / `⌘K`, move through results with the arrow keys, and
confirm with `Enter`.

## Color modes

The theme follows the system color scheme until the user picks light or dark
with the header toggle. The explicit choice is persisted in `localStorage` and
applied through Mantine's color scheme, so all Mantine components adapt
automatically.

## Project links

When the `package.json` passed to the theme contains a GitHub `repository` URL
or a `funding` URL, the corresponding links are shown as icon buttons in the
header.

## Heading anchors and table of contents

Every Markdown and MDX heading gets an `id` and an anchor link, so headings can
be linked directly with a fragment such as `/guide/start/#getting-started`. The
page outline is shown in a table of contents on the right of the content and
stays in view while scrolling; on small screens it opens from a floating
button.

## Code highlighting

Fenced code blocks are highlighted with Shiki in Mantine CodeHighlight using the
GitHub light and dark themes. Preloaded languages: `bash`, `css`, `diff`,
`html`, `javascript`, `json`, `jsx`, `markdown`, `mdx`, `shellscript`,
`typescript`, `tsx` and `yaml`; other languages fall back to plain text.
