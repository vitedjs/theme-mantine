import { defineConfig } from 'oxlint';
import recommended from 'oxlint-config-recommended';
import recommendedReact from 'oxlint-config-recommended/react';

export default defineConfig({
  extends: [recommended, recommendedReact],
});
