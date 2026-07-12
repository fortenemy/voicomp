import { describe, expect, it, vi } from 'vitest';

import {
  OPEN_ASSISTANT_COMMAND,
  SET_OPENAI_API_KEY_COMMAND,
} from '../../src/commands/commandIds.js';
import { registerCommands } from '../../src/commands/registerCommands.js';
import { apiKeyPlaceholderMessage } from '../../src/commands/setApiKeyPlaceholderCommand.js';

describe('registerCommands', () => {
  it('registers the two Phase 1 commands with their bounded handlers', async () => {
    const dispose = vi.fn();
    const registeredHandlers = new Map<string, () => unknown>();
    const registerCommand = vi.fn((command: string, handler: () => unknown) => {
      registeredHandlers.set(command, handler);
      return { dispose };
    });
    const executeCommand = vi.fn(async () => undefined);
    const showInformationMessage = vi.fn(async () => undefined);

    const registration = registerCommands(registerCommand, executeCommand, showInformationMessage);

    expect(registerCommand).toHaveBeenCalledTimes(2);
    expect(registerCommand).toHaveBeenCalledWith(OPEN_ASSISTANT_COMMAND, expect.any(Function));
    expect(registerCommand).toHaveBeenCalledWith(SET_OPENAI_API_KEY_COMMAND, expect.any(Function));

    await registeredHandlers.get(OPEN_ASSISTANT_COMMAND)?.();
    await registeredHandlers.get(SET_OPENAI_API_KEY_COMMAND)?.();

    expect(executeCommand).toHaveBeenCalledOnce();
    expect(executeCommand).toHaveBeenCalledWith('voicomp.assistant.focus');
    expect(showInformationMessage).toHaveBeenCalledOnce();
    expect(showInformationMessage).toHaveBeenCalledWith(apiKeyPlaceholderMessage);

    registration.dispose();
    registration.dispose();
    expect(dispose).toHaveBeenCalledTimes(2);
  });

  it('rolls back the first command when the second registration throws', () => {
    const originalError = new Error('second-command-registration-failed');
    const cleanupError = new Error('first-command-cleanup-failed');
    const disposeFirst = vi.fn(() => {
      throw cleanupError;
    });
    const registerCommand = vi
      .fn()
      .mockReturnValueOnce({ dispose: disposeFirst })
      .mockImplementationOnce(() => {
        throw originalError;
      });

    expect(() => registerCommands(registerCommand, vi.fn(), vi.fn())).toThrow(originalError);
    expect(disposeFirst).toHaveBeenCalledOnce();
  });
});
