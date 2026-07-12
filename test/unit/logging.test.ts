import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { OutputLogger } from '../../src/logging/OutputLogger.js';
import { parseLogLevel } from '../../src/logging/logLevel.js';

function createHarness(level: 'off' | 'error' | 'info') {
  const appendLine = vi.fn<(message: string) => void>();
  const dispose = vi.fn();
  const logger = new OutputLogger({ appendLine, dispose }, level);

  return { appendLine, dispose, logger };
}

describe('parseLogLevel', () => {
  it.each(['off', 'error', 'info'] as const)('accepts %s', (level) => {
    expect(parseLogLevel(level)).toBe(level);
  });

  it.each([undefined, null, '', 'debug', 1, {}, new Error('must-not-be-logged')])(
    'falls back to info for missing or invalid input %#',
    (candidate) => {
      expect(parseLogLevel(candidate)).toBe('info');
    },
  );
});

describe('logging setting contribution', () => {
  it('contributes a bounded off, error, or info setting with a safe default', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as {
      contributes?: {
        configuration?: {
          properties?: Record<string, unknown>;
        };
      };
    };

    expect(manifest.contributes?.configuration?.properties).toMatchObject({
      'voicomp.logging.level': {
        type: 'string',
        enum: ['off', 'error', 'info'],
        default: 'info',
      },
    });
  });
});

describe('OutputLogger', () => {
  it('suppresses every message when logging is off', () => {
    const { appendLine, logger } = createHarness('off');

    logger.lifecycle('extension.activated');
    logger.routerEvent('message.ready');
    logger.routerEvent('outbound.failed');

    expect(appendLine).not.toHaveBeenCalled();
  });

  it('writes only error categories at error level', () => {
    const { appendLine, logger } = createHarness('error');

    logger.lifecycle('extension.activated');
    logger.routerEvent('message.ready');
    logger.routerEvent('message.invalid');
    logger.routerEvent('outbound.failed');

    expect(appendLine.mock.calls).toEqual([
      ['[error] message.invalid'],
      ['[error] outbound.failed'],
    ]);
  });

  it('writes allowlisted lifecycle and router categories at info level', () => {
    const { appendLine, logger } = createHarness('info');

    logger.lifecycle('extension.activated');
    logger.routerEvent('message.connectionCheck');
    logger.routerEvent('outbound.rejected');
    logger.lifecycle('extension.deactivated');

    expect(appendLine.mock.calls).toEqual([
      ['[info] extension.activated'],
      ['[info] message.connectionCheck'],
      ['[error] outbound.rejected'],
      ['[info] extension.deactivated'],
    ]);
  });

  it('formats only bounded counts for metadata events', () => {
    const { appendLine, logger } = createHarness('info');

    logger.count('message.rejectedCount', 12);
    logger.count('message.rejectedCount', -1);
    logger.count('message.rejectedCount', 10_001);
    logger.count('message.rejectedCount', Number.NaN);

    expect(appendLine.mock.calls).toEqual([['[info] message.rejectedCount count=12']]);
  });

  it('has no dynamic identifier surface and cannot log a UUID-shaped sensitive string', () => {
    const { appendLine, logger } = createHarness('info');
    const uuidShapedSensitiveValue = '2c1f0f0b-3db9-4ae9-9c42-5ba0616c430d';
    const callWithUntrustedExtras = logger.routerEvent.bind(logger) as (
      event: 'message.ready',
      ...extras: unknown[]
    ) => void;

    expect(logger).not.toHaveProperty('identifier');
    callWithUntrustedExtras('message.ready', uuidShapedSensitiveValue);

    expect(appendLine).toHaveBeenCalledWith('[info] message.ready');
    expect(JSON.stringify(appendLine.mock.calls)).not.toContain(uuidShapedSensitiveValue);
  });

  it('has no raw payload or Error parameter and cannot serialize extra arguments', () => {
    const { appendLine, logger } = createHarness('info');
    const secretMarker = 'sk-test-must-not-appear';
    const callWithUntrustedExtras = logger.routerEvent.bind(logger) as (
      event: 'outbound.failed',
      ...extras: unknown[]
    ) => void;

    callWithUntrustedExtras('outbound.failed', {
      credential: secretMarker,
      error: new Error(secretMarker),
      path: `C:\\workspace\\${secretMarker}.ts`,
      prompt: secretMarker,
      source: secretMarker,
      transcript: secretMarker,
    });

    expect(appendLine).toHaveBeenCalledWith('[error] outbound.failed');
    expect(JSON.stringify(appendLine.mock.calls)).not.toContain(secretMarker);
  });

  it('rejects forged categories before formatting or transport', () => {
    const { appendLine, logger } = createHarness('info');
    const secretMarker = 'prompt-must-not-be-logged';

    (logger.lifecycle as (event: string) => void)(secretMarker);
    (logger.routerEvent as (event: string) => void)(secretMarker);
    (logger.count as (event: string, count: number) => void)(secretMarker, 1);

    expect(appendLine).not.toHaveBeenCalled();
  });

  it('disposes the Output Channel exactly once and stops writing', () => {
    const { appendLine, dispose, logger } = createHarness('info');

    logger.dispose();
    logger.dispose();
    logger.lifecycle('extension.deactivated');

    expect(dispose).toHaveBeenCalledOnce();
    expect(appendLine).not.toHaveBeenCalled();
  });
});
