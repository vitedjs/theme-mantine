# @vited/theme-mantine

The default Mantine theme for Vited. It renders generated document pages,
provides a route list, and exposes a language selector when multiple locales
are configured.

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    root: './docs',
    title: 'My Cool Library',
    supportedLocales: ['en', 'zh', 'pt'],
    theme: '@vited/theme-mantine',
  },
});
```

The theme is loaded by Vited's generated client; applications don't need to
render it manually.
