import { defineConfig } from '@vscode/test-cli';

const files = 'out/test/integration/**/*.test.js';
const workspaceFolder = 'test/fixtures/workspace';

export default defineConfig([
  {
    label: 'minimum',
    version: '1.95.0',
    files,
    workspaceFolder,
  },
  {
    label: 'current',
    version: '1.127.0',
    files,
    workspaceFolder,
  },
]);
