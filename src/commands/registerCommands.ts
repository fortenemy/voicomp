import { OPEN_ASSISTANT_COMMAND } from './commandIds.js';
import { createOpenAssistantCommand, type CommandExecutor } from './openAssistantCommand.js';

export interface Disposable {
  dispose(): void;
}

export type CommandRegistrar = (command: string, handler: () => unknown) => Disposable;

export function registerCommands(
  registerCommand: CommandRegistrar,
  executeCommand: CommandExecutor,
): Disposable {
  return registerCommand(OPEN_ASSISTANT_COMMAND, createOpenAssistantCommand(executeCommand));
}
