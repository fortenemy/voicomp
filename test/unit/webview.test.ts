// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hostToWebviewMessageSchema } from '../../src/shared/messages.js';
import { startWebviewController } from '../../webview/main.js';

const readyRequestId = 'd9428888-122b-4d03-b7b7-3a35c10112e7';
const connectionRequestId = '4c5fb8a4-a7a9-4bda-92b1-8e7428586d2e';
const retryRequestId = '967c7feb-f790-49aa-87d0-66dc636faf96';
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
  const requestIds = [readyRequestId, connectionRequestId, retryRequestId];
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

  it('terminates pending startup after a correlated safe Host error', () => {
    const { controller } = createHarness();
    const safeError = 'The initial state could not be delivered.';

    dispatchHostMessage({
      type: 'host.error',
      requestId: readyRequestId,
      code: 'invalid_message',
      message: safeError,
    });
    dispatchHostMessage({
      type: 'host.error',
      requestId: readyRequestId,
      code: 'invalid_message',
      message: 'Duplicate error must be ignored.',
    });
    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Late state must be ignored.' }],
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe(safeError);
    expect(document.querySelector('#transcript-list')?.childElementCount).toBe(0);
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(true);

    controller.dispose();
  });

  it('ignores a requestless Host error during startup without consuming the ready request', () => {
    const { controller } = createHarness();

    dispatchHostMessage({
      type: 'host.error',
      code: 'invalid_message',
      message: 'Requestless startup error must be ignored.',
    });
    expect(document.querySelector('#connection-status')?.textContent).toBe(
      'Starting offline assistant…',
    );
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(true);

    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Initial transcript' }],
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock disconnected');
    expect(document.querySelector('#transcript-list')?.textContent).toBe('Initial transcript');
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(false);

    controller.dispose();
  });

  it('ignores a requestless Host error after initialization', () => {
    const { controller } = createHarness();
    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Initial transcript' }],
    });

    dispatchHostMessage({
      type: 'host.error',
      code: 'invalid_message',
      message: 'Requestless idle error must be ignored.',
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock disconnected');
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(false);

    controller.dispose();
  });

  it('ignores a requestless Host error while a connection request is pending', () => {
    const { controller } = createHarness();
    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Initial transcript' }],
    });
    document.querySelector<HTMLButtonElement>('#connection-check')?.click();

    dispatchHostMessage({
      type: 'host.error',
      code: 'invalid_message',
      message: 'Requestless pending error must be ignored.',
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock disconnected');
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(true);

    dispatchHostMessage({
      type: 'host.connectionCheckResult',
      requestId: connectionRequestId,
      sessionId,
      connection: 'mock_ready',
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock ready');
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(false);

    controller.dispose();
  });

  it('clears a correlated connection error and allows one retry', () => {
    const { controller, postMessage } = createHarness();
    dispatchHostMessage({
      type: 'host.initialState',
      requestId: readyRequestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'Initial transcript' }],
    });
    document.querySelector<HTMLButtonElement>('#connection-check')?.click();
    const safeError = 'The connection result could not be delivered.';

    dispatchHostMessage({
      type: 'host.error',
      requestId: connectionRequestId,
      code: 'invalid_message',
      message: safeError,
    });

    expect(document.querySelector('#connection-status')?.textContent).toBe(safeError);
    expect(document.querySelector<HTMLButtonElement>('#connection-check')?.disabled).toBe(false);

    document.querySelector<HTMLButtonElement>('#connection-check')?.click();
    dispatchHostMessage({
      type: 'host.error',
      requestId: connectionRequestId,
      code: 'invalid_message',
      message: 'Duplicate error must be ignored.',
    });
    dispatchHostMessage({
      type: 'host.error',
      requestId: staleSessionId,
      code: 'invalid_message',
      message: 'Uncorrelated error must be ignored.',
    });

    expect(postMessage).toHaveBeenLastCalledWith({
      type: 'webview.connectionCheck',
      requestId: retryRequestId,
      sessionId,
    });
    expect(document.querySelector('#connection-status')?.textContent).toBe(safeError);

    dispatchHostMessage({
      type: 'host.connectionCheckResult',
      requestId: retryRequestId,
      sessionId,
      connection: 'mock_ready',
    });
    expect(document.querySelector('#connection-status')?.textContent).toBe('Mock ready');

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
