import type { Disposable, WebviewView, WebviewViewProvider } from 'vscode';

import { ASSISTANT_VIEW_ID } from '../commands/commandIds.js';

export type WebviewViewProviderRegistrar = (
  viewId: string,
  provider: WebviewViewProvider,
) => Disposable;

export class VoicompViewProvider implements WebviewViewProvider, Disposable {
  private registration: Disposable | undefined;

  public constructor(registerWebviewViewProvider: WebviewViewProviderRegistrar) {
    this.registration = registerWebviewViewProvider(ASSISTANT_VIEW_ID, this);
  }

  public resolveWebviewView(webviewView: WebviewView): void {
    void webviewView;
  }

  public dispose(): void {
    const registration = this.registration;
    if (!registration) {
      return;
    }

    this.registration = undefined;
    registration.dispose();
  }
}
