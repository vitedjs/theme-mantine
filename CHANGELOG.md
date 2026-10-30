# Changelog

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
