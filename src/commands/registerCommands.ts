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
  const registrations = [
    registerCommand(OPEN_ASSISTANT_COMMAND, createOpenAssistantCommand(executeCommand)),
    registerCommand(
      SET_OPENAI_API_KEY_COMMAND,
      createSetApiKeyPlaceholderCommand(showInformationMessage),
    ),
  ];
  let disposed = false;

  return {
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      for (const registration of registrations) {
        registration.dispose();
      }
    },
  };
}
