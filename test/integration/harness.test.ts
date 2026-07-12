import assert from 'node:assert/strict';
import * as vscode from 'vscode';

suite('VS Code integration harness', () => {
  test('exposes the VS Code API version', () => {
    assert.match(vscode.version, /^\d+\.\d+\.\d+/u);
  });
});
