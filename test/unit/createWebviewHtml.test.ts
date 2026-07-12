import { describe, expect, it } from 'vitest';

import { createWebviewHtml } from '../../src/ui/createWebviewHtml.js';

const webviewResources = {
  cspSource: 'vscode-webview://voicomp-test',
  scriptUri: 'vscode-webview://voicomp-test/dist/webview/main.js',
  styleUri: 'vscode-webview://voicomp-test/dist/webview/styles.css',
};

function readScriptNonce(html: string): string {
  const nonce = html.match(/<script\s+nonce="([^"]+)"/u)?.[1];
  expect(nonce).toBeTruthy();
  return nonce ?? '';
}

describe('createWebviewHtml', () => {
  it('creates an accessible minimal assistant view', () => {
    const html = createWebviewHtml(webviewResources);

    expect(html).toMatch(/<h1>Voicomp<\/h1>/u);
    expect(html).toMatch(/id="connection-status"[^>]*role="status"/u);
    expect(html).toMatch(/<ul\s+id="transcript-list"[^>]*aria-label="Transcript"/u);
    expect(html).toMatch(/<button\s+id="connection-check"\s+type="button"/u);
  });

  it('uses a fresh nonce and permits only the packaged script and local styles', () => {
    const firstHtml = createWebviewHtml(webviewResources);
    const secondHtml = createWebviewHtml(webviewResources);
    const firstNonce = readScriptNonce(firstHtml);
    const secondNonce = readScriptNonce(secondHtml);

    expect(firstNonce).not.toBe(secondNonce);
    expect(firstHtml).toContain(
      `content="default-src 'none'; style-src ${webviewResources.cspSource}; script-src 'nonce-${firstNonce}';"`,
    );
    expect(firstHtml.match(/<script\b/gu)).toHaveLength(1);
    expect(firstHtml).toContain(
      `<script nonce="${firstNonce}" src="${webviewResources.scriptUri}"></script>`,
    );
    expect(firstHtml).toContain(`<link rel="stylesheet" href="${webviewResources.styleUri}">`);
  });

  it('contains no remote, inline-executable, secret, or unsafe-rendering surface', () => {
    const html = createWebviewHtml(webviewResources);

    expect(html).not.toMatch(/https?:\/\//iu);
    expect(html).not.toContain("'unsafe-inline'");
    expect(html).not.toContain("'unsafe-eval'");
    expect(html).not.toMatch(/\son[a-z]+=/iu);
    expect(html).not.toMatch(/<input\b/iu);
    expect(html).not.toMatch(/api[-_ ]?key/iu);
    expect(html).not.toMatch(/innerHTML|insertAdjacentHTML/iu);
  });
});
