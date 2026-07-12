import * as vscode from 'vscode';

import { registerCommands } from './commands/registerCommands.js';
import { VoicompViewProvider } from './ui/VoicompViewProvider.js';

let extensionDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const commandRegistration = registerCommands(
    (command, handler) => vscode.commands.registerCommand(command, handler),
    (command) => vscode.commands.executeCommand(command),
  );
  const viewProvider = new VoicompViewProvider((viewId, provider) =>
    vscode.window.registerWebviewViewProvider(viewId, provider),
  );

  extensionDisposable = vscode.Disposable.from(commandRegistration, viewProvider);
  context.subscriptions.push(extensionDisposable);
}

export function deactivate(): void {
  extensionDisposable?.dispose();
  extensionDisposable = undefined;
}
