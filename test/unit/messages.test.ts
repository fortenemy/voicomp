import { describe, expect, it } from 'vitest';

import {
  hostToWebviewMessageSchema,
  webviewToHostMessageSchema,
} from '../../src/shared/messages.js';

const requestId = 'd9428888-122b-4d03-b7b7-3a35c10112e7';
const sessionId = '2c1f0f0b-3db9-4ae9-9c42-5ba0616c430d';

describe('webviewToHostMessageSchema', () => {
  it.each([
    {
      type: 'webview.ready',
      requestId,
    },
    {
      type: 'webview.connectionCheck',
      requestId,
      sessionId,
    },
  ])('parses the $type message', (message) => {
    expect(webviewToHostMessageSchema.parse(message)).toEqual(message);
  });

  it.each([
    { type: 'webview.unknown', requestId },
    { type: 'webview.ready', requestId, extra: true },
    { type: 'webview.ready', requestId: 'not-a-uuid' },
    { type: 'webview.ready' },
    { type: 'webview.connectionCheck', requestId, sessionId: 'not-a-uuid' },
    { type: 'webview.connectionCheck', requestId },
  ])('rejects invalid Webview input %#', (message) => {
    expect(webviewToHostMessageSchema.safeParse(message).success).toBe(false);
  });
});

describe('hostToWebviewMessageSchema', () => {
  const transcriptEntry = {
    role: 'assistant',
    text: 'Voicomp is ready in offline mock mode.',
  } as const;

  it.each([
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [transcriptEntry],
    },
    {
      type: 'host.connectionCheckResult',
      requestId,
      sessionId,
      connection: 'mock_ready',
    },
    {
      type: 'host.error',
      requestId,
      code: 'invalid_message',
      message: 'The message could not be processed.',
    },
    {
      type: 'host.error',
      code: 'invalid_message',
      message: 'The message could not be processed.',
    },
  ])('parses the $type message', (message) => {
    expect(hostToWebviewMessageSchema.parse(message)).toEqual(message);
  });

  it.each([
    { type: 'host.unknown', requestId },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [transcriptEntry],
      extra: true,
    },
    {
      type: 'host.initialState',
      requestId: 'not-a-uuid',
      sessionId,
      connection: 'mock_disconnected',
      transcript: [transcriptEntry],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId: 'not-a-uuid',
      connection: 'mock_disconnected',
      transcript: [transcriptEntry],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'connected',
      transcript: [transcriptEntry],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'user', text: 'Unexpected user content' }],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ ...transcriptEntry, extra: true }],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
      transcript: [{ role: 'assistant', text: 'x'.repeat(2_001) }],
    },
    {
      type: 'host.initialState',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
    },
    {
      type: 'host.connectionCheckResult',
      requestId,
      sessionId,
      connection: 'mock_disconnected',
    },
    {
      type: 'host.error',
      requestId: 'not-a-uuid',
      code: 'invalid_message',
      message: 'The message could not be processed.',
    },
    {
      type: 'host.error',
      code: 'unexpected_error',
      message: 'The message could not be processed.',
    },
    {
      type: 'host.error',
      code: 'invalid_message',
      message: 'x'.repeat(257),
    },
    {
      type: 'host.error',
      code: 'invalid_message',
    },
  ])('rejects invalid Host output %#', (message) => {
    expect(hostToWebviewMessageSchema.safeParse(message).success).toBe(false);
  });
});
