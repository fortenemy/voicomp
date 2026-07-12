import { describe, expect, it, vi } from 'vitest';

import { OPEN_ASSISTANT_COMMAND } from '../../src/commands/commandIds.js';
import { registerCommands } from '../../src/commands/registerCommands.js';

describe('registerCommands', () => {
  it('registers Open Assistant and focuses the contributed assistant view', async () => {
    const dispose = vi.fn();
    const registeredHandlers: Array<() => unknown> = [];
    const registerCommand = vi.fn((_command: string, handler: () => unknown) => {
      registeredHandlers.push(handler);
      return { dispose };
    });
    const executeCommand = vi.fn(async () => undefined);

    const registration = registerCommands(registerCommand, executeCommand);

    expect(registerCommand).toHaveBeenCalledOnce();
    expect(registerCommand).toHaveBeenCalledWith(OPEN_ASSISTANT_COMMAND, expect.any(Function));

    const handler = registeredHandlers[0];
    expect(handler).toBeTypeOf('function');
    await handler?.();

    expect(executeCommand).toHaveBeenCalledOnce();
    expect(executeCommand).toHaveBeenCalledWith('voicomp.assistant.focus');

    registration.dispose();
    expect(dispose).toHaveBeenCalledOnce();
  });
});
