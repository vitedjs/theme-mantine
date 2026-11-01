import { defineConfig } from '@vited/core';

export default defineConfig({
  base: '/theme-mantine/',
  server: {
    open: true,
  },
  docs: {
    title: 'Vited Mantine Theme',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-mantine',
  },
});
