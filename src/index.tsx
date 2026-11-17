import { CodeHighlightAdapterProvider } from '@mantine/code-highlight';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Router } from 'wouter';

import { codeHighlightAdapter } from './code-highlight';
import { ThemeApp } from './components/theme-app';
import { themeI18n } from './i18n';
import type { VitedThemeProps } from './types';

import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/spotlight/styles.css';
import './index.css';

export type { VitedMenuEntry, VitedPage, VitedRoute, VitedThemeProps } from './types';

export function VitedTheme(props: VitedThemeProps): ReactElement {
  return (
    <MantineProvider defaultColorScheme='auto'>
      <CodeHighlightAdapterProvider adapter={codeHighlightAdapter}>
        <I18nextProvider i18n={themeI18n}>
          <Router base={props.basePath ?? ''}>
            <ThemeApp {...props} />
          </Router>
        </I18nextProvider>
      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}

export default VitedTheme;
