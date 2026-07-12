import * as vscode from 'vscode';

import { registerCommands } from './commands/registerCommands.js';
import { OutputLogger } from './logging/OutputLogger.js';
import { parseLogLevel } from './logging/logLevel.js';
import { VoicompViewProvider } from './ui/VoicompViewProvider.js';

let extensionDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const outputLogger = new OutputLogger(
    vscode.window.createOutputChannel('Voicomp'),
    parseLogLevel(vscode.workspace.getConfiguration('voicomp').get('logging.level')),
  );
  const commandRegistration = registerCommands(
    (command, handler) => vscode.commands.registerCommand(command, handler),
    (command) => vscode.commands.executeCommand(command),
    (message) => vscode.window.showInformationMessage(message),
  );
  const viewProvider = new VoicompViewProvider(
    (viewId, provider) => vscode.window.registerWebviewViewProvider(viewId, provider),
    context.extensionUri,
    vscode.Uri.joinPath,
    (event) => outputLogger.routerEvent(event),
  );
  let disposed = false;
  const lifecycle: vscode.Disposable = {
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      outputLogger.lifecycle('extension.deactivated');
      commandRegistration.dispose();
      viewProvider.dispose();
      outputLogger.dispose();
      if (extensionDisposable === lifecycle) {
        extensionDisposable = undefined;
      }
    },
  };

  extensionDisposable = lifecycle;
  context.subscriptions.push(lifecycle);
  outputLogger.lifecycle('extension.activated');
}

export function deactivate(): void {
  extensionDisposable?.dispose();
  extensionDisposable = undefined;
}
