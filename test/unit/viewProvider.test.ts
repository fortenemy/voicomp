import { describe, expect, it, vi } from 'vitest';

import { ASSISTANT_VIEW_ID } from '../../src/commands/commandIds.js';
import { VoicompViewProvider } from '../../src/ui/VoicompViewProvider.js';

describe('VoicompViewProvider', () => {
  it('registers the assistant view and disposes its registration once', () => {
    const dispose = vi.fn();
    const registerWebviewViewProvider = vi.fn(() => ({ dispose }));

    const provider = new VoicompViewProvider(registerWebviewViewProvider);

    expect(registerWebviewViewProvider).toHaveBeenCalledOnce();
    expect(registerWebviewViewProvider).toHaveBeenCalledWith(ASSISTANT_VIEW_ID, provider);

    provider.dispose();
    provider.dispose();

    expect(dispose).toHaveBeenCalledOnce();
  });
});
