import type { Disposable } from 'vscode';

import type { WebviewRouterEvent } from '../ui/WebviewMessageRouter.js';
import type { LogLevel } from './logLevel.js';

export interface OutputChannel extends Disposable {
  appendLine(message: string): void;
}

export type LifecycleEvent = 'extension.activated' | 'extension.deactivated';
export type CountEvent = 'message.rejectedCount';

const maximumLogCount = 10_000;

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
