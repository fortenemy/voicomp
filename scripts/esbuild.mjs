import { build, context } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

export const hostBuildOptions = {
  entryPoints: {
    extension: 'src/extension.ts',
  },
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  minify: production,
  outdir: 'dist',
  platform: 'node',
  sourcemap: !production,
  target: 'node20',
};

export const webviewBuildOptions = {
  entryPoints: {
    main: 'webview/main.ts',
    styles: 'webview/styles.css',
  },
  bundle: true,
  format: 'iife',
  minify: production,
  outdir: 'dist/webview',
  platform: 'browser',
  sourcemap: !production,
  target: 'chrome128',
};

async function runBuild() {
  if (!watch) {
    await Promise.all([build(hostBuildOptions), build(webviewBuildOptions)]);
    return;
  }

  const contexts = await Promise.all([context(hostBuildOptions), context(webviewBuildOptions)]);

  await Promise.all(contexts.map(async (buildContext) => buildContext.watch()));
  console.log('Watching Extension Host and Webview bundles.');

  const dispose = async () => {
    await Promise.all(contexts.map(async (buildContext) => buildContext.dispose()));
  };

  process.once('SIGINT', () => {
    void dispose().finally(() => process.exit(0));
  });
  process.once('SIGTERM', () => {
    void dispose().finally(() => process.exit(0));
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;

if (invokedPath === import.meta.url) {
  runBuild().catch(() => {
    console.error('Voicomp build failed.');
    process.exitCode = 1;
  });
}
