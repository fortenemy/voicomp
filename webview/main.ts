import {
  hostToWebviewMessageSchema,
  webviewToHostMessageSchema,
  type WebviewToHostMessage,
} from '../src/shared/messages.js';

interface VsCodeWebviewApi {
  postMessage(message: WebviewToHostMessage): void;
}

export interface WebviewControllerDependencies {
  readonly document: Document;
  readonly window: Window;
  readonly vscodeApi: VsCodeWebviewApi;
  readonly createRequestId?: () => string;
}

export interface WebviewController {
  dispose(): void;
}

export function startWebviewController(
  dependencies: WebviewControllerDependencies,
): WebviewController {
  const statusElement = dependencies.document.getElementById('connection-status');
  const transcriptList = dependencies.document.getElementById('transcript-list');
  const connectionButtonElement = dependencies.document.getElementById('connection-check');
  if (
    !statusElement ||
    !transcriptList ||
    !connectionButtonElement ||
    connectionButtonElement.tagName !== 'BUTTON'
  ) {
    throw new Error('Voicomp Webview markup is incomplete.');
  }

  const connectionButton = connectionButtonElement as HTMLButtonElement;
  const createRequestId = dependencies.createRequestId ?? (() => crypto.randomUUID());
  const readyRequestId = createRequestId();
  let pendingReadyRequestId: string | undefined = readyRequestId;
  let pendingConnectionRequestId: string | undefined;
  let sessionId: string | undefined;
  let disposed = false;

  const postValidated = (candidate: unknown): boolean => {
    const parsedMessage = webviewToHostMessageSchema.safeParse(candidate);
    if (!parsedMessage.success || disposed) {
      return false;
    }

    dependencies.vscodeApi.postMessage(parsedMessage.data);
    return true;
  };

  const handleConnectionCheck = (): void => {
    if (disposed || !sessionId || pendingConnectionRequestId) {
      return;
    }

    const requestId = createRequestId();
    const posted = postValidated({
      type: 'webview.connectionCheck',
      requestId,
      sessionId,
    });
    if (!posted) {
      return;
    }

    pendingConnectionRequestId = requestId;
    connectionButton.disabled = true;
  };

  const handleHostMessage = (event: MessageEvent<unknown>): void => {
    if (disposed) {
      return;
    }

    const parsedMessage = hostToWebviewMessageSchema.safeParse(event.data);
    if (!parsedMessage.success) {
      return;
    }

    const message = parsedMessage.data;
    if (message.type === 'host.initialState') {
      if (!pendingReadyRequestId || message.requestId !== pendingReadyRequestId || sessionId) {
        return;
      }

      sessionId = message.sessionId;
      pendingReadyRequestId = undefined;
      statusElement.textContent = 'Mock disconnected';
      const transcriptItems = message.transcript.map((entry) => {
        const item = dependencies.document.createElement('li');
        item.textContent = entry.text;
        return item;
      });
      transcriptList.replaceChildren(...transcriptItems);
      connectionButton.disabled = false;
      return;
    }

    if (message.type === 'host.connectionCheckResult') {
      if (
        !pendingConnectionRequestId ||
        message.requestId !== pendingConnectionRequestId ||
        message.sessionId !== sessionId
      ) {
        return;
      }

      pendingConnectionRequestId = undefined;
      statusElement.textContent = 'Mock ready';
      connectionButton.disabled = false;
    }
  };

  dependencies.window.addEventListener('message', handleHostMessage);
  connectionButton.addEventListener('click', handleConnectionCheck);
  postValidated({ type: 'webview.ready', requestId: readyRequestId });

  return {
    dispose(): void {
      if (disposed) {
        return;
      }

      disposed = true;
      dependencies.window.removeEventListener('message', handleHostMessage);
      connectionButton.removeEventListener('click', handleConnectionCheck);
      pendingReadyRequestId = undefined;
      pendingConnectionRequestId = undefined;
      sessionId = undefined;
    },
  };
}

declare function acquireVsCodeApi(): VsCodeWebviewApi;

if (typeof acquireVsCodeApi === 'function') {
  startWebviewController({
    document,
    window,
    vscodeApi: acquireVsCodeApi(),
  });
}
