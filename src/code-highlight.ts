import { createShikiAdapter } from '@mantine/code-highlight';
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki';

export const codeHighlightAdapter = createShikiAdapter(
  () =>
    createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'bash',
        'css',
        'diff',
        'html',
        'javascript',
        'json',
        'jsx',
        'markdown',
        'mdx',
        'shellscript',
        'typescript',
        'tsx',
        'yaml',
      ],
    }),
  {
    resolveLanguage: (language) => {
      const normalizedLanguage = language.toLowerCase();
      return normalizedLanguage in bundledLanguages
        ? bundledLanguages[normalizedLanguage as BundledLanguage]
        : undefined;
    },
  },
);
