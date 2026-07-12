import assert from 'node:assert/strict';
import * as vscode from 'vscode';

interface VoicompManifest {
  contributes?: {
    commands?: Array<{
      command: string;
      title: string;
      category?: string;
    }>;
    viewsContainers?: {
      activitybar?: Array<{
        id: string;
        title: string;
        icon: string;
      }>;
    };
    views?: Record<
      string,
      Array<{
        id: string;
        name: string;
        type?: string;
      }>
    >;
  };
}

suite('Voicomp extension shell', () => {
  test('activates and contributes the assistant shell', async () => {
    const extension = vscode.extensions.getExtension('fortenemy.voicomp');
    assert.ok(extension, 'Expected fortenemy.voicomp to be installed in the test host.');

    await extension.activate();
    assert.equal(extension.isActive, true);

    const manifest = extension.packageJSON as VoicompManifest;
    assert.deepEqual(manifest.contributes?.commands, [
      {
        command: 'voicomp.openAssistant',
        title: 'Open Assistant',
        category: 'Voicomp',
      },
    ]);
    assert.deepEqual(manifest.contributes?.viewsContainers?.activitybar, [
      {
        id: 'voicomp',
        title: 'Voicomp',
        icon: 'media/voicomp.svg',
      },
    ]);
    assert.deepEqual(manifest.contributes?.views?.voicomp, [
      {
        id: 'voicomp.assistant',
        name: 'Assistant',
        type: 'webview',
      },
    ]);

    const commandIds = await vscode.commands.getCommands(true);
    assert.ok(commandIds.includes('voicomp.openAssistant'));
    assert.ok(commandIds.includes('voicomp.assistant.focus'));

    await vscode.commands.executeCommand('voicomp.assistant.focus');
  });
});
