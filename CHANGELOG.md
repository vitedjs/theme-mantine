# Changelog

## Unreleased

## 0.5.3 - 2026-11-05

### Added

- Show `new` and `deprecated` badges from page frontmatter in the generated sidebar.

### Changed

- Use small badges in the generated sidebar.

## 0.5.1 - 2026-11-02

### Added

- Show an anchor link when hovering a Markdown or MDX heading, and list the page outline in a table of contents that stays in view while scrolling. On small screens the outline opens from a floating button.
- Add a documentation site with `docs:dev` and `docs:build` scripts, deployed to GitHub Pages.

### Changed

- Match the table of contents column width to the navigation sidebar, keeping the article centered on wide screens.

## 0.5.0 - 2026-10-30

### Added

- Show the project favicon to the left of the header title when Vited provides one.

### Changed

- Require `@vited/core` 0.4 or newer as a peer dependency.

## 0.4.0 - 2026-10-30

### Changed

- Consume the page and route data resolved by Vited, so the theme no longer builds page paths. Navigation, search results, and the language selector use the pathnames they receive.
- Page URLs are directory style and end with a slash.
- Require `@vited/core` 0.3 or newer as a peer dependency.

## 0.3.0 - 2026-10-30

### Changed

- Hide the sidebar, including the mobile navigation toggle, when a locale has a single page and no `menu` is configured.
- Require `@vited/core` 0.2 or newer as a peer dependency.

## 0.2.0 - 2026-10-28

### Changed

- Require React 19.2 or newer to match Mantine 9's peer requirements.

## 0.1.0 - 2026-10-27

Initial release.

### Added

- Responsive documentation layout with Mantine AppShell and nested page navigation.
- English and Simplified Chinese interface translations, localized routes, and a light/dark theme toggle.
- Locale-aware fuzzy search with Mantine Spotlight and the `Ctrl+K` / `⌘K` shortcut.
- Optional GitHub and Donate links from project metadata.
- Markdown and MDX code blocks highlighted with Shiki, including copy controls.
