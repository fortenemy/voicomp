import { ASSISTANT_VIEW_FOCUS_COMMAND } from './commandIds.js';

export type CommandExecutor = (command: string) => PromiseLike<unknown>;

export function createOpenAssistantCommand(executeCommand: CommandExecutor) {
  return () => executeCommand(ASSISTANT_VIEW_FOCUS_COMMAND);
}
