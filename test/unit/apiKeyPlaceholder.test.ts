import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { SET_OPENAI_API_KEY_COMMAND } from '../../src/commands/commandIds.js';
import {
  apiKeyPlaceholderMessage,
  createSetApiKeyPlaceholderCommand,
} from '../../src/commands/setApiKeyPlaceholderCommand.js';

describe('Set OpenAI API Key placeholder', () => {
  it('uses the reserved command identifier', () => {
    expect(SET_OPENAI_API_KEY_COMMAND).toBe('voicomp.setOpenAIApiKey');
  });

  it('contributes the informational command to the extension manifest', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as {
      contributes?: {
        commands?: Array<Record<string, unknown>>;
      };
    };

    expect(manifest.contributes?.commands).toContainEqual({
      command: SET_OPENAI_API_KEY_COMMAND,
      title: 'Set OpenAI API Key',
      category: 'Voicomp',
    });
  });

  it('shows only fixed Phase 3 BYOK information and completes immediately', () => {
    const neverSettles = new Promise<never>(() => undefined);
    const showInformationMessage = vi.fn(() => neverSettles);
    const handler = createSetApiKeyPlaceholderCommand(showInformationMessage);

    const result = handler();

    expect(result).toBeUndefined();
    expect(showInformationMessage).toHaveBeenCalledOnce();
    expect(showInformationMessage).toHaveBeenCalledWith(apiKeyPlaceholderMessage);
    expect(apiKeyPlaceholderMessage).toMatch(/secure BYOK/iu);
    expect(apiKeyPlaceholderMessage).toContain('Phase 3');
  });

  it('has no secret, input, environment, network, provider, or Webview capability', () => {
    const source = readFileSync(
      new URL('../../src/commands/setApiKeyPlaceholderCommand.ts', import.meta.url),
      'utf8',
    );

    expect(source).not.toMatch(
      /showInputBox|SecretStorage|\.secrets\b|process\.env|fetch\s*\(|provider|Webview/iu,
    );
  });
});
