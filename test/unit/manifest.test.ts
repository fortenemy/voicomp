import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { scripts?: Record<string, string> };

describe('package scripts', () => {
  it('defines the exact Phase 1 workflow commands', () => {
    expect(manifest.scripts?.build).toBe(
      'npm run typecheck && node ./scripts/esbuild.mjs --production',
    );
    expect(manifest.scripts?.watch).toBe('node ./scripts/esbuild.mjs --watch');
    expect(manifest.scripts?.lint).toBe('npm run lint:code && npm run lint:format');
    expect(manifest.scripts?.['lint:code']).toBe('eslint . --max-warnings=0');
    expect(manifest.scripts?.['lint:format']).toBe('prettier --check .');
    expect(manifest.scripts?.typecheck).toBe(
      'tsc -p tsconfig.extension.json && tsc -p tsconfig.webview.json && tsc -p tsconfig.unit.json',
    );
    expect(manifest.scripts?.['test:unit']).toBe('vitest run');
    expect(manifest.scripts?.['test:integration']).toBe(
      'npm run build && tsc -p test/integration/tsconfig.json && vscode-test',
    );
    expect(manifest.scripts?.test).toBe('npm run test:unit && npm run test:integration');
    expect(manifest.scripts?.['vscode:prepublish']).toBe('npm run build');
    expect(manifest.scripts?.package).toBe(
      'vsce package --no-dependencies --out artifacts/voicomp.vsix',
    );
  });
});

describe('package output directory', () => {
  it('keeps a tracked placeholder while ignoring generated artifacts', () => {
    const gitignore = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8');

    expect(existsSync(new URL('../../artifacts/.gitkeep', import.meta.url))).toBe(true);
    expect(gitignore).toContain('artifacts/*');
    expect(gitignore).toContain('!artifacts/.gitkeep');
  });
});
