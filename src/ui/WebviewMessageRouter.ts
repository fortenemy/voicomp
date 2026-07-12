import { randomUUID } from 'node:crypto';

import {
  hostToWebviewMessageSchema,
  webviewToHostMessageSchema,
  type HostToWebviewMessage,
} from '../shared/messages.js';
import { initialMockState } from '../shared/mockState.js';

type DeliveryOutcome = 'delivered' | 'failed' | 'invalid' | 'cancelled';

const deliveryErrorMessage = 'The message could not be delivered.';

export type WebviewRouterEvent =
  | 'message.ready'
  | 'message.connectionCheck'
  | 'message.invalid'
  | 'message.staleSession'
  | 'message.late'
  | 'message.disposed'
  | 'outbound.invalid'
  | 'outbound.rejected'
  | 'outbound.failed';

export interface WebviewMessageRouterDependencies {
  readonly postMessage: (message: HostToWebviewMessage) => boolean | PromiseLike<boolean>;
  readonly logEvent: (event: WebviewRouterEvent) => void;
  readonly createSessionId?: () => string;
}

export class WebviewMessageRouter {
  private readonly postMessage: WebviewMessageRouterDependencies['postMessage'];
  private readonly logEvent: WebviewMessageRouterDependencies['logEvent'];
  private readonly createSessionId: () => string;
  private currentSessionId: string | undefined;
  private generation = 0;
  private disposed = false;

  public constructor(dependencies: WebviewMessageRouterDependencies) {
    this.postMessage = dependencies.postMessage;
    this.logEvent = dependencies.logEvent;
    this.createSessionId = dependencies.createSessionId ?? randomUUID;
  }

  public async handleMessage(candidate: unknown): Promise<void> {
    if (this.disposed) {
      this.logEvent('message.disposed');
      return;
    }

    const parsedMessage = webviewToHostMessageSchema.safeParse(candidate);
    if (!parsedMessage.success) {
      this.logEvent('message.invalid');
      return;
    }

    if (parsedMessage.data.type === 'webview.ready') {
      const sessionId = this.createSessionId();
      this.currentSessionId = sessionId;
      const generation = ++this.generation;
      this.logEvent('message.ready');
      const outcome = await this.postValidated(
        {
          type: 'host.initialState',
          requestId: parsedMessage.data.requestId,
          sessionId,
          connection: initialMockState.connection,
          transcript: [...initialMockState.transcript],
        },
        generation,
      );
      if (
        (outcome === 'failed' || outcome === 'invalid') &&
        !this.disposed &&
        generation === this.generation &&
        sessionId === this.currentSessionId
      ) {
        this.currentSessionId = undefined;
        await this.postValidated(
          {
            type: 'host.error',
            requestId: parsedMessage.data.requestId,
            code: 'invalid_message',
            message: deliveryErrorMessage,
          },
          generation,
        );
      }
      return;
    }

    if (parsedMessage.data.sessionId !== this.currentSessionId) {
      this.logEvent('message.staleSession');
      return;
    }

    const generation = this.generation;
    this.logEvent('message.connectionCheck');
    const outcome = await this.postValidated(
      {
        type: 'host.connectionCheckResult',
        requestId: parsedMessage.data.requestId,
        sessionId: parsedMessage.data.sessionId,
        connection: 'mock_ready',
      },
      generation,
    );
    if (
      (outcome === 'failed' || outcome === 'invalid') &&
      !this.disposed &&
      generation === this.generation &&
      parsedMessage.data.sessionId === this.currentSessionId
    ) {
      await this.postValidated(
        {
          type: 'host.error',
          requestId: parsedMessage.data.requestId,
          code: 'invalid_message',
          message: deliveryErrorMessage,
        },
        generation,
      );
    }
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.currentSessionId = undefined;
    this.generation += 1;
  }

  private async postValidated(candidate: unknown, generation: number): Promise<DeliveryOutcome> {
    const parsedMessage = hostToWebviewMessageSchema.safeParse(candidate);
    if (!parsedMessage.success) {
      this.logEvent('outbound.invalid');
      return 'invalid';
    }

    await Promise.resolve();
    if (this.disposed || generation !== this.generation) {
      this.logEvent('message.late');
      return 'cancelled';
    }

    try {
      const accepted = await this.postMessage(parsedMessage.data);
      if (!accepted) {
        this.logEvent('outbound.rejected');
        return 'failed';
      }
      return 'delivered';
    } catch {
      this.logEvent('outbound.failed');
      return 'failed';
    }
  }
}
