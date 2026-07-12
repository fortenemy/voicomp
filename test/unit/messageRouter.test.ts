import { describe, expect, it, vi } from 'vitest';

import {
  hostToWebviewMessageSchema,
  type HostToWebviewMessage,
} from '../../src/shared/messages.js';
import { WebviewMessageRouter } from '../../src/ui/WebviewMessageRouter.js';

const firstRequestId = 'd9428888-122b-4d03-b7b7-3a35c10112e7';
const secondRequestId = '4c5fb8a4-a7a9-4bda-92b1-8e7428586d2e';
const staleSessionId = '2c1f0f0b-3db9-4ae9-9c42-5ba0616c430d';

function createHarness(createSessionId?: () => string) {
  const postMessage = vi.fn<(message: HostToWebviewMessage) => Promise<boolean>>(async () => true);
  const logEvent = vi.fn();
  const router = new WebviewMessageRouter({
    postMessage,
    logEvent,
    ...(createSessionId ? { createSessionId } : {}),
  });

  return { logEvent, postMessage, router };
}

describe('WebviewMessageRouter', () => {
  it('returns correlated initial state with a fresh session UUID for every ready request', async () => {
    const { postMessage, router } = createHarness();

    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });
    await router.handleMessage({ type: 'webview.ready', requestId: secondRequestId });

    const firstResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0]);
    const secondResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[1]?.[0]);
    expect(firstResponse).toMatchObject({
      type: 'host.initialState',
      requestId: firstRequestId,
      connection: 'mock_disconnected',
    });
    expect(secondResponse).toMatchObject({
      type: 'host.initialState',
      requestId: secondRequestId,
      connection: 'mock_disconnected',
    });
    if (firstResponse.type !== 'host.initialState' || secondResponse.type !== 'host.initialState') {
      return;
    }
    expect(firstResponse).toHaveProperty('transcript', [
      { role: 'assistant', text: 'Voicomp is ready in offline mock mode.' },
    ]);
    expect(firstResponse).toHaveProperty('sessionId', expect.any(String));
    expect(secondResponse).toHaveProperty('sessionId', expect.any(String));
    expect(firstResponse).not.toHaveProperty('sessionId', secondResponse.sessionId);
  });

  it('returns mock_ready for a valid connection check in the active session', async () => {
    const { postMessage, router } = createHarness();
    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });
    const initialResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0]);
    expect(initialResponse.type).toBe('host.initialState');
    if (initialResponse.type !== 'host.initialState') {
      return;
    }
    postMessage.mockClear();

    await router.handleMessage({
      type: 'webview.connectionCheck',
      requestId: secondRequestId,
      sessionId: initialResponse.sessionId,
    });

    expect(postMessage).toHaveBeenCalledWith({
      type: 'host.connectionCheckResult',
      requestId: secondRequestId,
      sessionId: initialResponse.sessionId,
      connection: 'mock_ready',
    });
  });

  it.each([
    ['malformed', { type: 'webview.ready', requestId: 'not-a-uuid' }],
    ['unknown', { type: 'webview.unknown', requestId: firstRequestId }],
    [
      'stale-session',
      {
        type: 'webview.connectionCheck',
        requestId: firstRequestId,
        sessionId: staleSessionId,
      },
    ],
  ])('fails closed for %s input', async (_description, candidate) => {
    const { postMessage, router } = createHarness();

    await router.handleMessage(candidate);

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('suppresses a connection result that becomes late after a newer ready request', async () => {
    const { logEvent, postMessage, router } = createHarness();
    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });
    const initialResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0]);
    expect(initialResponse.type).toBe('host.initialState');
    if (initialResponse.type !== 'host.initialState') {
      return;
    }
    postMessage.mockClear();

    const lateCheck = router.handleMessage({
      type: 'webview.connectionCheck',
      requestId: secondRequestId,
      sessionId: initialResponse.sessionId,
    });
    const newReady = router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });
    await Promise.all([lateCheck, newReady]);

    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage.mock.calls[0]?.[0]).toMatchObject({ type: 'host.initialState' });
    expect(logEvent).toHaveBeenCalledWith('message.late');
  });

  it('suppresses pending and future input after disposal', async () => {
    const { postMessage, router } = createHarness();
    const pendingReady = router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });

    router.dispose();
    await pendingReady;
    await router.handleMessage({ type: 'webview.ready', requestId: secondRequestId });

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('revalidates outbound candidates and replaces an invalid initial state with a safe error', async () => {
    const { logEvent, postMessage, router } = createHarness(() => 'not-a-uuid');

    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });

    expect(postMessage).toHaveBeenCalledOnce();
    expect(hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0])).toEqual({
      type: 'host.error',
      requestId: firstRequestId,
      code: 'invalid_message',
      message: 'The message could not be delivered.',
    });
    expect(logEvent).toHaveBeenCalledWith('outbound.invalid');
  });

  it.each([
    ['returns false', () => Promise.resolve(false), 'outbound.rejected'],
    [
      'throws',
      () => Promise.reject(new Error('delivery-payload-must-not-be-logged')),
      'outbound.failed',
    ],
  ])(
    'rolls back a new session and posts one correlated safe error when initial delivery %s',
    async (_description, failedDelivery, expectedEvent) => {
      const { logEvent, postMessage, router } = createHarness();
      postMessage.mockImplementationOnce(failedDelivery);

      await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });

      expect(postMessage).toHaveBeenCalledTimes(2);
      const initialResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0]);
      const errorResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[1]?.[0]);
      expect(initialResponse.type).toBe('host.initialState');
      expect(errorResponse).toEqual({
        type: 'host.error',
        requestId: firstRequestId,
        code: 'invalid_message',
        message: 'The message could not be delivered.',
      });
      expect(logEvent).toHaveBeenCalledWith(expectedEvent);
      expect(JSON.stringify(logEvent.mock.calls)).not.toContain(
        'delivery-payload-must-not-be-logged',
      );
      if (initialResponse.type !== 'host.initialState') {
        return;
      }
      postMessage.mockClear();

      await router.handleMessage({
        type: 'webview.connectionCheck',
        requestId: secondRequestId,
        sessionId: initialResponse.sessionId,
      });

      expect(postMessage).not.toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith('message.staleSession');
    },
  );

  it('posts one correlated safe error after result delivery fails and keeps the session retryable', async () => {
    const { postMessage, router } = createHarness();
    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });
    const initialResponse = hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0]);
    expect(initialResponse.type).toBe('host.initialState');
    if (initialResponse.type !== 'host.initialState') {
      return;
    }
    postMessage.mockClear();
    postMessage.mockResolvedValueOnce(false);

    await router.handleMessage({
      type: 'webview.connectionCheck',
      requestId: secondRequestId,
      sessionId: initialResponse.sessionId,
    });

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(hostToWebviewMessageSchema.parse(postMessage.mock.calls[0]?.[0])).toEqual({
      type: 'host.connectionCheckResult',
      requestId: secondRequestId,
      sessionId: initialResponse.sessionId,
      connection: 'mock_ready',
    });
    expect(hostToWebviewMessageSchema.parse(postMessage.mock.calls[1]?.[0])).toEqual({
      type: 'host.error',
      requestId: secondRequestId,
      code: 'invalid_message',
      message: 'The message could not be delivered.',
    });
    postMessage.mockClear();

    await router.handleMessage({
      type: 'webview.connectionCheck',
      requestId: firstRequestId,
      sessionId: initialResponse.sessionId,
    });

    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage.mock.calls[0]?.[0]).toMatchObject({
      type: 'host.connectionCheckResult',
      requestId: firstRequestId,
    });
  });

  it('stops after one safe-error attempt when both delivery attempts fail', async () => {
    const { logEvent, postMessage, router } = createHarness();
    postMessage.mockResolvedValueOnce(false).mockResolvedValueOnce(false);

    await router.handleMessage({ type: 'webview.ready', requestId: firstRequestId });

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage.mock.calls[1]?.[0]).toMatchObject({
      type: 'host.error',
      requestId: firstRequestId,
    });
    expect(logEvent.mock.calls.filter(([event]) => event === 'outbound.rejected')).toHaveLength(2);
  });

  it('logs event categories without including rejected payload contents', async () => {
    const { logEvent, router } = createHarness();
    const secretMarker = 'payload-must-not-be-logged';

    await router.handleMessage({ type: 'webview.unknown', secretMarker });

    expect(logEvent).toHaveBeenCalledWith('message.invalid');
    expect(
      logEvent.mock.calls.every((call) => call.length === 1 && typeof call[0] === 'string'),
    ).toBe(true);
    expect(JSON.stringify(logEvent.mock.calls)).not.toContain(secretMarker);
  });
});
