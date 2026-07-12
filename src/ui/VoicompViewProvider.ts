import type { Disposable, Uri, WebviewView, WebviewViewProvider } from 'vscode';

import { ASSISTANT_VIEW_ID } from '../commands/commandIds.js';
import { createWebviewHtml } from './createWebviewHtml.js';
import { WebviewMessageRouter } from './WebviewMessageRouter.js';

export type WebviewViewProviderRegistrar = (
  viewId: string,
  provider: WebviewViewProvider,
) => Disposable;

export type UriJoiner = (base: Uri, ...pathSegments: string[]) => Uri;

export class VoicompViewProvider implements WebviewViewProvider, Disposable {
  private registration: Disposable | undefined;
  private viewResources: Disposable | undefined;

  public constructor(
    registerWebviewViewProvider: WebviewViewProviderRegistrar,
    private readonly extensionUri: Uri,
    private readonly joinPath: UriJoiner,
  ) {
    this.registration = registerWebviewViewProvider(ASSISTANT_VIEW_ID, this);
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    this.viewResources?.dispose();

    const webviewRoot = this.joinPath(this.extensionUri, 'dist', 'webview');
    const scriptUri = webviewView.webview
      .asWebviewUri(this.joinPath(webviewRoot, 'main.js'))
      .toString();
    const styleUri = webviewView.webview
      .asWebviewUri(this.joinPath(webviewRoot, 'styles.css'))
      .toString();
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewRoot],
    };

    const router = new WebviewMessageRouter({
      postMessage: (message) => webviewView.webview.postMessage(message),
      logEvent: () => undefined,
    });
    const messageSubscription = webviewView.webview.onDidReceiveMessage((message) =>
      router.handleMessage(message),
    );
    const viewSubscriptions = new Set<Disposable>([messageSubscription]);
    let disposed = false;
    const lifecycle: Disposable = {
      dispose: () => {
        if (disposed) {
          return;
        }

        disposed = true;
        router.dispose();
        for (const subscription of viewSubscriptions) {
          subscription.dispose();
        }
        viewSubscriptions.clear();
        if (this.viewResources === lifecycle) {
          this.viewResources = undefined;
        }
      },
    };
    viewSubscriptions.add(webviewView.onDidDispose(() => lifecycle.dispose()));
    this.viewResources = lifecycle;

    webviewView.webview.html = createWebviewHtml({
      cspSource: webviewView.webview.cspSource,
      scriptUri,
      styleUri,
    });
  }

  public dispose(): void {
    this.viewResources?.dispose();
    this.viewResources = undefined;

    const registration = this.registration;
    if (!registration) {
      return;
    }

    this.registration = undefined;
    registration.dispose();
  }
}
