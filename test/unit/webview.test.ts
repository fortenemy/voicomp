// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hostToWebviewMessageSchema } from '../../src/shared/messages.js';
import { startWebviewController } from '../../webview/main.js';

const readyRequestId = 'd9428888-122b-4d03-b7b7-3a35c10112e7';
const connectionRequestId = '4c5fb8a4-a7a9-4bda-92b1-8e7428586d2e';
const sessionId = '2c1f0f0b-3db9-4ae9-9c42-5ba0616c430d';
const staleSessionId = '094f704a-dc5b-4d8c-845a-eb5f04205a62';

function buildView(): void {
  const status = document.createElement('p');
  status.id = 'connection-status';
  status.textContent = 'Starting offline assistant…';

  const transcript = document.createElement('ul');
  transcript.id = 'transcript-list';

  const button = document.createElement('button');
  button.id = 'connection-check';
  button.type = 'button';
  button.disabled = true;

  document.body.replaceChildren(status, transcript, button);
}

function dispatchHostMessage(data: unknown): void {
  window.dispatchEvent(new MessageEvent('message', { data }));
}

function createHarness() {
  const requestIds = [readyRequestId, connectionRequestId];
  const postMessage = vi.fn();
  const controller = startWebviewController({
    document,
    window,
    vscodeApi: { postMessage },
    createRequestId: () => requestIds.shift() ?? staleSessionId,
  });

  return { controller, postMessage };
}

beforeEach(() => {
  buildView();
});

describe('startWebviewController', () => {
  it('posts one validated ready message', () => {
    const { controller, postMessage } = createHarness();

    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledWith({
      type: 'webview.ready',
      requestId: readyRequestId,
    });

    controller.dispose();
  });

  it('renders correlated initial state as literal text without creating injected elements', () => {
    const { controller } = createHarness();
    const unsafeText = '<img src=x onerror=alert(1)>';

    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: unsafeText }],
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock disconnected');
    expect(document.querySelector('#transcript-list')?.textContent).toBe(unsafeText);
    expect(document.querySelector('#transcript-list img')).toBeNull();
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(false);

    controller.dispose();
  });

  it('ignores malformed, duplicate, mismatched-request, and stale-session responses', () => {
    const { controller, postMessage } = createHarness();
    const initialState = {
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Initial transcript' }],
    } as const;

    dispatchHostMessage({ ...initialState, extra: true });
    dispatchHostMessage({ ...initialState, requestId: connectionRequestId });
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(true);

    dispatchHostMessage(initialState);
    dispatchHostMessage({
      ...initialState,
      transcript: [{ role: 'assistant', text: 'Duplicate transcript' }],
    });
    expect(document.querySelector('#transcript-list')?.textContent).toBe('Initial transcript');

    document.querySelector<HTMLButtonElement>('#connection-check')?.click();
    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenLastCalledWith({
      type: 'webview.connectionCheck',
      requestId: connectionRequestId,
      sessionId,
    });

    const connectionResult = {
      type: 'host.connectionCheckResult',
      requestId: connectionRequestId,
      sessionId,
      connection: 'mock_ready',
    } as const;
    dispatchHostMessage({ ...connectionResult, sessionId: staleSessionId });
    dispatchHostMessage({ ...connectionResult, requestId: readyRequestId });
    dispatchHostMessage({ ...connectionResult, extra: true });
    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock disconnected');

    dispatchHostMessage(connectionResult);
    dispatchHostMessage(connectionResult);
    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock ready');

    controller.dispose();
  });

  it('validates Host messages before reading their fields', () => {
    const { controller } = createHarness();
    const malformedMessage = {
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: '' }],
    };

    expect(hostToWebviewMessageSchema.safeParse(malformedMessage).success).toBe(false);
    dispatchHostMessage(malformedMessage);

    expect(document.querySelector('#transcript-list')?.childElementCount).toBe(0);
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(true);

    controller.dispose();
  });

  it('removes its message and click listeners when disposed', () => {
    const button = document.querySelector<HTMLButtonElement>('#connection-check');
    expect(button).not.toBeNull();
    if (!button) {
      return;
    }
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    const removeButtonListener = vi.spyOn(button, 'removeEventListener');
    const { controller, postMessage } = createHarness();

    controller.dispose();
    controller.dispose();
    button.click();
    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Must not render' }],
    });

    expect(removeWindowListener).toHaveBeenCalledOnce();
    expect(removeWindowListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(removeButtonListener).toHaveBeenCalledOnce();
    expect(removeButtonListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(postMessage).toHaveBeenCalledOnce();
    expect(document.querySelector('#transcript-list')?.childElementCount).toBe(0);
  });
});
