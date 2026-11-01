---
title: Installation
order: 10
---

# Installation

Install the theme together with Vited's core and CLI:

```bash
pnpm add -D @vited/core @vited/cli @vited/theme-mantine
```

Then select the theme in `vited.config.ts`:

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    theme: '@vited/theme-mantine',
  },
});
```

Add scripts to `package.json` to develop and build your documentation site:

```json
{
  "scripts": {
    "docs:build": "vited build",
    "docs:dev": "vited dev"
  }
}
```

Run `pnpm docs:dev` to start the dev server and `pnpm docs:build` to emit a
static site to `docs_dist/`.
