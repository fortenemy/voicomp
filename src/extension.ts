import * as vscode from 'vscode';

import { registerCommands } from './commands/registerCommands.js';
import { createExtensionLifecycle } from './extensionLifecycle.js';
import { OutputLogger } from './logging/OutputLogger.js';
import { parseLogLevel } from './logging/logLevel.js';
import { VoicompViewProvider } from './ui/VoicompViewProvider.js';

let extensionDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const logLevel = parseLogLevel(vscode.workspace.getConfiguration('voicomp').get('logging.level'));
  const outputLogger = new OutputLogger(vscode.window.createOutputChannel('Voicomp'), logLevel);
  const lifecycle = createExtensionLifecycle(
    outputLogger,
    () =>
      registerCommands(
        (command, handler) => vscode.commands.registerCommand(command, handler),
        (command) => vscode.commands.executeCommand(command),
        (message) => vscode.window.showInformationMessage(message),
      ),
    () =>
      new VoicompViewProvider(
        (viewId, provider) => vscode.window.registerWebviewViewProvider(viewId, provider),
        context.extensionUri,
        vscode.Uri.joinPath,
        (event) => outputLogger.routerEvent(event),
      ),
  );

  try {
    context.subscriptions.push(lifecycle);
    extensionDisposable = lifecycle;
  } catch (error) {
    try {
      lifecycle.dispose();
    } catch {
      // Preserve the subscription failure that triggered rollback.
    }
    throw error;
  }
}

export function deactivate(): void {
  extensionDisposable?.dispose();
  extensionDisposable = undefined;
}
