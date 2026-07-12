import type { Disposable } from 'vscode';

import type { WebviewRouterEvent } from '../ui/WebviewMessageRouter.js';
import type { LogLevel } from './logLevel.js';

export interface OutputChannel extends Disposable {
  appendLine(message: string): void;
}

export type LifecycleEvent = 'extension.activated' | 'extension.deactivated';
export type CountEvent = 'message.rejectedCount';
export type IdentifierEvent = 'session.created';

const maximumLogCount = 10_000;
const generatedIdentifierPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const lifecycleEvents = new Map<LifecycleEvent, string>([
  ['extension.activated', 'extension.activated'],
  ['extension.deactivated', 'extension.deactivated'],
]);

const routerEvents = new Map<WebviewRouterEvent, Exclude<LogLevel, 'off'>>([
  ['message.ready', 'info'],
  ['message.connectionCheck', 'info'],
  ['message.invalid', 'error'],
  ['message.staleSession', 'info'],
  ['message.late', 'info'],
  ['message.disposed', 'info'],
  ['outbound.invalid', 'error'],
  ['outbound.rejected', 'error'],
  ['outbound.failed', 'error'],
]);

const countEvents = new Map<CountEvent, string>([
  ['message.rejectedCount', 'message.rejectedCount'],
]);

const identifierEvents = new Map<IdentifierEvent, string>([['session.created', 'session.created']]);

export class OutputLogger implements Disposable {
  private disposed = false;

  public constructor(
    private readonly outputChannel: OutputChannel,
    private readonly level: LogLevel,
  ) {}

  public lifecycle(event: LifecycleEvent): void {
    const safeEvent = lifecycleEvents.get(event);
    if (safeEvent) {
      this.write('info', safeEvent);
    }
  }

  public routerEvent(event: WebviewRouterEvent): void {
    const level = routerEvents.get(event);
    if (level) {
      this.write(level, event);
    }
  }

  public count(event: CountEvent, count: number): void {
    const safeEvent = countEvents.get(event);
    if (!safeEvent || !Number.isInteger(count) || count < 0 || count > maximumLogCount) {
      return;
    }

    this.write('info', `${safeEvent} count=${String(count)}`);
  }

  public identifier(event: IdentifierEvent, identifier: string): void {
    const safeEvent = identifierEvents.get(event);
    if (!safeEvent || !generatedIdentifierPattern.test(identifier)) {
      return;
    }

    this.write('info', `${safeEvent} id=${identifier}`);
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.outputChannel.dispose();
  }

  private write(level: Exclude<LogLevel, 'off'>, message: string): void {
    if (this.disposed || this.level === 'off' || (this.level === 'error' && level === 'info')) {
      return;
    }

    this.outputChannel.appendLine(`[${level}] ${message}`);
  }
}
