import type { Uri, WebviewView } from 'vscode';
import { describe, expect, it, vi } from 'vitest';

import { ASSISTANT_VIEW_ID } from '../../src/commands/commandIds.js';
import {
  hostToWebviewMessageSchema,
  type HostToWebviewMessage,
} from '../../src/shared/messages.js';
import { VoicompViewProvider } from '../../src/ui/VoicompViewProvider.js';

const extensionUri = createUri('extension');
const readyRequestId = 'd9428888-122b-4d03-b7b7-3a35c10112e7';

function uriToString(this: { readonly value: string }): string {
  return this.value;
}

function createUri(value: string): Uri {
  return { value, toString: uriToString } as unknown as Uri;
}

function joinPath(base: Uri, ...segments: string[]): Uri {
  return createUri([base.toString(), ...segments].join('/'));
}

function createViewHarness() {
  let receiveMessage: ((message: unknown) => unknown) | undefined;
  let disposeView: (() => void) | undefined;
  const disposeMessageSubscription = vi.fn();
  const disposeViewSubscription = vi.fn();
  const postMessage = vi.fn<(message: HostToWebviewMessage) => Promise<boolean>>(async () => true);
  const webview = {
    asWebviewUri: vi.fn((uri: Uri) => createUri(`webview:${uri.toString()}`)),
    cspSource: 'vscode-webview://voicomp-test',
    html: '',
    onDidReceiveMessage: vi.fn((listener: (message: unknown) => unknown) => {
      receiveMessage = listener;
      return { dispose: disposeMessageSubscription };
    }),
    options: {},
    postMessage,
  };
  const view = {
    onDidDispose: vi.fn((listener: () => void) => {
      disposeView = listener;
      return { dispose: disposeViewSubscription };
    }),
    webview,
  } as unknown as WebviewView;

  return {
    disposeMessageSubscription,
    disposeView: () => disposeView?.(),
    disposeViewSubscription,
    postMessage,
    receiveMessage: (message: unknown) => receiveMessage?.(message),
    view,
    webview,
  };
}

describe('VoicompViewProvider', () => {
  it('registers the assistant view and disposes its registration once', () => {
    const dispose = vi.fn();
    const registerWebviewViewProvider = vi.fn(() => ({ dispose }));

    const provider = new VoicompViewProvider(registerWebviewViewProvider, extensionUri, joinPath);

    expect(registerWebviewViewProvider).toHaveBeenCalledOnce();
    expect(registerWebviewViewProvider).toHaveBeenCalledWith(ASSISTANT_VIEW_ID, provider);

    provider.dispose();
    provider.dispose();

    expect(dispose).toHaveBeenCalledOnce();
  });

  it('restricts resources, installs secure HTML, and routes validated messages', async () => {
    const registerWebviewViewProvider = vi.fn(() => ({ dispose: vi.fn() }));
    const provider = new VoicompViewProvider(registerWebviewViewProvider, extensionUri, joinPath);
    const harness = createViewHarness();

    provider.resolveWebviewView(harness.view);

    expect(harness.webview.options).toEqual({
      enableScripts: true,
      localResourceRoots: [createUri('extension/dist/webview')],
    });
    expect(harness.webview.asWebviewUri).toHaveBeenCalledWith(
      createUri('extension/dist/webview/main.js'),
    );
    expect(harness.webview.asWebviewUri).toHaveBeenCalledWith(
      createUri('extension/dist/webview/styles.css'),
    );
    expect(harness.webview.html).toContain("default-src 'none'");
    expect(harness.webview.html).toContain('webview:extension/dist/webview/main.js');
    expect(harness.webview.html).toContain('webview:extension/dist/webview/styles.css');

    await harness.receiveMessage({ type: 'webview.ready', requestId: readyRequestId });

    expect(harness.postMessage).toHaveBeenCalledOnce();
    expect(hostToWebviewMessageSchema.parse(harness.postMessage.mock.calls[0]?.[0])).toMatchObject({
      type: 'host.initialState',
      requestId: readyRequestId,
    });

    provider.dispose();
  });

  it('disposes the router and subscriptions with the view', async () => {
    const registerWebviewViewProvider = vi.fn(() => ({ dispose: vi.fn() }));
    const provider = new VoicompViewProvider(registerWebviewViewProvider, extensionUri, joinPath);
    const harness = createViewHarness();
    provider.resolveWebviewView(harness.view);

    harness.disposeView();
    await harness.receiveMessage({ type: 'webview.ready', requestId: readyRequestId });

    expect(harness.disposeMessageSubscription).toHaveBeenCalledOnce();
    expect(harness.disposeViewSubscription).toHaveBeenCalledOnce();
    expect(harness.postMessage).not.toHaveBeenCalled();

    provider.dispose();
  });
});
