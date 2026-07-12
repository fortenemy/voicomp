import { describe, expect, it, vi } from 'vitest';

import { createExtensionLifecycle } from '../../src/extensionLifecycle.js';
import { OutputLogger } from '../../src/logging/OutputLogger.js';

function createLogger(appendLine = vi.fn<(message: string) => void>()) {
  const disposeChannel = vi.fn();
  const logger = new OutputLogger({ appendLine, dispose: disposeChannel }, 'info');

  return { appendLine, disposeChannel, logger };
}

describe('createExtensionLifecycle', () => {
  it('disposes the Output Channel when command acquisition throws', () => {
    const originalError = new Error('command-acquisition-failed');
    const { disposeChannel, logger } = createLogger();

    expect(() =>
      createExtensionLifecycle(
        logger,
        () => {
          throw originalError;
        },
        vi.fn(),
      ),
    ).toThrow(originalError);
    expect(disposeChannel).toHaveBeenCalledOnce();
  });

  it('rolls back commands and the Output Channel when view acquisition throws', () => {
    const originalError = new Error('view-acquisition-failed');
    const cleanupError = new Error('command-cleanup-failed');
    const disposeCommands = vi.fn(() => {
      throw cleanupError;
    });
    const { disposeChannel, logger } = createLogger();

    expect(() =>
      createExtensionLifecycle(
        logger,
        () => ({ dispose: disposeCommands }),
        () => {
          throw originalError;
        },
      ),
    ).toThrow(originalError);
    expect(disposeCommands).toHaveBeenCalledOnce();
    expect(disposeChannel).toHaveBeenCalledOnce();
  });

  it('rolls back view, commands, and channel when activation logging throws', () => {
    const originalError = new Error('activation-log-failed');
    const appendLine = vi.fn(() => {
      throw originalError;
    });
    const disposeView = vi.fn();
    const disposeCommands = vi.fn();
    const { disposeChannel, logger } = createLogger(appendLine);

    expect(() =>
      createExtensionLifecycle(
        logger,
        () => ({ dispose: disposeCommands }),
        () => ({ dispose: disposeView }),
      ),
    ).toThrow(originalError);
    expect(disposeView).toHaveBeenCalledOnce();
    expect(disposeCommands).toHaveBeenCalledOnce();
    expect(disposeChannel).toHaveBeenCalledOnce();
  });

  it('disposes acquired resources exactly once after successful activation', () => {
    const disposeView = vi.fn();
    const disposeCommands = vi.fn();
    const { appendLine, disposeChannel, logger } = createLogger();
    const lifecycle = createExtensionLifecycle(
      logger,
      () => ({ dispose: disposeCommands }),
      () => ({ dispose: disposeView }),
    );

    lifecycle.dispose();
    lifecycle.dispose();

    expect(appendLine.mock.calls).toEqual([
      ['[info] extension.activated'],
      ['[info] extension.deactivated'],
    ]);
    expect(disposeView).toHaveBeenCalledOnce();
    expect(disposeCommands).toHaveBeenCalledOnce();
    expect(disposeChannel).toHaveBeenCalledOnce();
  });
});
