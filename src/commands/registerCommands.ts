import { OPEN_ASSISTANT_COMMAND, SET_OPENAI_API_KEY_COMMAND } from './commandIds.js';
import { createOpenAssistantCommand, type CommandExecutor } from './openAssistantCommand.js';
import {
  createSetApiKeyPlaceholderCommand,
  type InformationMessagePresenter,
} from './setApiKeyPlaceholderCommand.js';

export interface Disposable {
  dispose(): void;
}

export type CommandRegistrar = (command: string, handler: () => unknown) => Disposable;

export function registerCommands(
  registerCommand: CommandRegistrar,
  executeCommand: CommandExecutor,
  showInformationMessage: InformationMessagePresenter,
): Disposable {
  const registrations: Disposable[] = [];

  try {
    registrations.push(
      registerCommand(OPEN_ASSISTANT_COMMAND, createOpenAssistantCommand(executeCommand)),
    );
    registrations.push(
      registerCommand(
        SET_OPENAI_API_KEY_COMMAND,
        createSetApiKeyPlaceholderCommand(showInformationMessage),
      ),
    );
  } catch (error) {
    try {
      disposeRegistrations(registrations);
    } catch {
      // Preserve the registration failure that triggered rollback.
    }
    throw error;
  }

  let disposed = false;

  return {
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      disposeRegistrations(registrations);
    },
  };
}

function disposeRegistrations(registrations: readonly Disposable[]): void {
  let firstError: unknown;

  for (const registration of [...registrations].reverse()) {
    try {
      registration.dispose();
    } catch (error) {
      firstError ??= error;
    }
  }

  if (firstError) {
    throw firstError;
  }
}
