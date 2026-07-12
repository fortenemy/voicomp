import { randomBytes } from 'node:crypto';

export interface WebviewResources {
  readonly cspSource: string;
  readonly scriptUri: string;
  readonly styleUri: string;
}

export function createWebviewHtml(resources: WebviewResources): string {
  const nonce = randomBytes(24).toString('base64url');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${resources.cspSource}; script-src 'nonce-${nonce}';">
    <link rel="stylesheet" href="${resources.styleUri}">
    <title>Voicomp</title>
  </head>
  <body>
    <main>
      <h1>Voicomp</h1>
      <p id="connection-status" role="status" aria-live="polite">Starting offline assistant…</p>
      <section aria-labelledby="transcript-heading">
        <h2 id="transcript-heading">Transcript</h2>
        <ul id="transcript-list" aria-label="Transcript"></ul>
      </section>
      <button id="connection-check" type="button" disabled>Check mock connection</button>
    </main>
    <script nonce="${nonce}" src="${resources.scriptUri}"></script>
  </body>
</html>`;
}
